<?php

use App\Http\Controllers\Checkout\PaywayController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Public\CheckoutController;
use Inertia\Inertia;

Route::prefix('checkout')->name('checkout.')->group(function () {
    Route::post('/process-payment', [CheckoutController::class, 'processPayment'])->name('process');
    Route::get('/success', [CheckoutController::class, 'success'])->name('success');
    Route::get('/error', [CheckoutController::class, 'error'])->name('error'); // Nueva ruta
    Route::get('/{event}', [CheckoutController::class, 'confirm'])->name('confirm');
    
    Route::prefix('payway')->name('payway.')->group(function () {
        Route::post('/process', [PaywayController::class, 'paywayProcess'])->name('process');
    });
});

Route::get('/payway-check-status', [PaywayController::class, 'CheckStatus'])->name('payway.check-status');
Route::get('/test-payway', function () {
    return Inertia::render('public/test-payway');
})->name('test-payway');