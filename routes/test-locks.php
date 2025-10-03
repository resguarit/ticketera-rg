<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;

if (app()->environment('local')) {
    Route::get('/quick-debug-locks/{ticketTypeId?}', function ($ticketTypeId = null) {
        $service = app(App\Services\TicketLockService::class);
        
        if ($ticketTypeId) {
            $availability = $service->getAvailability($ticketTypeId);
            $debugInfo = $service->getDebugInfo($ticketTypeId);
            
            return response()->json([
                'ticket_type_id' => $ticketTypeId,
                'availability' => $availability,
                'debug_info' => $debugInfo,
                'raw_locks' => Cache::get("ticket_lock:ticket:{$ticketTypeId}", []),
                'cache_key' => "ticket_lock:ticket:{$ticketTypeId}"
            ], 200, [], JSON_PRETTY_PRINT);
        } else {
            // Mostrar todos los TicketTypes disponibles
            $ticketTypes = App\Models\TicketType::select('id', 'name', 'quantity', 'quantity_sold')->get();
            return response()->json($ticketTypes, 200, [], JSON_PRETTY_PRINT);
        }
    });
    
    Route::delete('/quick-debug-locks/release/{sessionId}', function ($sessionId) {
        $service = app(App\Services\TicketLockService::class);
        
        try {
            $service->releaseTickets($sessionId);
            return response()->json(['message' => 'Locks liberados exitosamente', 'session_id' => $sessionId]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
}