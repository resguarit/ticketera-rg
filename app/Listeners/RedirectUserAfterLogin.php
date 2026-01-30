<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Auth\Events\Login;
use Illuminate\Http\Request;
use App\Enums\UserRole;

class RedirectUserAfterLogin
{
    /**
     * Create the event listener.
     */
    public function __construct(protected Request $request)
    {

    }

    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;

        $redirectPath = match ($user->role) {
            UserRole::ADMIN => '/admin/dashboard',
            UserRole::ORGANIZER => '/organizer/dashboard',
            UserRole::VIEWER => '/organizer/dashboard', // <--- AGREGAR ESTA LÍNEA
            default => '/', // Los clientes van al Home.
        };

        // Guardamos la ruta de destino en la sesión.
        // Laravel, al finalizar el proceso de login, buscará 'url.intended'
        // para saber a dónde redirigir. Esta es la forma más robusta.
        $this->request->session()->put('url.intended', $redirectPath);
    }
}
