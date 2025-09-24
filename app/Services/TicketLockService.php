<?php
// filepath: app/Services/TicketLockService.php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\TicketType;
use Carbon\Carbon;

class TicketLockService
{
    /**
     * Duración del bloqueo en minutos
     */
    const LOCK_DURATION = 10; // 10 minutos
    
    /**
     * Prefijo para las claves de cache
     */
    const CACHE_PREFIX = 'ticket_lock:';

    /**
     * Bloquear tickets para una sesión específica
     */
    public function lockTickets(array $ticketRequests, string $sessionId): array
    {
        $lockedTickets = [];
        $failures = [];

        foreach ($ticketRequests as $request) {
            $ticketTypeId = $request['id'];
            $quantity = $request['quantity'];
            
            try {
                $result = $this->lockTicketType($ticketTypeId, $quantity, $sessionId);
                
                if ($result['success']) {
                    $lockedTickets[] = [
                        'ticket_type_id' => $ticketTypeId,
                        'quantity' => $quantity,
                        'lock_key' => $result['lock_key']
                    ];
                } else {
                    $failures[] = [
                        'ticket_type_id' => $ticketTypeId,
                        'requested' => $quantity,
                        'available' => $result['available'],
                        'message' => $result['message']
                    ];
                }
            } catch (\Exception $e) {
                Log::error('Error bloqueando tickets', [
                    'ticket_type_id' => $ticketTypeId,
                    'quantity' => $quantity,
                    'session_id' => $sessionId,
                    'error' => $e->getMessage()
                ]);
                
                $failures[] = [
                    'ticket_type_id' => $ticketTypeId,
                    'message' => 'Error interno al bloquear tickets'
                ];
            }
        }

        return [
            'success' => empty($failures),
            'locked_tickets' => $lockedTickets,
            'failures' => $failures
        ];
    }

    /**
     * Bloquear un tipo de ticket específico
     */
    protected function lockTicketType(int $ticketTypeId, int $quantity, string $sessionId): array
    {
        $lockKey = $this->getLockKey($ticketTypeId);
        $sessionKey = $this->getSessionKey($ticketTypeId, $sessionId);
        
        // Usar lock atómico para evitar condiciones de carrera
        return Cache::lock($lockKey . ':atomic', 10)->block(5, function () use ($ticketTypeId, $quantity, $sessionId, $lockKey, $sessionKey) {
            $ticketType = TicketType::find($ticketTypeId);
            
            if (!$ticketType) {
                return [
                    'success' => false,
                    'message' => 'Tipo de ticket no encontrado'
                ];
            }

            // Obtener locks existentes
            $existingLocks = Cache::get($lockKey, []);
            
            // Limpiar locks expirados
            $existingLocks = $this->cleanExpiredLocks($existingLocks);
            
            // Calcular tickets bloqueados por otras sesiones
            $lockedByOthers = 0;
            foreach ($existingLocks as $lock) {
                if ($lock['session_id'] !== $sessionId) {
                    $lockedByOthers += $lock['quantity'];
                }
            }
            
            // Verificar disponibilidad
            $available = $ticketType->quantity - $ticketType->quantity_sold - $lockedByOthers;
            
            if ($available < $quantity) {
                return [
                    'success' => false,
                    'available' => $available,
                    'message' => "Solo quedan {$available} tickets disponibles"
                ];
            }
            
            // Crear o actualizar el lock para esta sesión
            $lockData = [
                'session_id' => $sessionId,
                'quantity' => $quantity,
                'locked_at' => now()->toISOString(),
                'expires_at' => now()->addMinutes(self::LOCK_DURATION)->toISOString()
            ];
            
            // Eliminar lock previo de esta sesión si existe
            $existingLocks = array_filter($existingLocks, function ($lock) use ($sessionId) {
                return $lock['session_id'] !== $sessionId;
            });
            
            // Agregar nuevo lock
            $existingLocks[] = $lockData;
            
            // Guardar en cache
            Cache::put($lockKey, $existingLocks, now()->addMinutes(self::LOCK_DURATION + 5));
            Cache::put($sessionKey, $lockData, now()->addMinutes(self::LOCK_DURATION + 5));
            
            return [
                'success' => true,
                'lock_key' => $lockKey,
                'session_key' => $sessionKey
            ];
        });
    }

    /**
     * Liberar tickets bloqueados por una sesión
     */
    public function releaseTickets(string $sessionId, ?array $ticketTypeIds = null): void
    {
        Log::info('Iniciando liberación de tickets', [
            'session_id' => substr($sessionId, -8),
            'ticket_type_ids' => $ticketTypeIds
        ]);

        try {
            if ($ticketTypeIds) {
                // Liberar tipos específicos
                foreach ($ticketTypeIds as $ticketTypeId) {
                    $this->releaseTicketType($ticketTypeId, $sessionId);
                }
            } else {
                // Liberar todos los tickets de la sesión
                $this->releaseAllSessionTickets($sessionId);
            }

            Log::info('Liberación de tickets completada', [
                'session_id' => substr($sessionId, -8)
            ]);

        } catch (\Exception $e) {
            Log::error('Error liberando tickets', [
                'session_id' => $sessionId,
                'ticket_type_ids' => $ticketTypeIds,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e; // Re-lanzar la excepción para que el controlador la maneje
        }
    }

    /**
     * Liberar todos los tickets de una sesión - MEJORADO
     */
    protected function releaseAllSessionTickets(string $sessionId): void
    {
        Log::info('Liberando todos los tickets de sesión', [
            'session_id' => substr($sessionId, -8)
        ]);

        // Estrategia mejorada: iterar sobre todos los TicketTypes y verificar locks
        $allTicketTypes = TicketType::pluck('id');
        $releasedCount = 0;

        foreach ($allTicketTypes as $ticketTypeId) {
            $sessionKey = $this->getSessionKey($ticketTypeId, $sessionId);
            
            if (Cache::has($sessionKey)) {
                Log::info('Encontrado lock para liberar', [
                    'ticket_type_id' => $ticketTypeId,
                    'session_id' => substr($sessionId, -8)
                ]);

                $this->releaseTicketType($ticketTypeId, $sessionId);
                $releasedCount++;
            }
        }

        Log::info('Liberación de sesión completada', [
            'session_id' => substr($sessionId, -8),
            'released_count' => $releasedCount
        ]);

        // Fallback para Redis si está disponible
        if (config('cache.default') === 'redis' && $releasedCount === 0) {
            $this->releaseAllSessionTicketsRedis($sessionId);
        }
    }

    /**
     * Método específico para Redis
     */
    protected function releaseAllSessionTicketsRedis(string $sessionId): void
    {
        try {
            $prefix = config('cache.prefix', '');
            $pattern = $prefix ? "{$prefix}:*:session:{$sessionId}" : "*:session:{$sessionId}";
            
            $keys = Cache::getRedis()->keys($pattern);
            
            Log::info('Encontradas claves Redis para liberar', [
                'session_id' => substr($sessionId, -8),
                'keys_count' => count($keys),
                'pattern' => $pattern
            ]);

            foreach ($keys as $sessionKey) {
                $cleanKey = str_replace($prefix . ':', '', $sessionKey);
                $ticketTypeId = $this->extractTicketTypeIdFromKey($cleanKey);
                
                if ($ticketTypeId) {
                    $this->releaseTicketType($ticketTypeId, $sessionId);
                }
            }
        } catch (\Exception $e) {
            Log::error('Error en liberación Redis', [
                'session_id' => substr($sessionId, -8),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Liberar un tipo de ticket específico - MEJORADO CON LOGS
     */
    protected function releaseTicketType(int $ticketTypeId, string $sessionId): void
    {
        $lockKey = $this->getLockKey($ticketTypeId);
        $sessionKey = $this->getSessionKey($ticketTypeId, $sessionId);
        
        Log::info('Liberando ticket type específico', [
            'ticket_type_id' => $ticketTypeId,
            'session_id' => substr($sessionId, -8),
            'lock_key' => $lockKey,
            'session_key' => $sessionKey
        ]);

        try {
            Cache::lock($lockKey . ':atomic', 10)->block(5, function () use ($lockKey, $sessionKey, $sessionId, $ticketTypeId) {
                // Verificar si existe el lock de sesión
                $sessionLock = Cache::get($sessionKey);
                if (!$sessionLock) {
                    Log::warning('No se encontró lock de sesión para liberar', [
                        'session_key' => $sessionKey,
                        'ticket_type_id' => $ticketTypeId
                    ]);
                    return;
                }

                $existingLocks = Cache::get($lockKey, []);
                $originalCount = count($existingLocks);
                
                // Filtrar locks de esta sesión
                $updatedLocks = array_filter($existingLocks, function ($lock) use ($sessionId) {
                    return $lock['session_id'] !== $sessionId;
                });
                
                $updatedLocks = array_values($updatedLocks); // Reindexar array
                $removedCount = $originalCount - count($updatedLocks);
                
                // Actualizar cache
                if (empty($updatedLocks)) {
                    Cache::forget($lockKey);
                    Log::info('Eliminada clave principal por estar vacía', ['lock_key' => $lockKey]);
                } else {
                    Cache::put($lockKey, $updatedLocks, now()->addMinutes(self::LOCK_DURATION + 5));
                    Log::info('Actualizada clave principal', [
                        'lock_key' => $lockKey,
                        'remaining_locks' => count($updatedLocks)
                    ]);
                }
                
                // Eliminar clave de sesión
                Cache::forget($sessionKey);
                
                Log::info('Lock liberado exitosamente', [
                    'ticket_type_id' => $ticketTypeId,
                    'session_id' => substr($sessionId, -8),
                    'removed_count' => $removedCount,
                    'remaining_locks' => count($updatedLocks)
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error liberando ticket type', [
                'ticket_type_id' => $ticketTypeId,
                'session_id' => substr($sessionId, -8),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Verificar si los tickets siguen bloqueados y disponibles
     */
    public function verifyLocks(array $lockedTickets, string $sessionId): array
    {
        $validLocks = [];
        $invalidLocks = [];
        
        foreach ($lockedTickets as $lockedTicket) {
            $ticketTypeId = $lockedTicket['ticket_type_id'];
            $sessionKey = $this->getSessionKey($ticketTypeId, $sessionId);
            
            $lockData = Cache::get($sessionKey);
            
            if ($lockData && Carbon::parse($lockData['expires_at'])->isFuture()) {
                $validLocks[] = $lockedTicket;
            } else {
                $invalidLocks[] = $lockedTicket;
            }
        }
        
        return [
            'valid' => $validLocks,
            'invalid' => $invalidLocks,
            'all_valid' => empty($invalidLocks)
        ];
    }

    /**
     * Renovar locks existentes
     */
    public function renewLocks(array $lockedTickets, string $sessionId): bool
    {
        try {
            foreach ($lockedTickets as $lockedTicket) {
                $ticketTypeId = $lockedTicket['ticket_type_id'];
                $quantity = $lockedTicket['quantity'];
                
                // Re-bloquear con nueva expiración
                $this->lockTicketType($ticketTypeId, $quantity, $sessionId);
            }
            
            return true;
        } catch (\Exception $e) {
            Log::error('Error renovando locks', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Limpiar locks expirados
     */
    protected function cleanExpiredLocks(array $locks): array
    {
        $now = now();
        
        return array_filter($locks, function ($lock) use ($now) {
            return Carbon::parse($lock['expires_at'])->isFuture();
        });
    }

    /**
     * Obtener clave de bloqueo para un tipo de ticket
     */
    protected function getLockKey(int $ticketTypeId): string
    {
        return self::CACHE_PREFIX . "ticket:{$ticketTypeId}";
    }

    /**
     * Obtener clave de sesión
     */
    protected function getSessionKey(int $ticketTypeId, string $sessionId): string
    {
        return self::CACHE_PREFIX . "ticket:{$ticketTypeId}:session:{$sessionId}";
    }

    /**
     * Extraer ID del tipo de ticket de una clave
     */
    protected function extractTicketTypeIdFromKey(string $key): ?int
    {
        if (preg_match('/ticket:(\d+):session:/', $key, $matches)) {
            return (int) $matches[1];
        }
        
        return null;
    }

    /**
     * Obtener información de disponibilidad en tiempo real
     */
    public function getAvailability(int $ticketTypeId): array
    {
        $ticketType = TicketType::find($ticketTypeId);
        
        if (!$ticketType) {
            return [
                'available' => 0,
                'locked' => 0,
                'sold' => 0,
                'total' => 0
            ];
        }

        $lockKey = $this->getLockKey($ticketTypeId);
        $locks = Cache::get($lockKey, []);
        $locks = $this->cleanExpiredLocks($locks);
        
        $totalLocked = array_sum(array_column($locks, 'quantity'));
        $available = $ticketType->quantity - $ticketType->quantity_sold - $totalLocked;
        
        return [
            'available' => max(0, $available),
            'locked' => $totalLocked,
            'sold' => $ticketType->quantity_sold,
            'total' => $ticketType->quantity
        ];
    }

    /**
     * Método de debug para obtener información completa
     */
    public function getDebugInfo(int $ticketTypeId): array
    {
        $lockKey = $this->getLockKey($ticketTypeId);
        $locks = Cache::get($lockKey, []);
        $allLocks = $locks; // Guardamos todos antes de limpiar
        $locks = $this->cleanExpiredLocks($locks);
        
        $ticketType = TicketType::find($ticketTypeId);
        
        return [
            'ticket_type_id' => $ticketTypeId,
            'ticket_type_name' => $ticketType ? $ticketType->name : 'No encontrado',
            'cache_key' => $lockKey,
            'total_quantity' => $ticketType ? $ticketType->quantity : 0,
            'sold_quantity' => $ticketType ? $ticketType->quantity_sold : 0,
            'all_locks' => $allLocks,
            'active_locks' => $locks,
            'expired_locks' => array_diff_key($allLocks, $locks),
            'total_locked' => array_sum(array_column($locks, 'quantity')),
            'available' => $ticketType ? max(0, $ticketType->quantity - $ticketType->quantity_sold - array_sum(array_column($locks, 'quantity'))) : 0,
            'timestamp' => now()->toISOString()
        ];
    }
}