<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Organizer\DashboardController as OrganizerDashboardController;
use App\Http\Controllers\Organizer\CategoryController;
use App\Http\Controllers\Organizer\VenueController;
use App\Http\Controllers\Organizer\SectorController;

use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\EventController as PublicEventController;

/*-------Rutas protegidas para administradores----------*/ 

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    
    Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
    
    Route::get('/events', function () {
        return Inertia::render('admin/events');
    })->name('events');
    
    Route::get('/events/create', function () {
        return Inertia::render('admin/createevent');
    })->name('events.create');
    
    Route::get('/events/{eventId}/edit', function ($eventId) {
        return Inertia::render('admin/events/edit', [
            'eventId' => $eventId
        ]);
    })->name('events.edit');

    Route::get('/users', function () {
        return Inertia::render('admin/users');
    })->name('users');
    
    // Gestión de organizadores
    Route::get('/organizers', function () {
        return Inertia::render('admin/organizers');
    })->name('organizers');
    
    // Reportes
    Route::get('/reports', function () {
        return Inertia::render('admin/reports');
    })->name('reports');
    
    // Configuración
    Route::get('/settings', function () {
        return Inertia::render('admin/settings');
    })->name('settings');
});

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

// Otras rutas públicas que mantienen closures por ahora
Route::get('/help', function () {
    return Inertia::render('public/help');
})->name('help');

Route::get('/checkout/success', function () {
    return Inertia::render('public/checkoutsuccess');
})->name('checkout.success');

Route::get('/checkout/{eventId}', function ($eventId) {
    return Inertia::render('public/checkoutconfirm', [
        'eventId' => $eventId
    ]);
})->name('checkout.confirm');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
