<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Mostrar página de mi cuenta
     */
    public function edit(): Response
    {
        $user = Auth::user();
        $user->load('person');
        
        return Inertia::render('user/myaccount', [
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'person' => [
                    'name' => $user->person->name ?? '',
                    'last_name' => $user->person->last_name ?? '',
                    'dni' => $user->person->dni ?? '',
                    'phone' => $user->person->phone ?? '',
                    'address' => $user->person->address ?? '',
                ]
            ]
        ]);
    }

    /**
     * Actualizar información personal - AJUSTADO SEGÚN TUS MODELOS
     */
    public function update(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'documentNumber' => 'required|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        // Actualizar usuario (solo email según tu modelo User)
        $user->update([
            'email' => $validated['email'],
        ]);

        // Actualizar persona según el modelo Person que tienes
        $user->person->update([
            'name' => $validated['firstName'],        // ✅ name
            'last_name' => $validated['lastName'],    // ✅ last_name  
            'dni' => $validated['documentNumber'],    // ✅ dni
            'phone' => $validated['phone'],           // ✅ phone
            'address' => $validated['address'],       // ✅ address
        ]);

        return redirect()->back()->with('success', 'Información personal actualizada correctamente');
    }

    /**
     * Cambiar contraseña - AJUSTADO PARA TU MODELO USER
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        // Actualizar solo el password según tu modelo User
        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        return redirect()->back()->with('success', 'Contraseña actualizada correctamente');
    }

    /**
     * Actualizar configuración de notificaciones
     */
    public function updateNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'emailNotifications' => 'boolean',
            'smsNotifications' => 'boolean',
            'pushNotifications' => 'boolean',
            'eventReminders' => 'boolean',
            'promotionalEmails' => 'boolean',
            'securityAlerts' => 'boolean',
        ]);

        // Por ahora guardamos en la sesión, después puedes crear una tabla user_preferences
        session(['notification_preferences' => $validated]);

        return redirect()->back()->with('success', 'Preferencias de notificaciones actualizadas');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
