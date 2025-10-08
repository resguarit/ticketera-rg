<?php
// Crear app/Services/StageTicketService.php

namespace App\Services;

use App\Models\TicketType;
use Illuminate\Support\Facades\Log;

class StageTicketService
{
    public function checkAndActivateNextStage(TicketType $ticketType): bool
    {
        // Solo procesar si es parte de un sistema de tandas
        if (!$ticketType->stage_group || $ticketType->is_hidden) {
            return false;
        }
        
        // Verificar si esta tanda está agotada
        if ($ticketType->quantity_available > 0) {
            return false;
        }
        
        Log::info("Tanda agotada detectada: {$ticketType->name}");
        
        // Ocultar tanda actual
        $ticketType->update(['is_hidden' => true]);
        
        // Buscar siguiente tanda en el grupo
        $nextStage = TicketType::where('event_function_id', $ticketType->event_function_id)
            ->where('name', 'LIKE', $ticketType->stage_group . ' %')
            ->where('is_hidden', true)
            ->where('name', '>', $ticketType->name) // Siguiente en orden alfabético
            ->orderBy('name')
            ->first();
            
        if ($nextStage) {
            $nextStage->update(['is_hidden' => false]);
            Log::info("Nueva tanda activada: {$nextStage->name}");
            
            // Opcional: Notificar al organizador
            // event(new StageActivated($nextStage));
            
            return true;
        }
        
        Log::info("No hay más tandas disponibles para el grupo: {$ticketType->stage_group}");
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
            'completed_stages' => $stages->where('quantity_available', 0)->count(),
            'stages' => $stages->map(fn($stage) => [
                'name' => $stage->name,
                'price' => $stage->price,
                'available' => $stage->quantity_available,
                'is_active' => !$stage->is_hidden,
                'is_completed' => $stage->quantity_available === 0,
            ])
        ];
    }
}