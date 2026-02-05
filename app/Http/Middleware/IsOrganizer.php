<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Enums\UserRole;
use Illuminate\Support\Facades\Auth;

class IsOrganizer
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            \Log::warning('IsOrganizer: No authenticated user, redirecting to login');
            return redirect()->route('login');
        }

        // 🔧 NUEVO: Permitir acceso si es un administrador impersonando
        if ($request->session()->has('impersonated_organizer_id')) {
            $userRole = is_string($user->role) ? UserRole::tryFrom($user->role) : $user->role;
            
            if ($userRole === UserRole::ADMIN) {
                \Log::info('IsOrganizer: Admin impersonating, access GRANTED', [
                    'admin_id' => $user->id,
                    'impersonated_organizer_id' => $request->session()->get('impersonated_organizer_id'),
                ]);
                return $next($request);
            }
        }

        // 🔍 DEBUG: Log del usuario y rol
        \Log::info('IsOrganizer middleware check', [
            'user_id' => $user->id,
            'role_raw' => $user->getAttributes()['role'] ?? 'null',
            'role_cast' => $user->role,
            'is_enum' => $user->role instanceof UserRole,
            'route' => $request->path(),
        ]);

        // Aseguramos conversión para comparar
        $userRole = is_string($user->role) ? UserRole::tryFrom($user->role) : $user->role;

        \Log::info('IsOrganizer: Role after conversion', [
            'userRole' => $userRole,
            'is_organizer' => $userRole === UserRole::ORGANIZER,
            'is_viewer' => $userRole === UserRole::VIEWER,
        ]);

        // Permitimos tanto a ORGANIZADORES como a VISUALIZADORES
        if ($userRole === UserRole::ORGANIZER || $userRole === UserRole::VIEWER) {
            \Log::info('IsOrganizer: Access GRANTED, proceeding to route', [
                'user_id' => $user->id,
                'role' => $userRole->value ?? $userRole,
            ]);
            return $next($request);
        }

        \Log::error('IsOrganizer: Access DENIED', [
            'user_id' => $user->id,
            'role' => $userRole,
        ]);

        abort(403, 'No tienes permisos de organizador.');
    }
}
