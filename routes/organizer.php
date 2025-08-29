<?php

use App\Http\Controllers\Organizer\DashboardController as OrganizerDashboardController;
use App\Http\Controllers\Organizer\CategoryController;
use App\Http\Controllers\Organizer\VenueController;
use App\Http\Controllers\Organizer\SectorController;
use App\Http\Controllers\Organizer\EventController;
use App\Http\Controllers\Organizer\TicketTypeController; // <-- AÑADIR ESTA LÍNEA
use Illuminate\Support\Facades\Route;

use function Pest\Laravel\get;

Route::middleware(['auth', 'organizer'])->prefix('organizer')->name('organizer.')->group(function () {
    Route::get('/dashboard', OrganizerDashboardController::class)->name('dashboard');

    Route::prefix('events')->name('events.')->group(function () { 
        Route::get('/', [EventController::class, 'index'])->name('index');
        Route::get('/create', [EventController::class, 'create'])->name('create');
        Route::post('/', [EventController::class, 'store'])->name('store');
        Route::get('/manage/{event}', [EventController::class, 'manage'])->name('manage');
        Route::get('/tickets/{event}', [EventController::class, 'tickets'])->name('tickets');

        // Rutas para Tipos de Entrada (TicketType) anidadas
        Route::prefix('{event}/functions/{function}/ticket-types')->name('functions.ticket-types.')->group(function () {
            Route::get('/create', [TicketTypeController::class, 'create'])->name('create');
            Route::post('/', [TicketTypeController::class, 'store'])->name('store');
        });
    });
    
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