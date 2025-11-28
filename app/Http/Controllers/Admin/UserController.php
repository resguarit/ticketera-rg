<?php

// filepath: app/Http/Controllers/Admin/UserController.php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Person;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        // Filtros
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Consulta base - solo clientes
        $query = User::with(['person'])
            ->where('role', UserRole::CLIENT);

        // Aplicar filtros de búsqueda
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

        // Filtro por estado
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

        // Ordenamiento
        switch ($sortBy) {
            case 'name':
                $query->leftJoin('person', 'users.person_id', '=', 'person.id')
                    ->orderBy('person.name', $sortDirection)
                    ->select('users.*');
                break;
            case 'email':
                $query->orderBy('email', $sortDirection);
                break;
            case 'purchases':
                $query->withCount(['orders' => function ($q) {
                    $q->where('status', 'PAID');
                }])
                    ->orderBy('orders_count', $sortDirection);
                break;
            case 'spent':
                $query->withSum(['orders' => function ($q) {
                    $q->where('status', 'PAID');
                }], 'total_amount')
                    ->orderBy('orders_sum_total_amount', $sortDirection);
                break;
            default:
                $query->orderBy('created_at', $sortDirection);
        }

        // Paginación
        $users = $query->paginate(15)->withQueryString();

        // Procesar datos para el frontend
        $usersData = $users->getCollection()->map(function ($user) {
            // Estadísticas del usuario
            $totalPurchases = Order::where('client_id', $user->id)
                ->where('status', 'PAID')
                ->count();

            $totalSpent = Order::where('client_id', $user->id)
                ->where('status', 'PAID')
                ->sum('total_amount');

            $lastOrder = Order::where('client_id', $user->id)
                ->latest()
                ->first();

            return [
                'id' => $user->id,
                'name' => $user->person ? "{$user->person->name} {$user->person->last_name}" : 'Sin nombre',
                'email' => $user->email,
                'phone' => $user->person->phone ?? 'Sin teléfono',
                'dni' => $user->person->dni ?? 'Sin DNI',
                'address' => $user->person->address ?? 'Sin dirección',
                'status' => $user->email_verified_at ? 'active' : 'pending',
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at->format('Y-m-d'),
                'last_login' => $user->updated_at->format('Y-m-d'), // Aproximación
                'total_purchases' => $totalPurchases,
                'total_spent' => $totalSpent,
                'last_purchase' => $lastOrder ? $lastOrder->created_at->format('Y-m-d') : null,
            ];
        });

        // Reemplazar la colección
        $users->setCollection($usersData);

        // Estadísticas generales
        $stats = $this->getUserStats();

        return Inertia::render('admin/users', [
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

    public function show(int $userId): Response
    {
        $user = User::with(['person'])->findOrFail($userId);

        // Verificar que sea cliente
        if ($user->role !== UserRole::CLIENT) {
            abort(404);
        }

        // Órdenes del usuario
        $orders = Order::where('client_id', $user->id)
            ->with(['items.ticketType.eventFunction.event'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_date' => $order->order_date->format('Y-m-d H:i'),
                    'total_amount' => $order->total_amount,
                    'status' => $order->status->value,
                    'payment_method' => $order->payment_method,
                    'items_count' => $order->items->count(),
                    'events' => $order->items->map(function ($item) {
                        return $item->ticketType->eventFunction->event->name;
                    })->unique()->values(),
                ];
            });

        // Estadísticas del usuario
        $userStats = [
            'total_orders' => $orders->count(),
            'confirmed_orders' => $orders->where('status', 'PAID')->count(),
            'total_spent' => $orders->where('status', 'PAID')->sum('total_amount'),
            'avg_order_value' => $orders->where('status', 'PAID')->avg('total_amount') ?: 0,
        ];

        $userData = [
            'id' => $user->id,
            'name' => $user->person ? "{$user->person->name} {$user->person->last_name}" : 'Sin nombre',
            'email' => $user->email,
            'phone' => $user->person->phone ?? '',
            'dni' => $user->person->dni ?? '',
            'address' => $user->person->address ?? '',
            'status' => $user->email_verified_at ? 'active' : 'pending',
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at->format('Y-m-d H:i'),
            'updated_at' => $user->updated_at->format('Y-m-d H:i'),
        ];

        return Inertia::render('admin/users/show', [
            'user' => $userData,
            'orders' => $orders,
            'stats' => $userStats,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'dni' => 'required|string|max:20|unique:person,dni',
            'address' => 'nullable|string|max:500',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        DB::transaction(function () use ($validated) {
            // Crear persona
            $person = Person::create([
                'name' => $validated['firstName'],
                'last_name' => $validated['lastName'],
                'dni' => $validated['dni'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
            ]);

            // Crear usuario - email no verificado por defecto
            User::create([
                'person_id' => $person->id,
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => UserRole::CLIENT,
                'email_verified_at' => null, // Siempre null inicialmente
            ]);
        });

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario creado correctamente');
    }

    public function edit(int $userId): Response
    {
        $user = User::with(['person'])->findOrFail($userId);

        // Verificar que sea cliente
        if ($user->role !== UserRole::CLIENT) {
            abort(404);
        }

        $userData = [
            'id' => $user->id,
            'firstName' => $user->person->name,
            'lastName' => $user->person->last_name,
            'email' => $user->email,
            'phone' => $user->person->phone ?? '',
            'dni' => $user->person->dni,
            'address' => $user->person->address ?? '',
        ];

        return Inertia::render('admin/users/edit', [
            'user' => $userData,
        ]);
    }

    public function update(Request $request, int $userId): RedirectResponse
    {
        $user = User::with(['person'])->findOrFail($userId);

        // Verificar que sea cliente
        if ($user->role !== UserRole::CLIENT) {
            abort(404);
        }

        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:20',
            'dni' => 'required|string|max:20|unique:person,dni,'.$user->person->id,
            'address' => 'nullable|string|max:500',
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        DB::transaction(function () use ($user, $validated) {
            // Actualizar persona
            $user->person->update([
                'name' => $validated['firstName'],
                'last_name' => $validated['lastName'],
                'dni' => $validated['dni'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
            ]);

            // Actualizar usuario
            $userData = [
                'email' => $validated['email'],
            ];

            if (! empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
                $userData['password_changed_at'] = now();
            }

            $user->update($userData);
        });

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario actualizado correctamente');
    }

    public function destroy(int $userId): RedirectResponse
    {
        $user = User::with(['person'])->findOrFail($userId);

        // Verificar que sea cliente
        if ($user->role !== UserRole::CLIENT) {
            abort(404);
        }

        // Verificar si tiene órdenes
        $hasOrders = Order::where('client_id', $user->id)->exists();

        if ($hasOrders) {
            return redirect()->back()
                ->with('error', 'No se puede eliminar un usuario que tiene órdenes asociadas');
        }

        DB::transaction(function () use ($user) {
            $person = $user->person;
            $user->delete();
            if ($person) {
                $person->delete();
            }
        });

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario eliminado correctamente');
    }

    public function toggleStatus(int $userId): RedirectResponse
    {
        $user = User::findOrFail($userId);

        // Verificar que sea cliente
        if ($user->role !== UserRole::CLIENT) {
            abort(404);
        }

        $user->update([
            'email_verified_at' => $user->email_verified_at ? null : now(),
        ]);

        $status = $user->email_verified_at ? 'activado' : 'desactivado';

        return redirect()->back()
            ->with('success', "Usuario {$status} correctamente");
    }

    private function getUserStats(): array
    {
        $totalUsers = User::where('role', UserRole::CLIENT)->count();
        $activeUsers = User::where('role', UserRole::CLIENT)
            ->whereNotNull('email_verified_at')
            ->count();
        $pendingUsers = User::where('role', UserRole::CLIENT)
            ->whereNull('email_verified_at')
            ->count();

        // Usuarios nuevos este mes
        $newUsersThisMonth = User::where('role', UserRole::CLIENT)
            ->whereBetween('created_at', [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth(),
            ])
            ->count();

        // Total de órdenes confirmadas
        $totalOrders = Order::where('status', 'PAID')->count();

        // Ingresos totales
        $totalRevenue = Order::where('status', 'PAID')
            ->sum('total_amount');

        return [
            'total' => $totalUsers,
            'active' => $activeUsers,
            'pending' => $pendingUsers,
            'new_this_month' => $newUsersThisMonth,
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
        ];
    }
}
