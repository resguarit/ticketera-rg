<?php

use App\Http\Controllers\Checkout\PaywayController;
use App\Http\Controllers\Checkout\PaywayDebugController;
use App\Http\Controllers\Public\CheckoutController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('checkout')->name('checkout.')->group(function () {
    Route::post('/process-payment', [CheckoutController::class, 'processPayment'])->name('process');
    Route::get('/success', [CheckoutController::class, 'success'])->name('success')->middleware('signed');
    Route::get('/error', [CheckoutController::class, 'error'])->name('error'); // Nueva ruta
    Route::get('/{event}', [CheckoutController::class, 'confirm'])->name('confirm');

    Route::prefix('payway')->name('payway.')->group(function () {
        Route::post('/process', [PaywayController::class, 'paywayProcess'])->name('process');
    });
    Route::post('/release-locks', [CheckoutController::class, 'releaseLocks'])->name('releaseLocks');
});

Route::get('/payway-check-status', [PaywayController::class, 'CheckStatus'])->name('payway.check-status');

Route::prefix('payway-debug')->name('payway.debug.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('public/payway-debug');
    })->name('index');

    Route::post('/test-health-check', [PaywayDebugController::class, 'testHealthCheck'])->name('health-check');
    Route::post('/test-tokenization', [PaywayDebugController::class, 'testTokenization'])->name('tokenization');
    Route::post('/test-payment', [PaywayDebugController::class, 'testPayment'])->name('payment');
    Route::post('/test-payment-info', [PaywayDebugController::class, 'testPaymentInfo'])->name('payment-info');
    Route::post('/test-raw-connection', [PaywayDebugController::class, 'testRawConnection'])->name('raw-connection');
    Route::get('/get-logs', [PaywayDebugController::class, 'getRecentLogs'])->name('logs');
});

Route::get('/test-payway', function () {
    return Inertia::render('public/test-payway');
})->name('test-payway');
