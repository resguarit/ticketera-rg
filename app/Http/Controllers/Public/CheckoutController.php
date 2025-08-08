<?php
// filepath: app/Http/Controllers/Public/CheckoutController.php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function confirm(Request $request, Event $event): Response
    {
        // Cargar el evento con todas sus relaciones
        $event->load(['venue', 'category', 'organizer', 'functions.ticketTypes']);

        // Obtener la función específica
        $functionId = $request->input('function_id');
        $selectedFunction = null;
        
        if ($functionId) {
            $selectedFunction = $event->functions->firstWhere('id', $functionId);
        } else {
            // Si no se especifica función, usar la primera
            $selectedFunction = $event->functions->first();
        }

        if (!$selectedFunction) {
            return redirect()->route('event.detail', $event->id)
                ->with('error', 'Función no encontrada');
        }

        // Obtener los tickets seleccionados
        $selectedTicketIds = $request->input('tickets', []);
        if (is_string($selectedTicketIds)) {
            $selectedTicketIds = json_decode($selectedTicketIds, true) ?? [];
        }

        $selectedTickets = [];

        if (!empty($selectedTicketIds)) {
            foreach ($selectedTicketIds as $ticketId => $quantity) {
                if ($quantity > 0) {
                    $ticketType = $selectedFunction->ticketTypes->firstWhere('id', $ticketId);
                    
                    if ($ticketType) {
                        $selectedTickets[] = [
                            'id' => $ticketType->id,
                            'type' => $ticketType->name,
                            'price' => $ticketType->price,
                            'quantity' => (int)$quantity,
                            'description' => $ticketType->description,
                        ];
                    }
                }
            }
        } else {
            // Si no hay tickets, usar datos de ejemplo para testing
            if ($selectedFunction->ticketTypes->isNotEmpty()) {
                $tickets = $selectedFunction->ticketTypes->take(2);
                foreach ($tickets as $index => $ticket) {
                    $selectedTickets[] = [
                        'id' => $ticket->id,
                        'type' => $ticket->name,
                        'price' => $ticket->price,
                        'quantity' => $index === 0 ? 2 : 1,
                        'description' => $ticket->description,
                    ];
                }
            }
        }

        // Preparar datos del evento para el checkout
        $eventData = [
            'id' => $event->id,
            'title' => $event->name,
            'image' => $event->banner_url ?: "/placeholder.svg?height=200&width=300",
            'date' => $selectedFunction->start_time?->format('d M Y') ?? 'Fecha por confirmar',
            'time' => $selectedFunction->start_time?->format('H:i') ?? '',
            'location' => $event->venue->name,
            'city' => $this->extractCity($event->venue->address),
            'selectedTickets' => $selectedTickets,
            'function' => [
                'id' => $selectedFunction->id,
                'name' => $selectedFunction->name,
                'description' => $selectedFunction->description,
                'start_time' => $selectedFunction->start_time,
                'end_time' => $selectedFunction->end_time,
            ]
        ];

        return Inertia::render('public/checkoutconfirm', [
            'eventData' => $eventData,
            'eventId' => $event->id,
        ]);
    }

    public function processPayment(Request $request)
    {
        // Validar datos del formulario
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'billing_info' => 'required|array',
            'billing_info.firstName' => 'required|string|max:255',
            'billing_info.lastName' => 'required|string|max:255',
            'billing_info.email' => 'required|email|max:255',
            'billing_info.phone' => 'required|string|max:20',
            'billing_info.documentType' => 'required|string|in:DNI,Pasaporte,Cedula',
            'billing_info.documentNumber' => 'required|string|max:20',
            'payment_info' => 'required|array',
            'payment_info.method' => 'required|string|in:credit,debit,mercadopago',
            'selected_tickets' => 'required|array|min:1',
            'agreements' => 'required|array',
            'agreements.terms' => 'required|boolean|accepted',
            'agreements.privacy' => 'required|boolean|accepted',
        ]);

        // Generar ID de orden único
        $orderId = 'TM-2024-' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);

        // Aquí procesarías el pago con la pasarela correspondiente
        // Por ahora simulamos el proceso

        // Almacenar datos de la compra en sesión para la página de éxito
        session([
            'order_id' => $orderId,
            'event_id' => $validated['event_id'],
            'purchase_data' => [
                'billing_info' => $validated['billing_info'],
                'selected_tickets' => $validated['selected_tickets'],
                'total_amount' => $this->calculateTotal($validated['selected_tickets']),
            ],
            'success' => true
        ]);

        return redirect()->route('checkout.success');
    }

    public function success(Request $request): Response
    {
        // Obtener datos de la sesión
        $orderId = session('order_id', 'TM-2024-001234');
        $eventId = session('event_id');
        $purchaseData = session('purchase_data', []);

        // Cargar datos reales del evento
        $eventData = null;
        if ($eventId) {
            $event = Event::with(['venue', 'category', 'functions.ticketTypes'])->find($eventId);
            if ($event) {
                // Intentar obtener la función desde los datos de compra o usar la primera
                $selectedFunction = $event->functions->first();
                
                $eventData = [
                    'title' => $event->name,
                    'image' => $event->banner_url ?: "/placeholder.svg?height=200&width=300",
                    'date' => $selectedFunction?->start_time?->format('d M Y') ?? 'Fecha por confirmar',
                    'time' => $selectedFunction?->start_time?->format('H:i') ?? '',
                    'location' => $event->venue->name,
                    'city' => $this->extractCity($event->venue->address),
                    'function' => $selectedFunction ? [
                        'id' => $selectedFunction->id,
                        'name' => $selectedFunction->name,
                        'description' => $selectedFunction->description,
                    ] : null,
                ];
            }
        }

        // Procesar tickets comprados desde los datos de sesión
        $ticketsData = [];
        if (!empty($purchaseData['selected_tickets'])) {
            foreach ($purchaseData['selected_tickets'] as $ticket) {
                $ticketsData[] = [
                    'type' => $ticket['type'],
                    'quantity' => $ticket['quantity'],
                    'price' => $ticket['price'],
                ];
            }
        } else {
            // Datos de fallback
            $ticketsData = [
                ['type' => 'General', 'quantity' => 2, 'price' => 8500],
                ['type' => 'VIP', 'quantity' => 1, 'price' => 15000],
            ];
        }

        $finalPurchaseData = [
            'orderId' => $orderId,
            'event' => $eventData ?: [
                'title' => "Festival de Música Electrónica 2024",
                'image' => "/placeholder.svg?height=200&width=300",
                'date' => "15 Mar 2024",
                'time' => "20:00",
                'location' => "Estadio Nacional",
                'city' => "Buenos Aires",
                'function' => null,
            ],
            'tickets' => $ticketsData,
            'total' => $purchaseData['total_amount'] ?? 32000,
            'purchaseDate' => now()->format('d/m/Y'),
        ];

        // Limpiar datos de sesión
        session()->forget(['order_id', 'event_id', 'purchase_data']);

        return Inertia::render('public/checkoutsuccess', [
            'purchaseData' => $finalPurchaseData
        ]);
    }

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

    private function calculateTotal(array $selectedTickets): int
    {
        $total = 0;
        foreach ($selectedTickets as $ticket) {
            $total += $ticket['price'] * $ticket['quantity'];
        }
        
        // Agregar cargo por servicio (5%)
        $serviceFeee = round($total * 0.05);
        
        return $total + $serviceFeee;
    }
}