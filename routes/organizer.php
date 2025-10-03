<?php

use App\Http\Controllers\Organizer\DashboardController as OrganizerDashboardController;
use App\Http\Controllers\Organizer\CategoryController;
use App\Http\Controllers\Organizer\VenueController;
use App\Http\Controllers\Organizer\SectorController;
use App\Http\Controllers\Organizer\EventController;
use App\Http\Controllers\Organizer\TicketTypeController;
use App\Http\Controllers\Organizer\EventFunctionController; // <-- ADD THIS
use App\Http\Controllers\Organizer\AssistantController;
use App\Http\Controllers\Organizer\AttendeeInvitationController;
use App\Http\Controllers\Organizer\OrganizerUserController;
use Illuminate\Support\Facades\Route;

use function Pest\Laravel\get;

Route::middleware(['auth', 'organizer', 'password.changed'])->prefix('organizer')->name('organizer.')->group(function () {
    Route::get('/dashboard', OrganizerDashboardController::class)->name('dashboard');

    Route::prefix('events')->name('events.')->group(function () { 
        Route::get('/', [EventController::class, 'index'])->name('index');
        Route::get('/create', [EventController::class, 'create'])->name('create');
        Route::post('/', [EventController::class, 'store'])->name('store');
        Route::get('/{event}/edit', [EventController::class, 'edit'])->name('edit');
        Route::put('/{event}', [EventController::class, 'update'])->name('update');
        Route::patch('/{event}/archive', [EventController::class, 'toggleArchive'])->name('toggleArchive');
        Route::get('/manage/{event}', [EventController::class, 'manage'])->name('manage');
        Route::get('/tickets/{event}', [EventController::class, 'tickets'])->name('tickets');
        Route::get('/attendees/{event}', [AssistantController::class, 'index'])->name('attendees');
        
        // Rutas para gestión de asistentes
        Route::prefix('{event}/attendees')->name('attendees.')->group(function () {
            Route::get('/invite', [AttendeeInvitationController::class, 'create'])->name('invite');
            Route::post('/invite', [AttendeeInvitationController::class, 'store'])->name('invite.store');
            Route::post('/', [AssistantController::class, 'store'])->name('store');
            Route::patch('/{assistant}/resend-invitation', [AssistantController::class, 'resendInvitation'])->name('resendInvitation');
            Route::delete('/{assistant}', [AssistantController::class, 'destroy'])->name('destroy');
            Route::get('/order/{order}/details', [AssistantController::class, 'showOrderDetails'])->name('order.details');
            Route::get('/assistant/{assistant}/details', [AssistantController::class, 'showAssistantDetails'])->name('assistant.details');
        });

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

        // Rutas para Asistentes (Assistants) anidadas
        Route::prefix('{event}/assistants')->name('assistants.')->group(function () {
            Route::post('/', [AssistantController::class, 'store'])->name('store');
            Route::delete('/{assistant}', [AssistantController::class, 'destroy'])->name('destroy');
            Route::patch('/{assistant}/resend-invitation', [AssistantController::class, 'resendInvitation'])->name('resendInvitation');
            Route::patch('/order/{order}/resend-purchase', [AssistantController::class, 'resendPurchase'])->name('resendPurchase');
        });
    });

    // Rutas para usuarios del organizador
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [OrganizerUserController::class, 'index'])->name('index');
        Route::get('/create', [OrganizerUserController::class, 'create'])->name('create');
        Route::post('/', [OrganizerUserController::class, 'store'])->name('store');
        Route::patch('/{user}/toggle-status', [OrganizerUserController::class, 'toggleStatus'])->name('toggleStatus');
        Route::delete('/{user}', [OrganizerUserController::class, 'destroy'])->name('destroy');
    });
    

});