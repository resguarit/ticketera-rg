<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Enums\UserRole;
use Illuminate\Support\Facades\Auth;

class EnsureUserIsNotViewer
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && $user->role === UserRole::VIEWER) {
             // Si intenta usar cualquier método que no sea de lectura seguro
            if (!in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'])) {
                abort(403, 'No tienes permisos para realizar cambios.');
            }
        }

        return $next($request);
    }
}