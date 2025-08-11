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
     * Mostrar página de mis tickets
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        // Obtener todos los tickets del usuario
        $tickets = IssuedTicket::with([
            'order',
            'ticketType.eventFunction.event.venue',
            'ticketType.eventFunction.event.category'
        ])
        ->where('client_id', $user->id)
        ->get()
        ->map(function ($ticket) {
            $event = $ticket->ticketType->eventFunction->event;
            $eventFunction = $ticket->ticketType->eventFunction;
            
            return [
                'id' => $ticket->id,
                'eventId' => $event->id,
                'eventTitle' => $event->name,
                'eventImage' => $event->banner_url ?: "/placeholder.svg?height=200&width=300",
                'date' => $eventFunction->start_time?->format('d M Y') ?? 'Fecha por confirmar',
                'time' => $eventFunction->start_time?->format('H:i') ?? '',
                'location' => $event->venue->name,
                'city' => $this->extractCity($event->venue->address),
                'ticketType' => $ticket->ticketType->name,
                'quantity' => 1, // Cada IssuedTicket es individual
                'price' => $ticket->ticketType->price,
                'total' => $ticket->ticketType->price,
                'status' => $this->mapTicketStatus($ticket->status->value),
                'qrCode' => $ticket->unique_code,
                'purchaseDate' => $ticket->order->order_date->format('Y-m-d'),
                'eventDateTime' => $eventFunction->start_time,
                'order' => [
                    'id' => $ticket->order->id,
                    'order_number' => $this->generateOrderNumber($ticket->order),
                ]
            ];
        });

        // Separar tickets próximos y pasados
        $now = Carbon::now();
        $upcomingTickets = $tickets->filter(function ($ticket) use ($now) {
            return $ticket['eventDateTime'] && Carbon::parse($ticket['eventDateTime'])->gte($now);
        })->values();

        $pastTickets = $tickets->filter(function ($ticket) use ($now) {
            return $ticket['eventDateTime'] && Carbon::parse($ticket['eventDateTime'])->lt($now);
        })->values();

        // Estadísticas
        $stats = [
            'upcoming_count' => $upcomingTickets->count(),
            'past_count' => $pastTickets->count(),
            'total_spent' => $tickets->sum('total'),
        ];

        return Inertia::render('user/mytickets', [
            'tickets' => [
                'upcoming' => $upcomingTickets,
                'past' => $pastTickets,
            ],
            'stats' => $stats,
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

        // Por ahora retornamos una respuesta simple
        // Aquí implementarías la generación del PDF del ticket
        return response()->json([
            'message' => 'Función de descarga en desarrollo',
            'ticket_code' => $ticket->unique_code
        ]);
    }

    /**
     * Obtener QR code del ticket
     */
    public function qrCode(IssuedTicket $ticket)
    {
        // Verificar que el ticket pertenece al usuario autenticado
        if ($ticket->client_id !== Auth::id()) {
            abort(403, 'No tienes permiso para ver este ticket');
        }

        return response()->json([
            'qr_code' => $ticket->unique_code,
            'ticket_info' => [
                'event' => $ticket->ticketType->eventFunction->event->name,
                'date' => $ticket->ticketType->eventFunction->start_time?->format('d/m/Y H:i'),
                'type' => $ticket->ticketType->name,
                'venue' => $ticket->ticketType->eventFunction->event->venue->name,
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

    /**
     * Mapear estado del ticket
     */
    private function mapTicketStatus(string $status): string
    {
        return match($status) {
            'AVAILABLE' => 'confirmed',
            'USED' => 'used',
            'CANCELLED' => 'cancelled',
            'TRANSFERRED' => 'transferred',
            default => 'pending'
        };
    }

    /**
     * Generar número de orden
     */
    private function generateOrderNumber(Order $order): string
    {
        return 'TM-' . date('Y') . '-' . str_pad($order->id, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Extraer ciudad de dirección
     */
    private function extractCity(string $address): string
    {
        $parts = explode(',', $address);
        $cities = ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Montevideo'];
        
        foreach ($parts as $part) {
            $part = trim($part);
            foreach ($cities as $city) {
                if (stripos($part, $city) !== false) {
                    return $city;
                }
            }
        }
        
        return count($parts) > 1 ? trim($parts[count($parts) - 2]) : 'Buenos Aires';
    }
}