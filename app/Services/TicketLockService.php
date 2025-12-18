<?php
// filepath: app/Services/TicketLockService.php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\TicketType;
use Carbon\Carbon;

class TicketLockService
{
    const LOCK_DURATION = 10; // 10 minutos

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
                $failures[] = [
                    'ticket_type_id' => $ticketTypeId,
                    'message' => 'Error interno al bloquear tickets'
                ];
            }
        }

        $result = [
            'success' => empty($failures),
            'locked_tickets' => $lockedTickets,
            'failures' => $failures
        ];

        return $result;
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
        } catch (\Exception $e) {
            throw $e; // Re-lanzar la excepción para que el controlador la maneje
        }
    }

    /**
     * Liberar todos los tickets de una sesión - MEJORADO
     */
    protected function releaseAllSessionTickets(string $sessionId): void
    {

        // Estrategia mejorada: iterar sobre todos los TicketTypes y verificar locks
        $allTicketTypes = TicketType::pluck('id');
        $releasedCount = 0;

        foreach ($allTicketTypes as $ticketTypeId) {
            $sessionKey = $this->getSessionKey($ticketTypeId, $sessionId);

            if (Cache::has($sessionKey)) {
                $this->releaseTicketType($ticketTypeId, $sessionId);
                $releasedCount++;
            }
        }
    }

    /**
     * Liberar un tipo de ticket específico - MEJORADO CON LOGS
     */
    protected function releaseTicketType(int $ticketTypeId, string $sessionId): void
    {
        $lockKey = $this->getLockKey($ticketTypeId);
        $sessionKey = $this->getSessionKey($ticketTypeId, $sessionId);


        try {
            Cache::lock($lockKey . ':atomic', 10)->block(5, function () use ($lockKey, $sessionKey, $sessionId, $ticketTypeId) {
                // Verificar si existe el lock de sesión
                $sessionLock = Cache::get($sessionKey);
                if (!$sessionLock) {
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
                } else {
                    Cache::put($lockKey, $updatedLocks, now()->addMinutes(self::LOCK_DURATION + 5));
                }

                // Eliminar clave de sesión
                Cache::forget($sessionKey);
            });
        } catch (\Exception $e) {
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
     * NUEVO: Obtener la cantidad bloqueada para un tipo de ticket específico
     */
    public function getLockedQuantity(int $ticketTypeId): int
    {
        $lockKey = $this->getLockKey($ticketTypeId);
        $locks = Cache::get($lockKey, []);

        // Limpiar locks expirados
        $activeLocks = $this->cleanExpiredLocks($locks);

        // Actualizar cache si había locks expirados
        if (count($activeLocks) !== count($locks)) {
            if (empty($activeLocks)) {
                Cache::forget($lockKey);
            } else {
                Cache::put($lockKey, $activeLocks, now()->addMinutes(self::LOCK_DURATION + 5));
            }
        }

        // Sumar todas las cantidades bloqueadas activas
        return array_sum(array_column($activeLocks, 'quantity'));
    }

    /**
     * NUEVO: Obtener la cantidad bloqueada por una sesión específica
     */
    public function getLockedQuantityBySession(int $ticketTypeId, string $sessionId): int
    {
        $sessionKey = $this->getSessionKey($ticketTypeId, $sessionId);
        $lockData = Cache::get($sessionKey);

        if (!$lockData) {
            return 0;
        }

        // Verificar si el lock no ha expirado
        if (Carbon::parse($lockData['expires_at'])->isFuture()) {
            return $lockData['quantity'];
        }

        // Si el lock expiró, limpiarlo
        Cache::forget($sessionKey);
        return 0;
    }

    /**
     * ACTUALIZADO: Obtener información de disponibilidad en tiempo real
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

        $totalLocked = $this->getLockedQuantity($ticketTypeId);
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

    /**
     * NUEVO: Liberar todos los locks de una sesión base (sin timestamp)
     * Útil para cuando una sesión inicia un nuevo checkout
     */
    public function releaseAllSessionLocks(string $baseSessionId): void
    {
        try {
            $this->releaseSessionLocksByPattern($baseSessionId);
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * NUEVO: Liberar locks buscando por patrón de sesión
     */
    protected function releaseSessionLocksByPattern(string $baseSessionId): void
    {
        // Obtener todos los tipos de ticket para verificar locks
        $allTicketTypes = TicketType::pluck('id');
        $releasedCount = 0;

        foreach ($allTicketTypes as $ticketTypeId) {
            $lockKey = $this->getLockKey($ticketTypeId);
            $locks = Cache::get($lockKey, []);

            if (empty($locks)) {
                continue;
            }

            // Filtrar locks que pertenezcan a esta sesión base
            $originalCount = count($locks);

            $updatedLocks = array_filter($locks, function ($lock) use ($baseSessionId) {
                // Verificar si el session_id del lock comienza con el baseSessionId
                return !str_starts_with($lock['session_id'], $baseSessionId);
            });

            if (count($updatedLocks) !== $originalCount) {
                $removedCount = $originalCount - count($updatedLocks);
                $releasedCount += $removedCount;

                // Actualizar cache
                if (empty($updatedLocks)) {
                    Cache::forget($lockKey);
                } else {
                    Cache::put($lockKey, array_values($updatedLocks), now()->addMinutes(self::LOCK_DURATION + 5));
                }
            }
        }
    }
}
