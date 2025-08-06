<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Organizer\DashboardController as OrganizerDashboardController;

/*-------Rutas protegidas para administradores----------*/ 

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
    // ... otras rutas de admin
});

/*-------Rutas protegidas para orgenizadores----------*/ 

Route::middleware(['auth', 'organizer'])->prefix('organizer')->name('organizer.')->group(function () {
    Route::get('/dashboard', OrganizerDashboardController::class)->name('dashboard');
});


/*-------Rutas protegidas para usuarios autenticados----------*/ 

Route::middleware('auth')->get('/my-tickets', function () {
    return Inertia::render('user/mytickets');
})->name('my-tickets');


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



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
