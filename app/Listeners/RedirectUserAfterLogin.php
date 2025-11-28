<?php

namespace App\Listeners;

use App\Enums\UserRole;
use Illuminate\Auth\Events\Login;
use Illuminate\Http\Request;

class RedirectUserAfterLogin
{
    /**
     * Create the event listener.
     */
    public function __construct(protected Request $request) {}

    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;

        $redirectPath = match ($user->role) {
            UserRole::ADMIN => '/admin/dashboard',
            UserRole::ORGANIZER => '/organizer/dashboard',
            default => '/', // Los clientes van al Home.
        };

        // Guardamos la ruta de destino en la sesión.
        // Laravel, al finalizar el proceso de login, buscará 'url.intended'
        // para saber a dónde redirigir. Esta es la forma más robusta.
        $this->request->session()->put('url.intended', $redirectPath);
    }
}
