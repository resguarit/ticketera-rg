<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Enums\UserRole; // <--- Asegúrate de importar el Enum


class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();
        
        $user = $request->user();

        // 🔍 DEBUG TEMPORAL - Bórralo después
        \Log::info('Login attempt', [
            'user_id' => $user->id,
            'email' => $user->email,
            'role_raw' => $user->getAttributes()['role'], // Valor crudo de la DB
            'role_property' => $user->role, // Propiedad después del cast
            'role_is_enum' => $user->role instanceof UserRole,
            'role_value' => $user->role instanceof UserRole ? $user->role->value : $user->role,
        ]);

        // Asegurar conversión robusta
        $userRole = $user->role;
        
        // Si es string, convertir a Enum
        if (is_string($userRole)) {
            $userRole = UserRole::tryFrom($userRole);
        }

        // Redirigir según rol
        if ($userRole === UserRole::ORGANIZER || $userRole === UserRole::VIEWER) {
            \Log::info('Redirecting to organizer dashboard');
            return redirect()->intended(route('organizer.dashboard'));
        }
        
        if ($userRole === UserRole::ADMIN) {
            return redirect()->intended(route('admin.dashboard')); 
        }

        \Log::info('Redirecting to home (default)');
        return redirect()->intended(route('home', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Handle login from checkout without redirect
     */
    public function checkoutLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Las credenciales proporcionadas son incorrectas.'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'user' => Auth::user()
        ]);
    }
}
