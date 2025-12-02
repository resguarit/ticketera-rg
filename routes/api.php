<?php

use App\Http\Controllers\Api\ScannerController;
use App\Http\Middleware\EnsureScannerApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/scanner')
    ->middleware([EnsureScannerApiKey::class])
    ->group(function () {

        // 1. Configuracion
        Route::get('/config', [ScannerController::class, 'config']);

        // 2. Descargar tickets
        Route::get('/functions/{functionId}/tickets', [ScannerController::class, 'downloadTickets']);

        // 3. Sync up
        Route::post('/sync', [ScannerController::class, 'sync']);

        // 4. Sync down
        Route::get('/functions/{functionId}/updates', [ScannerController::class, 'updates']);
    });
