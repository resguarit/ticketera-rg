<?php
// filepath: app/Http/Controllers/User/TicketController.php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\IssuedTicket;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class TicketController extends Controller
{
    /**
     * Mostrar página de mis tickets (Listado de Órdenes)
     */
    public function index(): Response
    {
        $user = Auth::user();

        // Obtener órdenes del usuario con detalles del evento
        $orders = Order::with([
            'items.ticketType.eventFunction.event.venue.ciudad.provincia',
            'items.ticketType.eventFunction.event.category'
        ])
            ->where('client_id', $user->id)
            ->where('status', '!=', 'cancelled') // Opcional: mostrar cancelados con distintivo? El usuario pidió "mis tickets"
            ->orderByDesc('order_date')
            ->get()
            ->map(function ($order) {
                $firstItem = $order->items->first();
                $event = $firstItem ? $firstItem->ticketType->eventFunction->event : null;
                $eventFunction = $firstItem ? $firstItem->ticketType->eventFunction : null;

                if (!$event) return null;

                return [
                    'id' => $order->id,
                    'transaction_id' => $order->transaction_id,
                    'order_date' => $order->order_date->format('d M Y H:i'),
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'event' => [
                        'title' => $event->name,
                        'image' => $event->image_url ?: "/placeholder.svg?height=200&width=300",
                        'date' => $eventFunction->start_time?->format('d M Y') . ' • ' . $eventFunction->start_time?->format('H:i'),
                        'location' => $event->venue->name . ', ' . ($event->venue->ciudad->name ?? ''),
                    ],
                    'items_count' => $order->items->count(),
                ];
            })
            ->filter();

        return Inertia::render('user/mytickets', [
            'orders' => $orders->values(),
        ]);
    }

    /**
     * Mostrar página de todos mis tickets (Legacy View)
     */
    public function allTickets(): Response
    {
        $user = Auth::user();

        $tickets = IssuedTicket::with([
            'order',
            'ticketType.eventFunction.event.venue.ciudad.provincia',
            'ticketType.eventFunction.event.category',
            'ticketType.eventFunction.event.organizer'
        ])
            ->where('client_id', $user->id)
            ->where('status', '!=', 'cancelled')
            ->get()
            ->map(function ($ticket) {
                $event = $ticket->ticketType->eventFunction->event;
                $eventFunction = $ticket->ticketType->eventFunction;

                return [
                    'id' => $ticket->id,
                    'eventId' => $event->id,
                    'eventTitle' => $event->name,
                    'eventImage' => $event->image_url ?: "/placeholder.svg?height=200&width=300",
                    'date' => $eventFunction->start_time?->format('d M Y') ?? 'Fecha por confirmar',
                    'time' => $eventFunction->start_time?->format('H:i') ?? '',
                    'location' => $event->venue->name,
                    'city' => $event->venue->ciudad ? $event->venue->ciudad->name : 'Sin ciudad',
                    'province' => $event->venue->ciudad && $event->venue->ciudad->provincia ?
                        $event->venue->ciudad->provincia->name : null,
                    'full_address' => $event->venue->getFullAddressAttribute(),
                    'ticketType' => $ticket->ticketType->name,
                    'quantity' => 1,
                    'price' => $ticket->ticketType->price,
                    'total' => $ticket->ticketType->price,
                    'status' => $this->mapTicketStatus($ticket->status->value),
                    'qrCode' => $ticket->unique_code,
                    'purchaseDate' => $ticket->order->order_date->format('Y-m-d'),
                    'eventStartTime' => $eventFunction->start_time,
                    'eventEndTime' => $eventFunction->end_time,
                    'orderId' => $ticket->order->id, // Used for download link
                ];
            });

        $now = Carbon::now();
        $upcomingTickets = $tickets->filter(function ($ticket) use ($now) {
            $eventHasEnded = $this->hasEventEnded($ticket['eventStartTime'], $ticket['eventEndTime'], $now);
            return !$eventHasEnded && $ticket['status'] === 'available';
        })->values();

        $pastTickets = $tickets->filter(function ($ticket) use ($now) {
            $eventHasEnded = $this->hasEventEnded($ticket['eventStartTime'], $ticket['eventEndTime'], $now);
            return $eventHasEnded || $ticket['status'] === 'used';
        })->values();

        $stats = [
            'upcoming_count' => $upcomingTickets->count(),
            'past_count' => $pastTickets->count(),
            // 'total_spent' removed per request
        ];

        return Inertia::render('user/mytickets-all', [
            'tickets' => [
                'upcoming' => $upcomingTickets,
                'past' => $pastTickets,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Mostrar detalle de una orden específica
     */
    public function show(Order $order): Response
    {
        if ($order->client_id !== Auth::id()) {
            abort(403, 'No tienes permiso para ver esta orden');
        }

        $order->load([
            'items.ticketType.eventFunction.event.venue.ciudad.provincia',
            'items.ticketType.sector',
            'discountCode'
        ]);

        // 1. Tickets individuales para la lista superior
        $tickets = $order->items->map(function ($ticket) {
            $event = $ticket->ticketType->eventFunction->event;
            $eventFunction = $ticket->ticketType->eventFunction;

            return [
                'id' => $ticket->id,
                'unique_code' => $ticket->unique_code,
                'status' => $this->mapTicketStatus($ticket->status->value),
                'ticket_type_name' => $ticket->ticketType->name,
                'price' => $ticket->ticketType->price,
                'qr_data' => [
                    'event' => $event->name,
                    'date' => $eventFunction->start_time?->format('d/m/Y H:i'),
                    'venue' => $event->venue->name,
                    'type' => $ticket->ticketType->name,
                ]
            ];
        });

        // 2. Items agrupados para "Detalles de la compra" (lógica de AssistantController simplificada)
        $orderItems = $order->items->groupBy('ticket_type_id')->map(function ($items) {
            $firstItem = $items->first();
            $ticketType = $firstItem->ticketType;
            $count = $items->count();

            // Si es un bundle, la cantidad de compra es count / bundle_quantity
            if ($ticketType->is_bundle && $ticketType->bundle_quantity > 1) {
                $quantity = intdiv($count, $ticketType->bundle_quantity);
                // Si la división da 0 (caso raro de ticket suelto de un bundle), forzamos 1
                $quantity = $quantity > 0 ? $quantity : 1;
            } else {
                $quantity = $count;
            }

            return [
                'ticket_type_name' => $ticketType->name,
                'sector_name' => $ticketType->sector ? $ticketType->sector->name : '',
                'price' => $ticketType->price,
                'quantity' => $quantity,
                'is_bundle' => (bool)$ticketType->is_bundle
            ];
        })->values();

        // Información del evento (tomamos del primer item)
        $firstItem = $order->items->first();
        $eventInfo = null;
        if ($firstItem) {
            $event = $firstItem->ticketType->eventFunction->event;
            $eventInfo = [
                'title' => $event->name,
                'date' => $firstItem->ticketType->eventFunction->start_time?->format('d M Y H:i'),
                'venue' => $event->venue->name,
            ];
        }

        // Información de pago
        $discountRate = $order->discount ?? 0;
        $subtotal = $order->subtotal;
        $discountAmount = $subtotal * $discountRate;

        $paymentInfo = [
            'method' => $order->payment_method,
            'card_brand' => $order->card_brand,
            'card_bin' => $order->card_bin,
            'payment_type' => $order->payment_type,
            'installments' => $order->cuotas,
            'subtotal' => $subtotal,
            'service_fee' => $order->service_fee,
            'discount_rate' => $discountRate * 100,
            'discount_amount' => $discountAmount,
            'total' => $order->total_amount,
            'date' => $order->order_date->format('d/m/Y H:i'),
            'status' => $order->status,
        ];

        return Inertia::render('user/order-detail', [
            'order' => [
                'id' => $order->id,
                'transaction_id' => $order->transaction_id,
                'status' => $order->status,
                'created_at' => $order->created_at->format('Y-m-d H:i:s'),
            ],
            'event' => $eventInfo,
            'tickets' => $tickets,
            'order_items' => $orderItems,
            'payment' => $paymentInfo,
        ]);
    }

    /**
     * Descargar ticket individual
     */
    public function download(IssuedTicket $ticket)
    {
        // Verificar que el ticket pertenece al usuario autenticado
        if ($ticket->client_id !== Auth::id()) {
            abort(403, 'No tienes permiso para descargar este ticket');
        }

        return app(\App\Http\Controllers\User\TicketPDFController::class)
            ->downloadSingle($ticket);
    }
    
    // ... rest of existing methods (qrCode, transfer, mapTicketStatus) ...


    /**
     * Obtener QR code del ticket
     */
    public function qrCode(IssuedTicket $ticket)
    {
        // Verificar que el ticket pertenece al usuario autenticado
        if ($ticket->client_id !== Auth::id()) {
            abort(403, 'No tienes permiso para ver este ticket');
        }

        // ACTUALIZADO: Cargar con ciudad y provincia para obtener datos completos
        $ticket->load('ticketType.eventFunction.event.venue.ciudad.provincia');

        return response()->json([
            'qr_code' => $ticket->unique_code,
            'ticket_info' => [
                'event' => $ticket->ticketType->eventFunction->event->name,
                'date' => $ticket->ticketType->eventFunction->start_time?->format('d/m/Y H:i'),
                'type' => $ticket->ticketType->name,
                'venue' => $ticket->ticketType->eventFunction->event->venue->name,
                'city' => $ticket->ticketType->eventFunction->event->venue->ciudad ?
                    $ticket->ticketType->eventFunction->event->venue->ciudad->name : 'Sin ciudad',
                'full_address' => $ticket->ticketType->eventFunction->event->venue->getFullAddressAttribute(),
            ]
        ]);
    }

    /**
     * Transferir ticket a otro usuario
     */
    public function transfer(Request $request, IssuedTicket $ticket)
    {
        // Verificar que el ticket pertenece al usuario autenticado
        if ($ticket->client_id !== Auth::id()) {
            abort(403, 'No tienes permiso para transferir este ticket');
        }

        $validated = $request->validate([
            'recipient_email' => 'required|email|exists:users,email',
            'message' => 'nullable|string|max:500',
        ]);

        // Por ahora solo retornamos respuesta
        // Implementar lógica de transferencia más adelante
        return response()->json([
            'message' => 'Función de transferencia en desarrollo'
        ]);
    }

    private function hasEventEnded($startTime, $endTime, $now): bool
    {
        if ($endTime) {
            return $now->greaterThan($endTime);
        }
        if ($startTime) {
            return $now->greaterThan($startTime->copy()->addHours(4));
        }
        return false;
    }

    /**
     * Mapear estado del ticket
     */
    private function mapTicketStatus(string $status): string
    {
        return match ($status) {
            'available' => 'available',
            'used' => 'used',
            'cancelled' => 'cancelled',
            'reprinted' => 'reprinted',
            default => 'available'
        };
    }
}
