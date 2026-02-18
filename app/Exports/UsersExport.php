<?php

namespace App\Exports;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Carbon\Carbon;

class UsersExport implements FromCollection, WithHeadings, WithMapping
{
    protected $type;

    public function __construct(string $type)
    {
        $this->type = $type;
    }

    public function collection()
    {
        $query = User::with(['person'])
            ->where('role', UserRole::CLIENT);

        // Subconsultas para contadores
        $query->addSelect([
            'paid_orders_count' => Order::selectRaw('COUNT(*)')
                ->whereColumn('orders.client_id', 'users.id')
                ->where('status', 'PAID'),
            'paid_orders_sum' => Order::selectRaw('COALESCE(SUM(total_amount), 0)')
                ->whereColumn('orders.client_id', 'users.id')
                ->where('status', 'PAID'),
            'cancelled_orders_count' => Order::selectRaw('COUNT(*)')
                ->whereColumn('orders.client_id', 'users.id')
                ->where('status', 'CANCELLED')
        ]);

        // Filtrar según el tipo
        if ($this->type === 'buyers') {
            $query->having('paid_orders_count', '>', 0);
        } elseif ($this->type === 'non_buyers') {
            $query->having('paid_orders_count', '=', 0);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nombre',
            'Apellido',
            'Email',
            'Teléfono',
            'DNI',
            'Dirección',
            'Estado',
            'Compras Totales',
            'Gasto Total',
            'Intentos Fallidos',
        ];
    }

    public function map($user): array
    {
        return [
            $user->id,
            $user->person->name ?? '',
            $user->person->last_name ?? '',
            $user->email,
            $user->person->phone ?? '',
            $user->person->dni ?? '',
            $user->person->address ?? '',
            $user->email_verified_at ? 'Activo' : 'Pendiente',
            $user->paid_orders_count ?? 0,
            $user->paid_orders_sum ?? 0,
            $user->cancelled_orders_count ?? 0,
        ];
    }
}
