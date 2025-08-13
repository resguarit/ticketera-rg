<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrganizerController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ReportController; // Agregar esta línea

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
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/create', [UserController::class, 'create'])->name('create');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{user}', [UserController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
        Route::put('/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
        Route::patch('/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('toggle-status');
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
        Route::post('/{organizerId}/users', [OrganizerController::class, 'addUser'])->name('add-user');
        Route::get('/{organizerId}/users/search', [OrganizerController::class, 'searchUsers'])->name('search-users');
        Route::delete('/{organizerId}/users/{userId}', [OrganizerController::class, 'removeUser'])->name('remove-user');
    });
    
    // Reportes - ACTUALIZADO
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/export', [ReportController::class, 'export'])->name('export');
        Route::get('/download', [ReportController::class, 'downloadReport'])->name('download');
        Route::get('/real-time', [ReportController::class, 'realTimeStats'])->name('real-time');
    });
    
    // Configuración
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('admin/settings');
        })->name('index');
    });
});