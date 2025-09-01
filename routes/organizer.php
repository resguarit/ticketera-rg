<?php

use App\Http\Controllers\Organizer\DashboardController as OrganizerDashboardController;
use App\Http\Controllers\Organizer\CategoryController;
use App\Http\Controllers\Organizer\VenueController;
use App\Http\Controllers\Organizer\SectorController;
use App\Http\Controllers\Organizer\EventController;
use App\Http\Controllers\Organizer\TicketTypeController;
use App\Http\Controllers\Organizer\EventFunctionController; // <-- ADD THIS
use Illuminate\Support\Facades\Route;

use function Pest\Laravel\get;

Route::middleware(['auth', 'organizer'])->prefix('organizer')->name('organizer.')->group(function () {
    Route::get('/dashboard', OrganizerDashboardController::class)->name('dashboard');

    Route::prefix('events')->name('events.')->group(function () { 
        Route::get('/', [EventController::class, 'index'])->name('index');
        Route::get('/create', [EventController::class, 'create'])->name('create');
        Route::post('/', [EventController::class, 'store'])->name('store');
        Route::get('/{event}/edit', [EventController::class, 'edit'])->name('edit');
        Route::put('/{event}', [EventController::class, 'update'])->name('update');
        Route::get('/manage/{event}', [EventController::class, 'manage'])->name('manage');
        Route::get('/tickets/{event}', [EventController::class, 'tickets'])->name('tickets');

        // Rutas para Funciones (EventFunction) anidadas
        Route::get('/functions/{event}', [EventController::class, 'functions'])->name('functions');
        Route::resource('{event}/functions', EventFunctionController::class)
            ->except(['show', 'index'])
            ->names('functions');


        // Rutas para Tipos de Entrada (TicketType) anidadas
        Route::prefix('{event}/functions/{function}/ticket-types')->name('functions.ticket-types.')->group(function () {
            Route::get('/create', [TicketTypeController::class, 'create'])->name('create');
            Route::post('/', [TicketTypeController::class, 'store'])->name('store');
            Route::get('/{ticketType}/edit', [TicketTypeController::class, 'edit'])->name('edit');
            Route::put('/{ticketType}', [TicketTypeController::class, 'update'])->name('update'); // <-- AGREGA ESTA LÍNEA
            Route::patch('/{ticketType}/toggle-visibility', [TicketTypeController::class, 'toggleVisibility'])->name('toggleVisibility');
            Route::post('/{ticketType}/duplicate-all', [TicketTypeController::class, 'duplicateAll'])->name('duplicateAll'); // <-- CORRECTO
            Route::delete('/{ticketType}', [TicketTypeController::class, 'destroy'])->name('destroy');
        });
    });
    

});