<?php

namespace App\Http\Controllers\Organizer;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Person;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class OrganizerUserController extends Controller
{
    public function index(Request $request): Response
    {
        $organizer = Auth::user()->organizer;

        $search = $request->get('search', '');
        $status = $request->get('status', 'all');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $query = User::with(['person'])
            ->where('organizer_id', $organizer->id)
            ->where('role', UserRole::ORGANIZER);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhereHas('person', function ($pq) use ($search) {
                        $pq->where('name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('dni', 'like', "%{$search}%");
                    });
            });
        }

        if ($status !== 'all') {
            switch ($status) {
                case 'active':
                    $query->whereNotNull('email_verified_at');
                    break;
                case 'pending':
                    $query->whereNull('email_verified_at');
                    break;
            }
        }

        switch ($sortBy) {
            case 'name':
                $query->leftJoin('person', 'users.person_id', '=', 'person.id')
                    ->orderBy('person.name', $sortDirection)
                    ->select('users.*');
                break;
            case 'email':
                $query->orderBy('email', $sortDirection);
                break;
            default:
                $query->orderBy('created_at', $sortDirection);
        }

        $users = $query->paginate(15)->withQueryString();

        $usersData = $users->getCollection()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->person ? "{$user->person->name} {$user->person->last_name}" : 'Sin nombre',
                'email' => $user->email,
                'phone' => $user->person->phone ?? 'Sin teléfono',
                'dni' => $user->person->dni ?? 'Sin DNI',
                'status' => $user->email_verified_at ? 'active' : 'pending',
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at->format('Y-m-d'),
            ];
        });

        $users->setCollection($usersData);

        $stats = [
            'total' => User::where('organizer_id', $organizer->id)->where('role', UserRole::ORGANIZER)->count(),
            'active' => User::where('organizer_id', $organizer->id)->where('role', UserRole::ORGANIZER)->whereNotNull('email_verified_at')->count(),
            'pending' => User::where('organizer_id', $organizer->id)->where('role', UserRole::ORGANIZER)->whereNull('email_verified_at')->count(),
        ];

        return Inertia::render('organizer/users/index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('organizer/users/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $organizer = Auth::user()->organizer;

        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'dni' => 'nullable|string|max:20|unique:person,dni',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        DB::transaction(function () use ($validated, $organizer) {
            $person = Person::create([
                'name' => $validated['firstName'],
                'last_name' => $validated['lastName'],
                'dni' => $validated['dni'],
                'phone' => $validated['phone'],
            ]);

            User::create([
                'person_id' => $person->id,
                'organizer_id' => $organizer->id,
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => UserRole::ORGANIZER,
                'email_verified_at' => null,
            ]);
        });

        return redirect()->route('organizer.users.index')
            ->with('success', 'Usuario creado correctamente');
    }

    public function toggleStatus(int $userId): RedirectResponse
    {
        $organizer = Auth::user()->organizer;

        $user = User::where('organizer_id', $organizer->id)
            ->where('role', UserRole::ORGANIZER)
            ->findOrFail($userId);

        $user->update([
            'email_verified_at' => $user->email_verified_at ? null : now(),
        ]);

        $status = $user->email_verified_at ? 'activado' : 'desactivado';

        return redirect()->back()
            ->with('success', "Usuario {$status} correctamente");
    }

    public function destroy(int $userId): RedirectResponse
    {
        $organizer = Auth::user()->organizer;

        $user = User::with(['person'])
            ->where('organizer_id', $organizer->id)
            ->where('role', UserRole::ORGANIZER)
            ->findOrFail($userId);

        DB::transaction(function () use ($user) {
            $person = $user->person;
            $user->delete();
            if ($person) {
                $person->delete();
            }
        });

        return redirect()->route('organizer.users.index')
            ->with('success', 'Usuario eliminado correctamente');
    }

    public function edit(int $userId): Response
    {
        $organizer = Auth::user()->organizer;

        $user = User::with(['person'])
            ->where('organizer_id', $organizer->id)
            ->where('role', UserRole::ORGANIZER)
            ->findOrFail($userId);

        return Inertia::render('organizer/users/edit', [
            'user' => [
                'id' => $user->id,
                'firstName' => $user->person->name ?? '',
                'lastName' => $user->person->last_name ?? '',
                'email' => $user->email,
                'phone' => $user->person->phone ?? '',
                'dni' => $user->person->dni ?? '',
                'status' => $user->email_verified_at ? 'active' : 'pending',
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function update(Request $request, int $userId): RedirectResponse
    {
        $organizer = Auth::user()->organizer;

        $user = User::with(['person'])
            ->where('organizer_id', $organizer->id)
            ->where('role', UserRole::ORGANIZER)
            ->findOrFail($userId);

        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:20',
            'dni' => 'nullable|string|max:20|unique:person,dni,'.$user->person_id,
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        DB::transaction(function () use ($validated, $user) {
            // Actualizar datos de la persona
            $user->person->update([
                'name' => $validated['firstName'],
                'last_name' => $validated['lastName'],
                'dni' => $validated['dni'],
                'phone' => $validated['phone'],
            ]);

            // Preparar datos del usuario
            $userData = [
                'email' => $validated['email'],
            ];

            // Solo actualizar contraseña si se proporciona
            if (! empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }

            $user->update($userData);
        });

        return redirect()->route('organizer.users.index')
            ->with('success', 'Usuario actualizado correctamente');
    }
}
