<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\EventController as PublicEventController;
use App\Http\Controllers\Public\CheckoutController;
use App\Http\Controllers\Public\HelpController;
use App\Http\Controllers\Public\LegalController;

use App\Http\Controllers\User\TicketController as UserTicketController;

/*-------Rutas protegidas para administradores----------*/ 
require __DIR__.'/admin.php';

/*-------Rutas protegidas para organizadores----------*/ 
require __DIR__.'/organizer.php';

/*-------Rutas protegidas para usuarios autenticados----------*/ 
Route::middleware('auth')->prefix('user')->name('user.')->group(function () {
    Route::get('/tickets', [UserTicketController::class, 'index'])->name('tickets.index');
    Route::get('/tickets/{ticket}/download', [UserTicketController::class, 'download'])->name('tickets.download');
    Route::get('/tickets/{ticket}/qr', [UserTicketController::class, 'qrCode'])->name('tickets.qr');
    Route::post('/tickets/{ticket}/transfer', [UserTicketController::class, 'transfer'])->name('tickets.transfer');
    
    // Nuevas rutas para PDF
    Route::get('/orders/{order}/download-tickets', [\App\Http\Controllers\User\TicketPDFController::class, 'downloadOrder'])->name('orders.download-tickets');
});

Route::middleware('auth')->get('/my-tickets', [UserTicketController::class, 'index'])->name('my-tickets');

Route::middleware('auth')->get('/my-account', function () {
    return redirect()->route('profile.edit');
})->name('my-account');

/*--------------------Rutas públicas-----------------------*/ 
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/events', [PublicEventController::class, 'index'])->name('events');
Route::get('/events/{event}', [PublicEventController::class, 'show'])->name('event.detail');

Route::post('/checkout/process-payment', [CheckoutController::class, 'processPayment'])->name('checkout.process');
Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
Route::get('/checkout/error', [CheckoutController::class, 'error'])->name('checkout.error'); // Nueva ruta
Route::get('/checkout/{event}', [CheckoutController::class, 'confirm'])->name('checkout.confirm');

Route::get('/help', [HelpController::class, 'index'])->name('help');

// Rutas legales
Route::get('/terms', [LegalController::class, 'terms'])->name('terms');
Route::get('/privacy', [LegalController::class, 'privacy'])->name('privacy');
Route::get('/refunds', [LegalController::class, 'refunds'])->name('refunds');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// SOLO PARA DESARROLLO - Eliminar después
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
    
    // Nueva ruta para liberar locks manualmente
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
