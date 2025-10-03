<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\EventController as PublicEventController;
use App\Http\Controllers\Public\CheckoutController;
use App\Http\Controllers\Public\HelpController;
use App\Http\Controllers\Public\LegalController;
use App\Http\Controllers\User\TicketPDFController;

use App\Http\Controllers\User\TicketController as UserTicketController;

Route::middleware('auth')->prefix('user')->name('user.')->group(function () {
    Route::get('/tickets', [UserTicketController::class, 'index'])->name('tickets.index');
    Route::get('/tickets/{ticket}/download', [UserTicketController::class, 'download'])->name('tickets.download');
    Route::get('/tickets/{ticket}/qr', [UserTicketController::class, 'qrCode'])->name('tickets.qr');
    Route::post('/tickets/{ticket}/transfer', [UserTicketController::class, 'transfer'])->name('tickets.transfer');
    Route::get('/orders/{order}/download-tickets', [TicketPDFController::class, 'downloadOrder'])->name('orders.download-tickets');
});

Route::middleware('auth')->get('/my-tickets', [UserTicketController::class, 'index'])->name('my-tickets');

Route::middleware('auth')->get('/my-account', function () {
    return redirect()->route('profile.edit');
})->name('my-account');

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/events', [PublicEventController::class, 'index'])->name('events');
Route::get('/events/{event}', [PublicEventController::class, 'show'])->name('event.detail');
Route::get('/{event}/availability', [PublicEventController::class, 'getAvailability'])->name('availability'); 

Route::post('/checkout/process-payment', [CheckoutController::class, 'processPayment'])->name('checkout.process');
Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
Route::get('/checkout/error', [CheckoutController::class, 'error'])->name('checkout.error');
Route::get('/checkout/{event}', [CheckoutController::class, 'confirm'])->name('checkout.confirm');

Route::get('/help', [HelpController::class, 'index'])->name('help');
Route::get('/terms', [LegalController::class, 'terms'])->name('terms');
Route::get('/privacy', [LegalController::class, 'privacy'])->name('privacy');
Route::get('/refunds', [LegalController::class, 'refunds'])->name('refunds');

require __DIR__.'/admin.php';
require __DIR__.'/organizer.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/mail-test.php';
require __DIR__.'/test-locks.php';
