<?php

use App\Http\Controllers\Organizer\DashboardController as OrganizerDashboardController;
use App\Http\Controllers\Organizer\CategoryController;
use App\Http\Controllers\Organizer\VenueController;
use App\Http\Controllers\Organizer\SectorController;
use Illuminate\Support\Facades\Route;

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