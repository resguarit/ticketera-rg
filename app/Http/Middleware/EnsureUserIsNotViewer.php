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
            // Bloquear métodos de escritura
            if (!in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'])) {
                abort(403, 'No tienes permisos para realizar cambios.');
            }

            // Bloquear rutas GET de formularios
            $route = $request->route();
            if ($route) {
                $routeName = $route->getName();
                
                $forbiddenPatterns = ['.create', '.edit', '.invite'];
                
                foreach ($forbiddenPatterns as $pattern) {
                    if ($routeName && str_contains($routeName, $pattern)) {
                        abort(403, 'No tienes permisos para acceder a esta sección.');
                    }
                }
            }
        }

        return $next($request);
    }
}