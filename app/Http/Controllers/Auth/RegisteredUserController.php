<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use App\Models\Person;
use Illuminate\Support\Facades\Log;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'dni' => 'nullable|string|max:20|unique:person',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            DB::beginTransaction();

            $person = Person::create([
                'name' => $request->name,
                'last_name' => $request->last_name,
                'dni' => $request->dni,
            ]);

            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'person_id' => $person->id,
                'password_changed_at' => now(),
            ]);

            event(new Registered($user));

            DB::commit();

            Auth::login($user);

            return redirect()->intended();
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Registration failed.']);
        }
    }

    /**
     * Handle registration from checkout without redirect
     */
    public function checkoutRegister(Request $request)
    {
        try {
            $validated = $request->validate([
                'firstName' => 'required|string|max:255',
                'lastName' => 'required|string|max:255',
                'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
                'phone' => 'required|string|max:20',
                'documentType' => 'required|string|in:DNI,Pasaporte,Cedula',
                'documentNumber' => 'required|string|max:20',
            ]);

            DB::beginTransaction();

            // Verificar si ya existe una persona con ese DNI
            $existingPerson = Person::where('dni', $validated['documentNumber'])->first();

            if ($existingPerson) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe una persona registrada con ese número de documento.',
                    'errors' => [
                        'documentNumber' => ['El número de documento ya está registrado.']
                    ]
                ], 422);
            }

            // Crear persona
            $person = Person::create([
                'name' => $validated['firstName'],
                'last_name' => $validated['lastName'],
                'dni' => $validated['documentNumber'],
                'phone' => $validated['phone'],
            ]);

            // Crear usuario
            $user = User::create([
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'person_id' => $person->id,
            ]);

            DB::commit();

            // Autenticar automáticamente
            Auth::login($user);

            return response()->json([
                'success' => true,
                'message' => 'Cuenta creada exitosamente',
                'user' => $user
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al crear la cuenta. Por favor intenta nuevamente.'
            ], 500);
        }
    }
}
