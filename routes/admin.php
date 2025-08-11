<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrganizerController;
use App\Http\Controllers\Admin\EventController;

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    
    Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
    
    // Gestión de eventos
    Route::prefix('events')->name('events.')->group(function () {
        Route::get('/', [EventController::class, 'index'])->name('index');
        Route::get('/{event}', [EventController::class, 'show'])->name('show');
        Route::patch('/{event}/toggle-featured', [EventController::class, 'toggleFeatured'])->name('toggle-featured');
        Route::patch('/functions/{function}/toggle', [EventController::class, 'toggleFunction'])->name('functions.toggle');
    });
    

    // Gestión de usuarios
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('admin/users');
        })->name('index');
    });
    
    // Gestión de organizadores
    Route::prefix('organizers')->name('organizers.')->group(function () {
        
        Route::get('/', [OrganizerController::class, 'index'])->name('index');

        Route::get('/create', [OrganizerController::class, 'create'])->name('create');

        Route::post('/store', [OrganizerController::class, 'store'])->name('store');

        Route::get('/{organizerId}', [OrganizerController::class, 'show'])->name('show');

        Route::get('/{organizerId}/edit', [OrganizerController::class, 'edit'])->name('edit');

        Route::put('/{organizerId}', [OrganizerController::class, 'update'])->name('update');

        Route::delete('/{organizerId}', [OrganizerController::class, 'destroy'])->name('destroy');
    });
    
    // Reportes
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('admin/reports');
        })->name('index');
    });
    
    // Configuración
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('admin/settings');
        })->name('index');
    });
});