<?php
// app/Services/StageTicketService.php

namespace App\Services;

use App\Models\TicketType;
use Illuminate\Support\Facades\Log;

class StageTicketService
{
    public function checkAndActivateNextStage(TicketType $ticketType): bool
    {
        // Solo procesar si es parte de un sistema de tandas y está VISIBLE
        if (!$ticketType->isStaged() || $ticketType->is_hidden) {
            return false;
        }

        // Verificar si se agotó
        if ($ticketType->quantity_available > 0) {
            return false;
        }

        try {
            // Ocultar la tanda actual
            $ticketType->update(['is_hidden' => true]);

            // Buscar la siguiente tanda en el grupo
            $nextStage = $ticketType->getNextStage();

            if ($nextStage) {
                $nextStage->update(['is_hidden' => false]);

                return true;
            }

            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getStageStatus(string $stageGroup, int $functionId): array
    {
        $stages = TicketType::inStageGroup($stageGroup, $functionId)->get();

        return $stages->map(function ($stage) {
            return [
                'id' => $stage->id,
                'name' => $stage->name,
                'stage_order' => $stage->stage_order,
                'is_hidden' => $stage->is_hidden,
                'quantity_available' => $stage->quantity_available,
                'is_sold_out' => $stage->quantity_available <= 0,
            ];
        })->toArray();
    }

    public function manuallyActivateStage(int $ticketTypeId): bool
    {
        $ticketType = TicketType::findOrFail($ticketTypeId);

        if (!$ticketType->isStaged()) {
            return false;
        }

        // Ocultar todas las tandas del mismo grupo
        TicketType::where('event_function_id', $ticketType->event_function_id)
            ->where('stage_group', $ticketType->stage_group)
            ->update(['is_hidden' => true]);

        // Mostrar la tanda seleccionada
        $ticketType->update(['is_hidden' => false]);

        return true;
    }
}
