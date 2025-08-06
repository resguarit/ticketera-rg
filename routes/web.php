<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Organizer\DashboardController as OrganizerDashboardController;

/*-------Rutas protegidas para administradores----------*/ 

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    
    Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
    
    Route::get('/events', function () {
        return Inertia::render('admin/events');
    })->name('events');
    
    Route::get('/events/create', function () {
        return Inertia::render('admin/events/create');
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



/*-------Rutas protegidas para orgenizadores----------*/ 

Route::middleware(['auth', 'organizer'])->prefix('organizer')->name('organizer.')->group(function () {
    Route::get('/dashboard', OrganizerDashboardController::class)->name('dashboard');
});

/*-------Rutas protegidas para usuarios autenticados----------*/ 

Route::middleware('auth')->get('/my-tickets', function () {
    return Inertia::render('user/mytickets');
})->name('my-tickets');

Route::middleware('auth')->get('/my-account', function () {
    return Inertia::render('user/myaccount');
})->name('my-account');


/*--------------------Rutas publicas-----------------------*/ 

Route::get('/', function () {
    return Inertia::render('public/home');
})->name('home');

Route::get('/events', function () {
    return Inertia::render('public/events');
})->name('events');

Route::get('/help', function () {
    return Inertia::render('public/help');
})->name('help');

Route::get('/events/{eventId}', function ($eventId) {
    return Inertia::render('public/eventdetail', [
        'eventId' => $eventId
    ]);
})->name('event.detail');

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
