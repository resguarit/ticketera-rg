<?php

namespace App\Exports;

use App\Enums\IssuedTicketStatus;
use App\Models\Event;
use App\Models\Assistant;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Carbon\Carbon;

class AttendeesExport implements FromCollection, WithHeadings, WithMapping
{
    protected $event;
    protected $filters;
    protected $type;

    public function __construct(Event $event, array $filters, string $type)
    {
        $this->event = $event;
        $this->filters = $filters;
        $this->type = $type;
    }

    public function collection()
    {
        $buyersQuery = Order::query()
            ->join('users', 'orders.client_id', '=', 'users.id')
            ->join('person', 'users.person_id', '=', 'person.id')
            ->join('issued_tickets', 'orders.id', '=', 'issued_tickets.order_id')
            ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
            ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
            ->leftJoin('discount_codes', 'orders.discount_code_id', '=', 'discount_codes.id')
            ->where('event_functions.event_id', $this->event->id)
            ->select(
                'orders.id',
                'orders.order_date as date',
                'person.name',
                'person.last_name',
                'person.dni',
                'users.email',
                'orders.subtotal',     // Monto entradas
                'orders.service_fee',  // Monto cargo servicio
                'orders.total_amount',
                'orders.status'
            )
            ->withCount('issuedTickets as quantity')
            ->groupBy('orders.id', 'orders.order_date', 'person.name', 'person.last_name', 'person.dni', 'users.email', 'orders.subtotal', 'orders.service_fee', 'orders.total_amount', 'orders.status');

        // Aplicar filtros
        if (isset($this->filters['function_id']) && $this->filters['function_id'] !== 'all') {
            $buyersQuery->whereIn('orders.id', function ($query) {
                $query->select('order_id')
                    ->from('issued_tickets')
                    ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                    ->where('ticket_types.event_function_id', $this->filters['function_id']);
            });
        }

        if (isset($this->filters['search'])) {
            $searchTerm = $this->filters['search'];
            $buyersQuery->where(function ($q) use ($searchTerm) {
                $q->where(DB::raw("CONCAT(person.name, ' ', person.last_name)"), 'like', "%{$searchTerm}%")
                    ->orWhere('person.dni', 'like', "%{$searchTerm}%")
                    ->orWhere('users.email', 'like', "%{$searchTerm}%");
            });
        }

        // Aplicar filtro de fecha
        if (isset($this->filters['date_filter']) && $this->filters['date_filter'] !== 'all') {
            $dateRange = $this->getDateRange($this->filters['date_filter']);
            $buyersQuery->whereBetween('orders.order_date', [$dateRange['start'], $dateRange['end']]);
        }

        // Solo traemos las pagadas si es para facturar
        $buyersQuery->where('orders.status', 'paid');

        return $buyersQuery->get();
    }

    /**
     * Obtiene el rango de fechas según el filtro seleccionado
     */
    private function getDateRange(string $filter): array
    {
        $end = Carbon::now()->endOfDay();

        $start = match ($filter) {
            'today' => Carbon::now()->startOfDay(),
            'week' => Carbon::now()->subDays(7)->startOfDay(),
            'month' => Carbon::now()->subMonth()->startOfDay(),
            'quarter' => Carbon::now()->subMonths(3)->startOfDay(),
            'all' => Carbon::create(1970, 1, 1)->startOfDay(),
            default => Carbon::create(1970, 1, 1)->startOfDay(),
        };

        return ['start' => $start, 'end' => $end];
    }

    public function headings(): array
    {
        return [
            'Fecha de Compra',
            'Nombre',
            'Apellido',
            'DNI',
            'Email',
            'Cantidad',
            'Monto (' . ($this->type === 'service_fee' ? 'Cargos Servicio' : 'Entradas') . ')',
        ];
    }

    public function map($row): array
    {
        // Decidir qué monto mostrar según la selección del usuario
        $monto = ($this->type === 'service_fee')
            ? ($row->service_fee ?? 0)
            : ($row->subtotal ?? 0);

        return [
            Carbon::parse($row->date)->format('d/m/Y H:i'),
            $row->name,
            $row->last_name,
            $row->dni,
            $row->email,
            $row->quantity,
            $monto, // Formato numérico crudo para que Excel lo sume bien
        ];
    }
}
