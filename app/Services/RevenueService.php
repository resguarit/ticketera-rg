<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventFunction;
use App\Models\IssuedTicket;
use App\Models\Organizer;
use App\Models\TicketType;
use App\Enums\OrderStatus;
use App\Models\Order;
use Carbon\Carbon;

class RevenueService
{
    /**
     * Calcula los ingresos para un tipo de ticket especifico.
     * Suma el precio de los tickets emitidos cuya orden está pagada.
     */
    public function forTicketType(TicketType $ticketType, ?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        $query = Order::query()
            ->where('status', OrderStatus::PAID)
            ->whereHas('issuedTickets', function ($q) use ($ticketType) {
                $q->where('ticket_type_id', $ticketType->id);
            });

        if ($startDate && $endDate) {
            $query->whereBetween('order_date', [$startDate, $endDate]);
        }

        return $query->sum('total_amount');
    }

    /**
     * Calcula los ingresos para una funcion especifica.
     */
    public function forFunction(EventFunction $function, ?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        $query = Order::query()
            ->where('status', OrderStatus::PAID)
            ->whereHas('issuedTickets.ticketType', function ($q) use ($function) {
                $q->where('event_function_id', $function->id);
            });

        if ($startDate && $endDate) {
            $query->whereBetween('order_date', [$startDate, $endDate]);
        }

        return $query->sum('total_amount');
    }

    /**
     * Calcula los ingresos para un evento especifico.
     */
    public function forEvent(Event $event, ?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        $query = Order::query()
            ->where('status', OrderStatus::PAID)
            ->whereHas('issuedTickets.ticketType.eventFunction', function ($q) use ($event) {
                $q->where('event_id', $event->id);
            });

        if ($startDate && $endDate) {
            $query->whereBetween('order_date', [$startDate, $endDate]);
        }

        return $query->sum('total_amount');
    }

    /**
     * Calcula los ingresos para un organizador especifico.
     */
    public function forOrganizer(Organizer $organizer, ?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        $query = Order::query()
            ->where('status', OrderStatus::PAID)
            ->whereHas('issuedTickets.ticketType.eventFunction.event', function ($q) use ($organizer) {
                $q->where('organizer_id', $organizer->id);
            });

        if ($startDate && $endDate) {
            $query->whereBetween('order_date', [$startDate, $endDate]);
        }

        return $query->sum('total_amount');
    }

    /**
     * Calcula los ingresos totales de la plataforma.
     */
    public function forPlatform(?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        $query = Order::query()->where('status', OrderStatus::PAID);

        if ($startDate) {
            $query->whereBetween('order_date', [$startDate, $endDate]);
        }

        return $query->sum('total_amount');
    }

    /**
     * Calcula la cantidad de tickets vendidos en total.
     */
    public function ticketsSold(?Carbon $startDate = null): int
    {
        $query = IssuedTicket::whereHas('order', function ($query) use ($startDate) {
            $query->where('status', OrderStatus::PAID);
            if ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }
        });

        return $query->count();
    }
}