<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => App\Http\Middleware\IsAdmin::class,
            'organizer' => App\Http\Middleware\IsOrganizer::class,
            'password.changed' => App\Http\Middleware\EnsurePasswordIsChanged::class,
            'not.viewer' => App\Http\Middleware\EnsureUserIsNotViewer::class, // Agrega esta línea
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
