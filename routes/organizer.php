<?php

use App\Http\Controllers\Organizer\DashboardController as OrganizerDashboardController;
use App\Http\Controllers\Organizer\CategoryController;
use App\Http\Controllers\Organizer\VenueController;
use App\Http\Controllers\Organizer\SectorController;
use App\Http\Controllers\Organizer\EventController;
use App\Http\Controllers\Organizer\TicketTypeController;
use App\Http\Controllers\Organizer\EventFunctionController;
use App\Http\Controllers\Organizer\AssistantController;
use App\Http\Controllers\Organizer\AttendeeInvitationController;
use App\Http\Controllers\Organizer\OrganizerUserController;
use App\Http\Controllers\Organizer\PromoterController;
use App\Http\Controllers\User\TicketController;
use App\Http\Controllers\Organizer\TicketController as OrganizerTicketController;
use App\Http\Controllers\Organizer\SettlementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'organizer', 'password.changed', 'not.viewer'])->prefix('organizer')->name('organizer.')->group(function () {
    Route::get('/dashboard', OrganizerDashboardController::class)->name('dashboard');

    Route::prefix('events')->name('events.')->group(function () {
        // ✅ RUTAS DE SOLO LECTURA (Permitidas para viewer)
        Route::get('/', [EventController::class, 'index'])->name('index');
        Route::get('/manage/{event}', [EventController::class, 'manage'])->name('manage');
        Route::get('/tickets/{event}', [EventController::class, 'tickets'])->name('tickets');
        Route::get('/attendees/{event}', [AssistantController::class, 'index'])->name('attendees');
        Route::get('/functions/{event}', [EventController::class, 'functions'])->name('functions');

        // Crear/Editar/Archivar eventos
        Route::get('/create', [EventController::class, 'create'])->name('create');
        Route::post('/', [EventController::class, 'store'])->name('store');
        Route::get('/{event}/edit', [EventController::class, 'edit'])->name('edit');
        Route::put('/{event}', [EventController::class, 'update'])->name('update');
        Route::patch('/{event}/archive', [EventController::class, 'toggleArchive'])->name('toggleArchive');

        // Gestión de asistentes
        Route::prefix('{event}/attendees')->name('attendees.')->group(function () {
            Route::get('/invite', [AttendeeInvitationController::class, 'create'])->name('invite');
            Route::post('/invite', [AttendeeInvitationController::class, 'store'])->name('invite.store');
            Route::post('/', [AssistantController::class, 'store'])->name('store');
            Route::patch('/{assistant}/resend-invitation', [AssistantController::class, 'resendInvitation'])->name('resendInvitation');
            Route::delete('/{assistant}', [AssistantController::class, 'destroy'])->name('destroy');
            Route::get('/export', [AssistantController::class, 'export'])->name('export');
        });

        // Rutas para Entradas Físicas
        Route::prefix('{event}/physical-tickets')->name('physical-tickets.')->group(function () {
            Route::get('/new', [App\Http\Controllers\Organizer\PhysicalTicketController::class, 'create'])->name('create');
            Route::post('/', [App\Http\Controllers\Organizer\PhysicalTicketController::class, 'store'])->name('store');
            Route::get('/print', [App\Http\Controllers\Organizer\PhysicalTicketController::class, 'print'])->name('print');
        });

        // Funciones (Create, Edit, Delete)
        Route::resource('{event}/functions', EventFunctionController::class)
            ->except(['show', 'index'])
            ->names('functions');

        // Tipos de entrada
        Route::prefix('{event}/functions/{function}/ticket-types')->name('functions.ticket-types.')->group(function () {
            Route::get('/create', [TicketTypeController::class, 'create'])->name('create');
            Route::post('/', [TicketTypeController::class, 'store'])->name('store');
            Route::get('/{ticketType}/edit', [TicketTypeController::class, 'edit'])->name('edit');
            Route::put('/{ticketType}', [TicketTypeController::class, 'update'])->name('update');
            Route::patch('/{ticketType}/toggle-visibility', [TicketTypeController::class, 'toggleVisibility'])->name('toggleVisibility');
            Route::post('/{ticketType}/duplicate-all', [TicketTypeController::class, 'duplicateAll'])->name('duplicateAll');
            Route::delete('/{ticketType}', [TicketTypeController::class, 'destroy'])->name('destroy');
        });

        // Asistentes (POST/DELETE/PATCH)
        Route::prefix('{event}/assistants')->name('assistants.')->group(function () {
            Route::post('/', [AssistantController::class, 'store'])->name('store');
            Route::delete('/{assistant}', [AssistantController::class, 'destroy'])->name('destroy');
            Route::patch('/{assistant}/resend-invitation', [AssistantController::class, 'resendInvitation'])->name('resendInvitation');
            Route::patch('/order/{order}/resend-purchase', [AssistantController::class, 'resendPurchase'])->name('resendPurchase');
            Route::post('/order/{order}/refund', [AssistantController::class, 'refund'])->name('refund');
        });

        // Vendedores
        Route::post('{event}/promoters', [PromoterController::class, 'store'])->name('promoters.store');
        Route::delete('{event}/promoters/{promoter}', [PromoterController::class, 'destroy'])->name('promoters.destroy');
        Route::delete('{event}/promoters/{promoter}/codes/{code}', [PromoterController::class, 'destroyCode'])->name('promoters.codes.destroy');
        Route::patch('{event}/promoters/{promoter}/restore', [PromoterController::class, 'restore'])->name('promoters.restore');
        Route::patch('{event}/promoters/{promoter}/codes/{code}/restore', [PromoterController::class, 'restoreCode'])->name('promoters.codes.restore');

        // Control de acceso (toggle status)
        Route::post('{event}/access/{ticket}/toggle', [OrganizerTicketController::class, 'toggleStatus'])->name('access.toggle');

        // Liquidaciones
        Route::prefix('{event}/settlements')->name('settlements.')->group(function () {
            Route::get('/', [SettlementController::class, 'index'])->name('index');
            Route::get('/export-settlements', [SettlementController::class, 'exportSettlements'])->name('export-settlements');
        });

        // ✅ RUTAS DE SOLO LECTURA PARA DETALLES
        Route::get('{event}/attendees/order/{order}/details', [AssistantController::class, 'showOrderDetails'])->name('attendees.order.details');
        Route::get('{event}/attendees/assistant/{assistant}/details', [AssistantController::class, 'showAssistantDetails'])->name('attendees.assistant.details');
        Route::get('{event}/promoters', [PromoterController::class, 'index'])->name('promoters.index');
        Route::get('{event}/access', [OrganizerTicketController::class, 'index'])->name('access');
    });

    // Usuarios del organizador
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [OrganizerUserController::class, 'index'])->name('index');
        Route::get('/create', [OrganizerUserController::class, 'create'])->name('create');
        Route::post('/', [OrganizerUserController::class, 'store'])->name('store');
        Route::get('/{user}/edit', [OrganizerUserController::class, 'edit'])->name('edit');
        Route::put('/{user}', [OrganizerUserController::class, 'update'])->name('update');
        Route::patch('/{user}/toggle-status', [OrganizerUserController::class, 'toggleStatus'])->name('toggleStatus');
        Route::delete('/{user}', [OrganizerUserController::class, 'destroy'])->name('destroy');
    });

    Route::get('/help-guide', [OrganizerDashboardController::class, 'helpGuide'])->name('helpGuide');
});
