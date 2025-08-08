<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Organizer\DashboardController as OrganizerDashboardController;

/*-------Rutas protegidas para administradores----------*/ 
require __DIR__.'/admin.php';

/*-------Rutas protegidas para organizadores----------*/ 

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
