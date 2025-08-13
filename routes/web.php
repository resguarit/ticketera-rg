<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Organizer\DashboardController as OrganizerDashboardController;
use App\Http\Controllers\Organizer\CategoryController;
use App\Http\Controllers\Organizer\VenueController;
use App\Http\Controllers\Organizer\SectorController;

use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\EventController as PublicEventController;
use App\Http\Controllers\Public\CheckoutController;

use App\Http\Controllers\User\TicketController as UserTicketController;

/*-------Rutas protegidas para administradores----------*/ 
require __DIR__.'/admin.php';

/*-------Rutas protegidas para organizadores----------*/ 
require __DIR__.'/organizer.php';

/*-------Rutas protegidas para usuarios autenticados----------*/ 

// Rutas de tickets de usuario
Route::middleware('auth')->prefix('user')->name('user.')->group(function () {
    // Mis tickets
    Route::get('/tickets', [UserTicketController::class, 'index'])->name('tickets.index');
    Route::get('/tickets/{ticket}/download', [UserTicketController::class, 'download'])->name('tickets.download');
    Route::get('/tickets/{ticket}/qr', [UserTicketController::class, 'qrCode'])->name('tickets.qr');
    Route::post('/tickets/{ticket}/transfer', [UserTicketController::class, 'transfer'])->name('tickets.transfer');
});

// Alias para mantener compatibilidad con rutas existentes
Route::middleware('auth')->get('/my-tickets', [UserTicketController::class, 'index'])->name('my-tickets');

// ✅ Redirigir /my-account a settings/profile
Route::middleware('auth')->get('/my-account', function () {
    return redirect()->route('profile.edit');
})->name('my-account');

/*--------------------Rutas públicas-----------------------*/ 

// Página principal - conectada al HomeController
Route::get('/', [HomeController::class, 'index'])->name('home');

// Páginas de eventos - conectadas al EventController
Route::get('/events', [PublicEventController::class, 'index'])->name('events');
Route::get('/events/{event}', [PublicEventController::class, 'show'])->name('event.detail');

// Rutas de checkout
Route::post('/checkout/process-payment', [CheckoutController::class, 'processPayment'])->name('checkout.process');
Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
Route::get('/checkout/{event}', [CheckoutController::class, 'confirm'])->name('checkout.confirm');

// Otras rutas públicas que mantienen closures por ahora
Route::get('/help', function () {
    return Inertia::render('public/help');
})->name('help');

// ✅ Incluir rutas de settings y auth
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
