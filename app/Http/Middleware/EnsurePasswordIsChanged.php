<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordIsChanged
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 🔧 NUEVO: No mostrar el modal si es un admin impersonando
        $isImpersonating = $request->session()->has('impersonated_organizer_id');
        
        if (!$isImpersonating && Auth::user()->password_changed_at === null) {
            Inertia::share('must_change_password', true);
        }
        
        return $next($request);
    }
}
