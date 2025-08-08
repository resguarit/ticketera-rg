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

/*-------Rutas protegidas para administradores----------*/ 
require __DIR__.'/admin.php';

/*-------Rutas protegidas para organizadores----------*/ 

Route::middleware(['auth', 'organizer'])->prefix('organizer')->name('organizer.')->group(function () {
    Route::get('/dashboard', OrganizerDashboardController::class)->name('dashboard');
    
    // Gestión de categorías
    Route::resource('categories', CategoryController::class);
    Route::get('/api/categories/select', [CategoryController::class, 'getForSelect']);
    
    // Gestión de venues
    Route::resource('venues', VenueController::class);
    Route::get('/api/venues/select', [VenueController::class, 'getForSelect']);
    
    // Gestión de sectores
    Route::resource('sectors', SectorController::class);
    Route::get('/api/venues/{venue}/sectors', [SectorController::class, 'getByVenue']);
});

/*-------Rutas protegidas para usuarios autenticados----------*/ 

Route::middleware('auth')->get('/my-tickets', function () {
    return Inertia::render('user/mytickets');
})->name('my-tickets');

Route::middleware('auth')->get('/my-account', function () {
    return Inertia::render('user/myaccount');
})->name('my-account');


/*--------------------Rutas públicas-----------------------*/ 

// Página principal - conectada al HomeController
Route::get('/', [HomeController::class, 'index'])->name('home');

// Páginas de eventos - conectadas al EventController
Route::get('/events', [PublicEventController::class, 'index'])->name('events');
Route::get('/events/{event}', [PublicEventController::class, 'show'])->name('event.detail');

// Rutas de checkout
Route::get('/checkout/{event}', [CheckoutController::class, 'confirm'])->name('checkout.confirm');
Route::post('/checkout/process', [CheckoutController::class, 'processPayment'])->name('checkout.process');
Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');

// Otras rutas públicas que mantienen closures por ahora
Route::get('/help', function () {
    return Inertia::render('public/help');
})->name('help');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
