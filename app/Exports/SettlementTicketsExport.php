<?php

namespace App\Exports;

use App\Models\Order;
use App\Models\IssuedTicket;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Carbon\Carbon;

class SettlementTicketsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $functionId;

    public function __construct($functionId)
    {
        $this->functionId = $functionId;
    }

    public function collection()
    {
        return Order::query()
            ->leftJoin('users', 'orders.client_id', '=', 'users.id')
            ->leftJoin('person', 'users.person_id', '=', 'person.id')
            ->join('issued_tickets', 'orders.id', '=', 'issued_tickets.order_id')
            ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
            ->where('ticket_types.event_function_id', $this->functionId)
            ->where('orders.status', 'paid')
            ->select(
                'orders.id',
                'orders.order_date',
                'person.name',
                'person.last_name',
                'person.dni',
                'users.email',
                'orders.subtotal',
                'orders.service_fee',
                'orders.total_amount',
                'orders.sales_channel',
                'ticket_types.name as ticket_type_name',
                'ticket_types.price as ticket_price',
            )
            ->withCount('issuedTickets as quantity')
            ->groupBy(
                'orders.id',
                'orders.order_date',
                'person.name',
                'person.last_name',
                'person.dni',
                'users.email',
                'orders.subtotal',
                'orders.service_fee',
                'orders.total_amount',
                'orders.sales_channel',
                'ticket_types.name',
                'ticket_types.price',
            )
            ->orderBy('orders.order_date', 'desc')
            ->get();
    }

    private function salesChannelLabel(\App\Enums\SalesChannel|string|null $channel): string
    {
        $value = $channel instanceof \App\Enums\SalesChannel ? $channel->value : $channel;
        return match ($value) {
            'online'      => 'Online',
            'box_office'  => 'Taquilla / Boletería',
            'sales_point' => 'Punto de Venta',
            default       => '—',
        };
    }

    public function headings(): array
    {
        return [
            'Fecha de Compra',
            'Nombre',
            'Apellido',
            'DNI',
            'Email',
            'Canal de Venta',
            'Tipo de Entrada',
            'Precio Unitario',
            'Cantidad',
            'Subtotal (Entradas)',
            'Cargo por Servicio',
            'Total',
        ];
    }

    public function map($row): array
    {
        return [
            Carbon::parse($row->order_date)->format('d/m/Y H:i'),
            $row->name          ?? 'N/A',
            $row->last_name     ?? 'N/A',
            $row->dni           ?? 'N/A',
            $row->email         ?? 'N/A',
            $this->salesChannelLabel($row->sales_channel),
            $row->ticket_type_name,
            (float) $row->ticket_price,
            $row->quantity,
            (float) $row->subtotal,
            (float) ($row->service_fee ?? 0),
            (float) $row->total_amount,
        ];
    }
}
