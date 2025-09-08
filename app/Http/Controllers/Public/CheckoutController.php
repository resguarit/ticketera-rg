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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;

class CheckoutController extends Controller
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function confirm(Request $request, Event $event): RedirectResponse | Response
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
                            'is_bundle' => $ticketType->isBundle(),
                            'bundle_quantity' => $ticketType->bundle_quantity,
                        ];
                    }
                }
            }
        }

        // Preparar datos del evento para el checkout
        $eventData = [
            'id' => $event->id,
            'name' => $event->name,
            'image_url' => $event->image_url ?: "/placeholder.svg?height=200&width=300",
            'date' => $selectedFunction->start_time?->format('d M Y') ?? 'Fecha por confirmar',
            'time' => $selectedFunction->start_time?->format('H:i') ?? '',
            'location' => $event->venue->name,
            'city' => $event->venue->ciudad ? $event->venue->ciudad->name : 'Sin ciudad',
            'province' => $event->venue->ciudad && $event->venue->ciudad->provincia ? 
                $event->venue->ciudad->provincia->name : null,
            'full_address' => $event->venue->getFullAddressAttribute(),
            'selectedTickets' => $selectedTickets,
            'function' => $selectedFunction,
            'organizer' => $event->organizer,
            'tax' => $event->tax, // <-- AÑADIR ESTO
        ];

        return Inertia::render('public/checkoutconfirm', [
            'eventData' => $eventData,
            'eventId' => $event->id,
        ]);
    }

    public function processPayment(Request $request): RedirectResponse
    {
        Log::info('=== PROCESANDO CHECKOUT - INICIO ===', [
            'url' => $request->url(),
            'method' => $request->method(),
            'user_agent' => $request->userAgent(),
            'ip' => $request->ip(),
            'auth_check' => Auth::check(),
            'auth_user_id' => Auth::id()
        ]);

        // Log de todos los datos de entrada (sin datos sensibles)
        $allData = $request->all();
        if (isset($allData['payment_info']['cardNumber'])) {
            $allData['payment_info']['cardNumber'] = '**** **** **** ' . substr($allData['payment_info']['cardNumber'], -4);
        }
        if (isset($allData['payment_info']['cvv'])) {
            $allData['payment_info']['cvv'] = '***';
        }
        Log::info('Datos recibidos en checkout', ['request_data' => $allData]);

        try {
            Log::info('Iniciando validación de datos');
            
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
            
            Log::info('Validación exitosa', ['validated_keys' => array_keys($validated)]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación en checkout', [
                'errors' => $e->errors(),
                'failed_rules' => $e->validator->failed(),
                'input_keys' => array_keys($request->all())
            ]);
            
            return redirect()->back()
                ->withInput()
                ->withErrors($e->errors());
        }

        try {
            Log::info('Obteniendo evento para tax calculation', ['event_id' => $validated['event_id']]);
            
            // Obtener el evento para acceder al tax
            $event = Event::findOrFail($validated['event_id']);
            $eventTax = $event->tax ? ($event->tax / 100) : 0; // Convertir a decimal

            Log::info('Event tax calculado', [
                'event_tax_percent' => $event->tax,
                'event_tax_decimal' => $eventTax
            ]);

            // Calcular totales usando el servicio
            Log::info('Calculando totales usando OrderService');
            $totals = $this->orderService->calculateOrderTotals($validated['selected_tickets'], 0, $eventTax);
            Log::info('Totales calculados por OrderService', $totals);

            // Preparar datos para crear la orden
            $orderData = [
                'event_id' => $validated['event_id'],
                'function_id' => $validated['function_id'],
                'selected_tickets' => $validated['selected_tickets'],
                'total_amount' => $totals['total_amount'],
                'payment_method' => $validated['payment_info']['method'],
                'billing_info' => $validated['billing_info'],
                'tax' => $eventTax,
            ];

            Log::info('Datos preparados para crear orden', ['order_data' => $orderData]);

            // Crear la orden usando el servicio (esto manejará la creación del usuario si es necesario)
            Log::info('Llamando a OrderService::createOrder');
            $orderResult = $this->orderService->createOrder($orderData);
            
            Log::info('OrderService::createOrder completado', [
                'order_id' => $orderResult['order']->id,
                'account_created' => $orderResult['account_created']
            ]);

            // Verificar si se creó una nueva cuenta
            $accountCreated = $orderResult['account_created'] ?? false;
            $order = $orderResult['order'];

            // Procesar el pago usando el servicio
            Log::info('Iniciando procesamiento de pago', ['order_id' => $order->id]);
            $paymentSuccessful = $this->orderService->processPayment($order, $validated['payment_info']);
            Log::info('Resultado de procesamiento de pago', ['payment_successful' => $paymentSuccessful]);

            if ($paymentSuccessful) {
                $redirectParams = ['order' => $order->id];
                
                // Solo agregar el parámetro si se creó una cuenta
                if ($accountCreated) {
                    $redirectParams['account_created'] = '1';
                }

                Log::info('Pago exitoso, redirigiendo a success', [
                    'order_id' => $order->id,
                    'redirect_params' => $redirectParams,
                    'redirect_route' => route('checkout.success', $redirectParams)
                ]);
                
                return redirect()->route('checkout.success', $redirectParams)
                    ->with('success', '¡Compra realizada exitosamente!');
            } else {
                Log::error('Pago falló, redirigiendo con error');
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Error al procesar el pago. Por favor intenta de nuevo.');
            }

        } catch (\Exception $e) {
            Log::error('Error general en checkout', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'event_id' => $validated['event_id'] ?? 'no_event_id',
                'request_data_keys' => array_keys($request->all())
            ]);
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error al procesar la compra: ' . $e->getMessage());
        }
    }

    public function success(Request $request): Response | RedirectResponse
    {
        Log::info('=== CHECKOUT SUCCESS - INICIO ===', [
            'query_params' => $request->query(),
            'order_id' => $request->query('order'),
            'account_created' => $request->query('account_created')
        ]);

        $orderId = $request->query('order');
        $accountCreated = $request->query('account_created', false);
        
        if (!$orderId) {
            Log::error('Order ID no encontrado en success page');
            return redirect()->route('home')
                ->with('error', 'Orden no encontrada');
        }

        try {
            Log::info('Cargando orden para success page', ['order_id' => $orderId]);
            
            // ACTUALIZADO: Cargar la orden con ciudad y provincia
            $order = Order::with([
                'items.ticketType.eventFunction.event.venue.ciudad.provincia',
                'client.person'
            ])->findOrFail($orderId);

            Log::info('Orden cargada exitosamente', [
                'order_id' => $order->id,
                'status' => $order->status,
                'total_amount' => $order->total_amount,
                'items_count' => $order->items->count()
            ]);

            // Obtener resumen de la orden usando el servicio
            Log::info('Obteniendo resumen de orden');
            $orderSummary = $this->orderService->getOrderSummary($order);
            Log::info('Resumen de orden obtenido', ['summary_keys' => array_keys($orderSummary)]);

            // Obtener datos del evento y función
            $firstTicket = $order->items->first();
            $eventFunction = $firstTicket->ticketType->eventFunction;
            $event = $eventFunction->event;

            Log::info('Datos de evento y función obtenidos', [
                'event_id' => $event->id,
                'event_name' => $event->name,
                'function_id' => $eventFunction->id,
                'function_name' => $eventFunction->name
            ]);

            // Preparar datos para la vista
            $purchaseData = [
                'orderId' => $orderSummary['order_number'],
                'event' => [
                    'name' => $event->name,
                    'image_url' => $event->image_url ?: "/placeholder.svg?height=200&width=300",
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
                    $ticketData = [
                        'type' => $ticket['ticket_type_name'],
                        'quantity' => $ticket['quantity'],
                        'price' => $ticket['unit_price'],
                    ];
                    
                    // Agregar información de bundle si aplica
                    if (isset($ticket['is_bundle']) && $ticket['is_bundle']) {
                        $ticketData['is_bundle'] = true;
                        $ticketData['bundle_quantity'] = $ticket['bundle_quantity'];
                        $ticketData['total_individual_tickets'] = $ticket['quantity'] * $ticket['bundle_quantity'];
                    }
                    
                    return $ticketData;
                })->toArray(),
                'total' => $order->total_amount,
                'purchaseDate' => $order->order_date->format('d/m/Y'),
            ];

            Log::info('Purchase data preparado', ['purchase_data_keys' => array_keys($purchaseData)]);

            Log::info('Renderizando success page', [
                'order_id' => $orderId,
                'account_created' => (bool) $accountCreated
            ]);

            return Inertia::render('public/checkoutsuccess', [
                'purchaseData' => $purchaseData,
                'accountCreated' => (bool) $accountCreated
            ]);

        } catch (\Exception $e) {
            Log::error('Error en success page', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('home')
                ->with('error', 'Error al mostrar la página de éxito');
        }
    }
}