<?php
// Crear app/Services/StageTicketService.php

namespace App\Services;

use App\Models\TicketType;
use Illuminate\Support\Facades\Log;

class StageTicketService
{
    public function checkAndActivateNextStage(TicketType $ticketType): bool
    {
        // Solo procesar si es parte de un sistema de tandas y está VISIBLE (no oculto)
        if (!$ticketType->stage_group || $ticketType->is_hidden) {
            return false;
        }
        
        // Recargar para obtener datos actualizados
        $ticketType->refresh();
        
        // Verificar si esta tanda está agotada (quantity_available <= 0)
        $quantityAvailable = $ticketType->quantity - $ticketType->quantity_sold;
        if ($quantityAvailable > 0) {
            return false; // Aún hay disponibilidad
        }
        
        Log::info("Tanda agotada detectada", [
            'tanda' => $ticketType->name,
            'quantity' => $ticketType->quantity,
            'sold' => $ticketType->quantity_sold,
            'available' => $quantityAvailable
        ]);
        
        // Ocultar tanda actual
        $ticketType->update(['is_hidden' => true]);
        
        // Buscar siguiente tanda en el grupo (ordenadas por número)
        $nextStage = TicketType::where('event_function_id', $ticketType->event_function_id)
            ->where('name', 'LIKE', $ticketType->stage_group . ' %')
            ->where('is_hidden', true) // Solo tandas ocultas
            ->where('name', '>', $ticketType->name) // Siguiente en orden alfabético
            ->orderBy('name')
            ->first();
            
        if ($nextStage) {
            $nextStage->update(['is_hidden' => false]);
            
            Log::info("Nueva tanda activada", [
                'nueva_tanda' => $nextStage->name,
                'precio' => $nextStage->price,
                'cantidad' => $nextStage->quantity
            ]);
            
            // OPCIONAL: Notificar al organizador por email/push
            // $this->notifyOrganizerStageActivated($nextStage);
            
            return true;
        }
        
        Log::info("No hay más tandas disponibles", [
            'grupo' => $ticketType->stage_group,
            'function_id' => $ticketType->event_function_id
        ]);
        
        return false;
    }
    
    public function getStageStatus(string $stageGroup, int $functionId): array
    {
        $stages = TicketType::where('event_function_id', $functionId)
            ->where('name', 'LIKE', $stageGroup . ' %')
            ->orderBy('name')
            ->get();
            
        return [
            'total_stages' => $stages->count(),
            'active_stage' => $stages->where('is_hidden', false)->first(),
            'completed_stages' => $stages->filter(function($stage) {
                return ($stage->quantity - $stage->quantity_sold) <= 0;
            })->count(),
            'stages' => $stages->map(fn($stage) => [
                'name' => $stage->name,
                'price' => $stage->price,
                'available' => $stage->quantity - $stage->quantity_sold,
                'total' => $stage->quantity,
                'sold' => $stage->quantity_sold,
                'is_active' => !$stage->is_hidden,
                'is_completed' => ($stage->quantity - $stage->quantity_sold) <= 0,
            ])->toArray()
        ];
    }
    
    /**
     * NUEVO: Método para activar manualmente una tanda (para organizadores)
     */
    public function manuallyActivateStage(int $ticketTypeId): bool
    {
        $ticketType = TicketType::findOrFail($ticketTypeId);
        
        if (!$ticketType->stage_group) {
            return false;
        }
        
        // Ocultar todas las tandas del grupo
        TicketType::where('event_function_id', $ticketType->event_function_id)
            ->where('name', 'LIKE', $ticketType->stage_group . ' %')
            ->update(['is_hidden' => true]);
        
        // Activar la tanda seleccionada
        $ticketType->update(['is_hidden' => false]);
        
        Log::info("Tanda activada manualmente", [
            'tanda' => $ticketType->name,
            'activada_por' => auth()->user()?->email ?? 'sistema'
        ]);
        
        return true;
    }
}