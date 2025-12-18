<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOrganizerRequest;
use App\Http\Requests\Admin\UpdateOrganizerRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Organizer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Person;
use Illuminate\Support\Str;
use App\Enums\UserRole;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class OrganizerController extends Controller
{
    public function index(Request $request): Response
    {
        $totalOrganizers = Organizer::count();
        $activeOrganizers = Organizer::count();
        $totalEvents = Event::count();
        $totalRevenue = 0;

        $stats = [
            'total_organizers' => $totalOrganizers,
            'active_organizers' => $activeOrganizers,
            'total_events' => $totalEvents,
            'total_revenue' => $totalRevenue,
        ];

        $organizers = Organizer::query()
            ->withCount('events')
            ->when($request->input('search'), function (Builder $query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            // Manejar el caso de ordenamiento
            ->when($request->input('sort_by') && $request->input('sort_by') !== 'all', function (Builder $query) use ($request) {
                $query->orderBy($request->input('sort_by'), $request->input('sort_direction', 'desc'));
            }, function (Builder $query) use ($request) {
                // Orden por defecto cuando sort_by es 'all' o no está definido
                $query->orderBy('created_at', $request->input('sort_direction', 'desc'));
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/organizers/index', [
            'organizers' => $organizers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'sort_by', 'sort_direction']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/organizers/new');
    }

    public function store(StoreOrganizerRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('logo_url')) {
            $file = $request->file('logo_url');
            $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();

            // Guardar en storage/app/public/organizers/
            $path = $file->storeAs('organizers', $filename, 'public');

            // Guardar la ruta completa en la base de datos
            $validated['logo_url'] = $path;
        }

        Organizer::create($validated);

        return redirect()->route('admin.organizers.index')
            ->with('success', 'Organizador creado correctamente.');
    }

    public function show(int $organizerId): Response
    {
        $organizer = Organizer::with([
            'events.category',
            'events.venue.ciudad.provincia', // Cargar venue con city y province
            'users.person'
        ])->findOrFail($organizerId);

        return Inertia::render('admin/organizers/show', [
            'organizer' => $organizer,
        ]);
    }

    public function edit(int $organizerId): Response
    {
        $organizer = Organizer::findOrFail($organizerId);
        return Inertia::render('admin/organizers/edit', [
            'organizer' => $organizer,
        ]);
    }

    public function update(UpdateOrganizerRequest $request, $organizerId): RedirectResponse
    {
        $organizer = Organizer::findOrFail($organizerId);
        $validated = $request->validated();

        if ($request->hasFile('logo_url')) {
            // Eliminar el logo anterior si existe
            if ($organizer->logo_url && Storage::disk('public')->exists($organizer->logo_url)) {
                Storage::disk('public')->delete($organizer->logo_url);
            }

            $file = $request->file('logo_url');
            $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();

            // Guardar en storage/app/public/organizers/
            $path = $file->storeAs('organizers', $filename, 'public');

            $validated['logo_url'] = $path;
        }

        $organizer->update($validated);

        return redirect()->route('admin.organizers.index')
            ->with('success', 'Organizador actualizado correctamente.');
    }

    public function destroy(int $organizerId): RedirectResponse
    {
        $organizer = Organizer::findOrFail($organizerId);

        // Eliminar el logo si existe
        if ($organizer->logo_url && Storage::disk('public')->exists($organizer->logo_url)) {
            Storage::disk('public')->delete($organizer->logo_url);
        }

        $organizer->delete();

        return redirect()->route('admin.organizers.index')
            ->with('success', 'Organizador eliminado correctamente.');
    }

    public function addUser(Request $request, int $organizerId): RedirectResponse
    {
        $organizer = Organizer::findOrFail($organizerId);

        $validated = $request->validate([
            'mode' => 'required|in:existing,new',
            'user_id' => 'required_if:mode,existing|nullable|exists:users,id',
            'person.name' => 'required_if:mode,new|string|max:255',
            'person.last_name' => 'required_if:mode,new|string|max:255',
            'person.dni' => 'nullable|string|max:50',
            'person.phone' => 'nullable|string|max:50',
            'person.address' => 'nullable|string|max:255',
            'email' => 'required_if:mode,new|email|max:255|unique:users,email',
        ]);

        if (!isset($validated['mode'])) {
            return redirect()->back()->with('error', 'Modo inválido.');
        }

        if ($validated['mode'] === 'existing') {
            $user = User::whereNull('organizer_id')->findOrFail($validated['user_id']);
            $user->role = UserRole::ORGANIZER;
            $user->organizer_id = $organizer->id;
            $user->save();
            return redirect()->back()->with('success', 'Usuario asignado correctamente.');
        }

        try {
            DB::beginTransaction();

            $person = Person::create([
                'name' => $request->input('person.name'),
                'last_name' => $request->input('person.last_name'),
                'dni' => $request->input('person.dni'),
                'phone' => $request->input('person.phone'),
                'address' => $request->input('person.address'),
            ]);

            $randomPassword = Str::password(12);

            $user = User::create([
                'organizer_id' => $organizer->id,
                'person_id' => $person->id,
                'email' => $request->input('email'),
                'password' => $randomPassword,
                'role' => UserRole::ORGANIZER,
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'No se pudo crear el usuario, intenta nuevamente.');
        }

        return redirect()->back()->with([
            'success' => 'Usuario creado y asignado correctamente.',
            'credentials' => [
                'email' => $user->email,
                'password' => $randomPassword,
            ],
        ]);
    }

    public function removeUser(Request $request, int $organizerId, int $userId): RedirectResponse
    {
        $organizer = Organizer::findOrFail($organizerId);
        $user = User::where('organizer_id', $organizer->id)->findOrFail($userId);

        $user->organizer_id = null;
        $user->role = UserRole::CLIENT; // vuelve a cliente
        $user->save();

        return redirect()->back()->with('success', 'Usuario removido del organizador.');
    }

    public function searchUsers(Request $request, int $organizerId)
    {
        $query = $request->input('q');
        $users = User::with('person')
            ->whereNull('organizer_id')
            ->when($query, function ($q) use ($query) {
                $q->where('email', 'like', "%{$query}%")
                    ->orWhereHas('person', function ($p) use ($query) {
                        $p->where('name', 'like', "%{$query}%")
                            ->orWhere('last_name', 'like', "%{$query}%");
                    });
            })
            ->limit(10)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->person ? $u->person->name . ' ' . $u->person->last_name : $u->email,
                    'email' => $u->email,
                ];
            });

        return response()->json($users);
    }

    public function regenerateCredentials(Request $request, int $organizerId, int $userId): RedirectResponse
    {
        $organizer = Organizer::findOrFail($organizerId);
        $user = User::where('organizer_id', $organizer->id)->findOrFail($userId);

        $newPassword = Str::password(12);
        $user->password = $newPassword; // hashed via cast
        $user->password_changed_at = null;
        $user->save();

        return redirect()->back()->with([
            'credentials' => [
                'email' => $user->email,
                'password' => $newPassword,
            ],
            'regen_credentials' => true,
        ]);
    }
}
