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
use Illuminate\Support\Facades\DB;

class RevenueService
{
    /**
     * Calcula los ingresos para un tipo de ticket especifico.
     * Suma el precio de los tickets emitidos cuya orden está pagada.
     */
    public function forTicketType(TicketType $ticketType, ?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        // Para bundles: necesitamos contar órdenes únicas (lotes vendidos)
        // Para individuales: contamos tickets emitidos normalmente
        
        if ($ticketType->is_bundle) {
            // Para bundles: contar órdenes distintas que compraron este tipo de ticket
            $lotesVendidos = Order::query()
                ->where('status', OrderStatus::PAID)
                ->whereHas('issuedTickets', function ($q) use ($ticketType) {
                    $q->where('ticket_type_id', $ticketType->id);
                });

            if ($startDate && $endDate) {
                $lotesVendidos->whereBetween('order_date', [$startDate, $endDate]);
            }

            $countLotes = $lotesVendidos->count();
            
            // Para bundles: precio del lote × cantidad de lotes vendidos
            return (float) ($countLotes * $ticketType->price);
        } else {
            // Para tickets individuales: mantener la lógica original
            $query = IssuedTicket::query()
                ->where('ticket_type_id', $ticketType->id)
                ->whereHas('order', function ($q) use ($startDate, $endDate) {
                    $q->where('status', OrderStatus::PAID);
                    if ($startDate && $endDate) {
                        $q->whereBetween('order_date', [$startDate, $endDate]);
                    }
                });

            $ticketCount = $query->count();
            
            return (float) ($ticketCount * $ticketType->price);
        }
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

        return (float) ($query->sum('total_amount') ?? 0);
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

        return (float) ($query->sum('total_amount') ?? 0);
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

        return (float) ($query->sum('total_amount') ?? 0);
    }

    /**
     * Calcula los ingresos totales de la plataforma.
     */
    public function forPlatform(?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        $query = Order::query()->where('status', OrderStatus::PAID);

        if ($startDate) {
            $query->whereBetween('order_date', [$startDate, $endDate ?? Carbon::now()]);
        }

        return (float) ($query->sum('total_amount') ?? 0);
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

    public function ticketsSoldByEvent(Event $event, ?Carbon $startDate = null): int
    {
        $query = IssuedTicket::whereHas('order', function ($query) use ($startDate) {
            $query->where('status', OrderStatus::PAID);
            if ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }
        })->whereHas('ticketType.eventFunction', function ($q) use ($event) {
            $q->where('event_id', $event->id);
        });

        return $query->count();
    }

    public function ticketsSoldByOrganizer(Organizer $organizer, ?Carbon $startDate = null): int
    {
        $query = IssuedTicket::whereHas('order', function ($query) use ($startDate) {
            $query->where('status', OrderStatus::PAID);
            if ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }
        })->whereHas('ticketType.eventFunction.event', function ($q) use ($organizer) {
            $q->where('organizer_id', $organizer->id);
        });

        return $query->count();
    }

    public function ticketsSoldByFunction(EventFunction $eventFunction, ?Carbon $startDate = null): int
    {
        $query = IssuedTicket::whereHas('order', function ($query) use ($startDate) {
            $query->where('status', OrderStatus::PAID);
            if ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }
        })->whereHas('ticketType', function ($q) use ($eventFunction) {
            $q->where('event_function_id', $eventFunction->id);
        });

        return $query->count();
    }

    public function ticketsSoldByTicketType(TicketType $ticketType, ?Carbon $startDate = null): int
    {
        $query = IssuedTicket::whereHas('order', function ($query) use ($startDate) {
            $query->where('status', OrderStatus::PAID);
            if ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }
        })->where('ticket_type_id', $ticketType->id);

        return $query->count();
    }

    /**
     * Obtiene los datos de ingresos de un organizador a lo largo del tiempo para un gráfico.
     */
    public function getOrganizerRevenueOverTime(Organizer $organizer, int $days): array
    {
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        $revenueData = Order::query()
            ->select(DB::raw('DATE(order_date) as date'), DB::raw('SUM(subtotal) as revenue'))
            ->where('status', OrderStatus::PAID)
            ->whereBetween('order_date', [$startDate, $endDate])
            ->whereHas('issuedTickets.ticketType.eventFunction.event', function ($q) use ($organizer) {
                $q->where('organizer_id', $organizer->id);
            })
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->pluck('revenue', 'date');

        // Rellenar los días sin ingresos
        $chartData = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i)->format('Y-m-d');
            $chartData[] = [
                'date' => Carbon::parse($date)->format('d M'),
                'revenue' => $revenueData[$date] ?? 0,
            ];
        }

        return $chartData;
    }

    /**
     * NUEVO: Calcula ingresos netos para un organizador (sin cargo por servicio)
     */
    public function netRevenueForOrganizer(Organizer $organizer, ?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        $query = Order::query()
            ->where('status', OrderStatus::PAID)
            ->whereHas('issuedTickets.ticketType.eventFunction.event', function ($q) use ($organizer) {
                $q->where('organizer_id', $organizer->id);
            });

        if ($startDate && $endDate) {
            $query->whereBetween('order_date', [$startDate, $endDate]);
        }

        return (float) ($query->sum('subtotal') ?? 0);
    }

    /**
     * NUEVO: Calcula cargo por servicio total para un organizador
     */
    public function serviceFeeForOrganizer(Organizer $organizer, ?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        $query = Order::query()
            ->where('status', OrderStatus::PAID)
            ->whereHas('issuedTickets.ticketType.eventFunction.event', function ($q) use ($organizer) {
                $q->where('organizer_id', $organizer->id);
            });

        if ($startDate && $endDate) {
            $query->whereBetween('order_date', [$startDate, $endDate]);
        }

        return (float) ($query->sum('service_fee') ?? 0);
    }

    /**
     * Calcula los ingresos netos para un evento (Total - Service Fee) de órdenes PAGADAS.
     */
    public function netRevenueForEvent(Event $event, ?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        $query = Order::query()
            ->where('status', OrderStatus::PAID)
            ->whereHas('issuedTickets.ticketType.eventFunction', function ($q) use ($event) {
                $q->where('event_id', $event->id);
            });

        if ($startDate && $endDate) {
            $query->whereBetween('order_date', [$startDate, $endDate]);
        }

        // Se calcula restando el service_fee al total_amount, o sumando subtotales si el descuento aplica al subtotal antes del fee.
        // Asumiendo que subtotal es el monto sin service fee.
        // Si hay descuentos, hay que tener cuidado.
        // User def: "ingresos netos serian esas mismas ordenes pero sin contar el cargo por servicio"
        // Si total_amount = subtotal_with_discount + service_fee
        // Entoces Net = total_amount - service_fee
        
        // Podemos sumar (total_amount - service_fee)
        return (float) ($query->sum(DB::raw('total_amount - service_fee')) ?? 0);
    }

    /**
     * Calcula los ingresos por cargo de servicio para un evento.
     * Incluye órdenes PAGADAS y órdenes REFUNDED donde se retuvo el service fee.
     */
    public function serviceFeeForEvent(Event $event, ?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        // 1. Service fee de órdenes pagadas
        $paidQuery = Order::query()
            ->where('status', OrderStatus::PAID)
            ->whereHas('issuedTickets.ticketType.eventFunction', function ($q) use ($event) {
                $q->where('event_id', $event->id);
            });

        if ($startDate && $endDate) {
            $paidQuery->whereBetween('order_date', [$startDate, $endDate]);
        }

        $paidFees = (float) ($paidQuery->sum('service_fee') ?? 0);

        // 2. Service fee de órdenes reembolsadas donde se retuvo el cargo (refunded_amount approx total - fee)
        // La condición "solo le fueron devuelta el monto de las entradas" implica que refunded_amount < total_amount
        // Y específicamente refunded_amount == subtotal (o total - fee).
        // Usaremos una aproximación por si hay decimales, o igualdad directa si es exacto.
        // Como es SQL, mejor usar condiciones simples.
        
        $refundedQuery = Order::query()
            ->where('status', OrderStatus::REFUNDED)
            ->whereHas('issuedTickets.ticketType.eventFunction', function ($q) use ($event) {
                $q->where('event_id', $event->id);
            })
            ->whereRaw('ABS(refunded_amount - (total_amount - service_fee)) < 0.05'); // Tolerancia pequeña para floats

        if ($startDate && $endDate) {
            $refundedQuery->whereBetween('order_date', [$startDate, $endDate]);
        }

        $refundedFees = (float) ($refundedQuery->sum('service_fee') ?? 0);

        return $paidFees + $refundedFees;
    }

    /**
     * Calcula los ingresos netos para una función (sin cargo por servicio)
     */
    public function netRevenueForFunction(EventFunction $function, ?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        $query = Order::query()
            ->where('status', OrderStatus::PAID)
            ->whereHas('issuedTickets.ticketType', function ($q) use ($function) {
                $q->where('event_function_id', $function->id);
            });

        if ($startDate && $endDate) {
            $query->whereBetween('order_date', [$startDate, $endDate]);
        }

        return (float) ($query->sum('subtotal') ?? 0);
    }

    /**
     * Calcula los ingresos netos para un tipo de ticket (sin cargo por servicio)
     */
    public function netRevenueForTicketType(TicketType $ticketType, ?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        if ($ticketType->is_bundle) {
            // Para bundles: contar órdenes únicas y multiplicar por el precio del lote
            $lotesVendidos = Order::query()
                ->where('status', OrderStatus::PAID)
                ->whereHas('issuedTickets', function ($q) use ($ticketType) {
                    $q->where('ticket_type_id', $ticketType->id);
                });

            if ($startDate && $endDate) {
                $lotesVendidos->whereBetween('order_date', [$startDate, $endDate]);
            }

            $countLotes = $lotesVendidos->count();
            return (float) ($countLotes * $ticketType->price);
        } else {
            // Para individuales: contar tickets vendidos y multiplicar por precio
            $vendidos = IssuedTicket::query()
                ->where('ticket_type_id', $ticketType->id)
                ->whereHas('order', function ($q) use ($startDate, $endDate) {
                    $q->where('status', OrderStatus::PAID);
                    if ($startDate && $endDate) {
                        $q->whereBetween('order_date', [$startDate, $endDate]);
                    }
                })
                ->count();

            return (float) ($vendidos * $ticketType->price);
        }
    }
}