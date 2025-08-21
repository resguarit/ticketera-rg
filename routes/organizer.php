<?php

use App\Http\Controllers\Organizer\DashboardController as OrganizerDashboardController;
use App\Http\Controllers\Organizer\CategoryController;
use App\Http\Controllers\Organizer\VenueController;
use App\Http\Controllers\Organizer\SectorController;
use App\Http\Controllers\Organizer\EventController;
use Illuminate\Support\Facades\Route;

use function Pest\Laravel\get;

Route::middleware(['auth', 'organizer'])->prefix('organizer')->name('organizer.')->group(function () {
    Route::get('/dashboard', OrganizerDashboardController::class)->name('dashboard');

    Route::prefix('events')->name('events.')->group(function () { 
        Route::get('/', [EventController::class, 'index'])->name('index');
        Route::get('/create', [EventController::class, 'create'])->name('create');
        Route::post('/', [EventController::class, 'store'])->name('store');
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