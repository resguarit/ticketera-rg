<?php
// filepath: app/Http/Controllers/Public/CheckoutController.php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CheckoutController extends Controller
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function confirm(Request $request, Event $event): Response
    {
        // ACTUALIZADO: Cargar el evento con ciudad y provincia
        $event->load(['venue.ciudad.provincia', 'category', 'organizer', 'functions.ticketTypes']);

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
            'image' => $event->image_url ?: "/placeholder.svg?height=200&width=300",
            'date' => $selectedFunction->start_time?->format('d M Y') ?? 'Fecha por confirmar',
            'time' => $selectedFunction->start_time?->format('H:i') ?? '',
            'location' => $event->venue->name,
            // ACTUALIZADO: usar la nueva estructura
            'city' => $event->venue->ciudad ? $event->venue->ciudad->name : 'Sin ciudad',
            'province' => $event->venue->ciudad && $event->venue->ciudad->provincia ? 
                $event->venue->ciudad->provincia->name : null,
            'full_address' => $event->venue->getFullAddressAttribute(),
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

    public function processPayment(Request $request): RedirectResponse
    {
        // Log de debug al inicio
        \Log::info('=== PROCESANDO CHECKOUT ===', [
            'url' => $request->url(),
            'method' => $request->method(),
            'all_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        try {
            $validated = $request->validate([
                'event_id' => 'required|exists:events,id',
                'function_id' => 'required|exists:event_functions,id',
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
            
            \Log::info('Validación exitosa');

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Error de validación', [
                'errors' => $e->errors(),
                'input' => $request->all()
            ]);
            
            return redirect()->back()
                ->withInput()
                ->withErrors($e->errors());
        }

        try {
            // Calcular totales usando el servicio
            $totals = $this->orderService->calculateOrderTotals($validated['selected_tickets']);

            // Preparar datos para crear la orden
            $orderData = [
                'event_id' => $validated['event_id'],
                'function_id' => $validated['function_id'],
                'selected_tickets' => $validated['selected_tickets'],
                'total_amount' => $totals['total_amount'],
                'payment_method' => $validated['payment_info']['method'],
                'billing_info' => $validated['billing_info'],
            ];

            // Crear la orden usando el servicio (esto manejará la creación del usuario si es necesario)
            $orderResult = $this->orderService->createOrder($orderData);
            
            // Verificar si se creó una nueva cuenta
            $accountCreated = $orderResult['account_created'] ?? false;
            $order = $orderResult['order'];

            // Procesar el pago usando el servicio
            $paymentSuccessful = $this->orderService->processPayment($order, $validated['payment_info']);

            if ($paymentSuccessful) {
                $redirectParams = ['order' => $order->id];
                
                // Solo agregar el parámetro si se creó una cuenta
                if ($accountCreated) {
                    $redirectParams['account_created'] = '1';
                }
                
                return redirect()->route('checkout.success', $redirectParams)
                    ->with('success', '¡Compra realizada exitosamente!');
            } else {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Error al procesar el pago. Por favor intenta de nuevo.');
            }

        } catch (\Exception $e) {
            \Log::error('Error en checkout: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'event_id' => $validated['event_id'],
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error al procesar la compra: ' . $e->getMessage());
        }
    }

    public function success(Request $request): Response
    {
        $orderId = $request->query('order');
        $accountCreated = $request->query('account_created', false);
        
        if (!$orderId) {
            return redirect()->route('home')
                ->with('error', 'Orden no encontrada');
        }

        // ACTUALIZADO: Cargar la orden con ciudad y provincia
        $order = Order::with([
            'items.ticketType.eventFunction.event.venue.ciudad.provincia',
            'client.person'
        ])->findOrFail($orderId);

        // Obtener resumen de la orden usando el servicio
        $orderSummary = $this->orderService->getOrderSummary($order);

        // Obtener datos del evento y función
        $firstTicket = $order->items->first();
        $eventFunction = $firstTicket->ticketType->eventFunction;
        $event = $eventFunction->event;

        // Preparar datos para la vista
        $purchaseData = [
            'orderId' => $orderSummary['order_number'],
            'event' => [
                'title' => $event->name,
                'image' => $event->image_url ?: "/placeholder.svg?height=200&width=300",
                'date' => $eventFunction->start_time?->format('d M Y') ?? 'Fecha por confirmar',
                'time' => $eventFunction->start_time?->format('H:i') ?? '',
                'location' => $event->venue->name,
                // ACTUALIZADO: usar la nueva estructura
                'city' => $event->venue->ciudad ? $event->venue->ciudad->name : 'Sin ciudad',
                'province' => $event->venue->ciudad && $event->venue->ciudad->provincia ? 
                    $event->venue->ciudad->provincia->name : null,
                'full_address' => $event->venue->getFullAddressAttribute(),
                'function' => [
                    'id' => $eventFunction->id,
                    'name' => $eventFunction->name,
                    'description' => $eventFunction->description,
                ],
            ],
            'tickets' => $orderSummary['grouped_tickets']->map(function($ticket) {
                return [
                    'type' => $ticket['ticket_type_name'],
                    'quantity' => $ticket['quantity'],
                    'price' => $ticket['unit_price'],
                ];
            })->toArray(),
            'total' => $order->total_amount,
            'purchaseDate' => $order->order_date->format('d/m/Y'),
        ];

        return Inertia::render('public/checkoutsuccess', [
            'purchaseData' => $purchaseData,
            'accountCreated' => (bool) $accountCreated
        ]);
    }
}