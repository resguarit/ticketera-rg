<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\EventController as PublicEventController;
use App\Http\Controllers\Public\CheckoutController;
use App\Http\Controllers\Public\HelpController;
use App\Http\Controllers\Public\LegalController;

use App\Http\Controllers\User\TicketController as UserTicketController;
use Illuminate\Support\Facades\Cache;

/*-------Rutas protegidas para administradores----------*/

require __DIR__ . '/admin.php';

/*-------Rutas protegidas para organizadores----------*/
require __DIR__ . '/organizer.php';

/*-------Rutas protegidas para usuarios autenticados----------*/
Route::middleware('auth')->prefix('user')->name('user.')->group(function () {
    Route::get('/tickets/{ticket}/download', [UserTicketController::class, 'download'])->name('tickets.download');
    Route::get('/tickets/{ticket}/qr', [UserTicketController::class, 'qrCode'])->name('tickets.qr');
    Route::post('/tickets/{ticket}/transfer', [UserTicketController::class, 'transfer'])->name('tickets.transfer');

    // Nuevas rutas para PDF
    Route::get('/orders/{transaction_id}/download-tickets', [\App\Http\Controllers\User\TicketPDFController::class, 'downloadOrder'])->name('orders.download-tickets');
});

Route::middleware('auth')->get('/my-tickets', [UserTicketController::class, 'index'])->name('my-tickets');
Route::middleware('auth')->get('/my-tickets/all', [UserTicketController::class, 'allTickets'])->name('my-tickets.all');
Route::middleware('auth')->get('/my-tickets/{order}', [UserTicketController::class, 'show'])->name('my-tickets.show');

Route::middleware('auth')->get('/my-account', function () {
    return redirect()->route('profile.edit');
})->name('my-account');

/*--------------------Rutas públicas-----------------------*/
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/events', [PublicEventController::class, 'index'])->name('events');
Route::get('/events/{event}', [PublicEventController::class, 'show'])->name('event.detail');
Route::get('/{event}/availability', [PublicEventController::class, 'getAvailability'])->name('availability');

// Shared Event Wrapped (Signed Route)
Route::get('/shared/wrapped/{event}', [App\Http\Controllers\Organizer\EventWrappedController::class, 'showShared'])
    ->name('shared.wrapped')
    ->middleware('signed');

require __DIR__ . '/checkout.php';

Route::get('/help', [HelpController::class, 'index'])->name('help');
Route::post('/help/send', [HelpController::class, 'sendContact'])->name('help.send');

// Rutas legales
Route::get('/terms', [LegalController::class, 'terms'])->name('terms');
Route::get('/privacy', [LegalController::class, 'privacy'])->name('privacy');
Route::get('/arrepentimiento', [LegalController::class, 'arrepentimiento'])->name('arrepentimiento');
Route::post('/arrepentimiento/send', [LegalController::class, 'sendContact'])->name('arrepentimiento.send');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

Route::get('/checkout/check-email/{email}', [CheckoutController::class, 'checkEmail'])->name('checkout.check-email');

Route::post('/api/release-locks', function (\Illuminate\Http\Request $request) {
    $sessionId = $request->input('session_id');
    if ($sessionId) {
        app(\App\Services\TicketLockService::class)->releaseTickets($sessionId);
        return response()->json(['success' => true]);
    }
    return response()->json(['success' => false], 400);
});

use Illuminate\Support\Facades\Mail;

Route::get('/test-email', function () {
    try {
        Mail::raw('Este es un correo de prueba.', function ($message) {
            $message->to('marianosalas24@gmail.com')
                ->subject('Tus entradas para el evento');
        });
        return "¡Email de prueba enviado exitosamente!";
    } catch (\Exception $e) {
        return "Error al enviar el email: " . $e->getMessage();
    }
});
