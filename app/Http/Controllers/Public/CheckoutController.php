<?php
// filepath: app/Http/Controllers/Public/CheckoutController.php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\TicketLockService; // NUEVO
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
    protected TicketLockService $ticketLockService; // NUEVO

    public function __construct(OrderService $orderService, TicketLockService $ticketLockService)
    {
        $this->orderService = $orderService;
        $this->ticketLockService = $ticketLockService; // NUEVO
    }

    public function confirm(Request $request, Event $event): RedirectResponse | Response
    {
        // NUEVO: Generar ID de sesión único para esta compra
        $sessionId = $request->session()->getId() . '_' . time();
        $request->session()->put('checkout_session_id', $sessionId);

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

        // MODIFICADO: Preparar tickets con información de bloqueo
        $selectedTickets = [];
        $ticketRequests = [];

        if (!empty($selectedTicketIds)) {
            foreach ($selectedTicketIds as $ticketId => $quantity) {
                if ($quantity > 0) {
                    $ticketType = $selectedFunction->ticketTypes->firstWhere('id', $ticketId);
                    
                    if ($ticketType) {
                        $ticketRequests[] = [
                            'id' => $ticketType->id,
                            'quantity' => (int)$quantity
                        ];

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

        // NUEVO: Intentar bloquear los tickets
        if (!empty($ticketRequests)) {
            $lockResult = $this->ticketLockService->lockTickets($ticketRequests, $sessionId);
            
            if (!$lockResult['success']) {
                // Redirigir con errores de disponibilidad
                $errorMessages = array_map(function($failure) {
                    return "Error con {$failure['message']}";
                }, $lockResult['failures']);
                
                return redirect()->route('event.detail', $event->id)
                    ->withErrors(['tickets' => $errorMessages])
                    ->with('error', 'Algunos tickets ya no están disponibles. Por favor, revisa tu selección.');
            }
            
            // Guardar información de bloqueo en sesión
            $request->session()->put('locked_tickets', $lockResult['locked_tickets']);
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
            'sessionId' => $sessionId, // NUEVO: Pasar session ID al frontend
            'lockExpiration' => now()->addMinutes(TicketLockService::LOCK_DURATION)->toISOString() // NUEVO
        ]);
    }

    public function processPayment(Request $request): RedirectResponse
    {
        // NUEVO: Verificar locks antes de procesar
        $sessionId = $request->session()->get('checkout_session_id');
        $lockedTickets = $request->session()->get('locked_tickets', []);
        
        if (empty($sessionId) || empty($lockedTickets)) {
            return $this->redirectToError([
                'title' => 'Sesión Expirada',
                'message' => 'Tu sesión de compra ha expirado. Por favor, inicia el proceso nuevamente.',
                'errorCode' => 'SESSION_EXPIRED',
                'canRetry' => true,
                'retryUrl' => route('event.detail', $request->input('event_id')),
                'eventId' => $request->input('event_id'),
                'eventName' => Event::find($request->input('event_id'))->name ?? null,
                'timestamp' => now()->format('d/m/Y H:i')
            ]);
        }

        // Verificar que los locks siguen válidos
        $lockVerification = $this->ticketLockService->verifyLocks($lockedTickets, $sessionId);
        
        if (!$lockVerification['all_valid']) {
            // Liberar todos los locks de esta sesión
            $this->ticketLockService->releaseTickets($sessionId);
            
            return $this->redirectToError([
                'title' => 'Tickets No Disponibles',
                'message' => 'Los tickets que seleccionaste ya no están disponibles. Tu reserva ha expirado.',
                'errorCode' => 'TICKETS_EXPIRED',
                'canRetry' => true,
                'retryUrl' => route('event.detail', $request->input('event_id')),
                'eventId' => $request->input('event_id'),
                'eventName' => Event::find($request->input('event_id'))->name ?? null,
                'timestamp' => now()->format('d/m/Y H:i')
            ]);
        }

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
            
            // Obtener el evento para acceder al tax
            $event = Event::findOrFail($validated['event_id']);
            $eventTax = $event->tax ? ($event->tax / 100) : 0; // Convertir a decimal



            // Calcular totales usando el servicio
            $totals = $this->orderService->calculateOrderTotals($validated['selected_tickets'], 0, $eventTax);

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


            // 🔥 IMPORTANTE: Liberar locks ANTES de crear la orden
            Log::info('=== ANTES DE LIBERAR LOCKS ===', [
                'session_id' => substr($sessionId, -8),
                'availability_before' => $this->ticketLockService->getAvailability($validated['selected_tickets'][0]['id'])
            ]);

            $this->ticketLockService->releaseTickets($sessionId);

            Log::info('=== DESPUÉS DE LIBERAR LOCKS ===', [
                'session_id' => substr($sessionId, -8),
                'availability_after' => $this->ticketLockService->getAvailability($validated['selected_tickets'][0]['id'])
            ]);

            // Crear la orden usando el servicio
            $orderResult = $this->orderService->createOrder($orderData);
            $order = $orderResult['order'];

            Log::info('=== DESPUÉS DE CREAR ORDEN ===', [
                'order_id' => $order->id,
                'availability_final' => $this->ticketLockService->getAvailability($validated['selected_tickets'][0]['id'])
            ]);

            // Procesar el pago
            $paymentSuccessful = $this->orderService->processPayment($order, $validated['payment_info']);

            if ($paymentSuccessful) {
                // Ya no necesitas liberar locks aquí porque ya se liberaron
                
                // Limpiar sesión
                $request->session()->forget(['checkout_session_id', 'locked_tickets']);
                
                $redirectParams = ['order' => $order->id];
                if ($orderResult['account_created'] ?? false) {
                    $redirectParams['account_created'] = '1';
                }
                
                return redirect()->route('checkout.success', $redirectParams)
                    ->with('success', '¡Compra realizada exitosamente!');
            } else {
                // Si el pago falla, la orden ya está creada pero en estado cancelled/failed
                // No necesitamos liberar locks porque ya se liberaron antes de crear la orden
                
                return $this->redirectToError([
                    'title' => 'Error en el Pago',
                    'message' => 'No pudimos procesar tu pago. La orden ha sido cancelada.',
                    'errorCode' => 'PAYMENT_FAILED',
                    'canRetry' => true,
                    'retryUrl' => route('event.detail', $validated['event_id']),
                    'eventId' => $validated['event_id'],
                    'eventName' => Event::find($validated['event_id'])->name ?? null,
                    'timestamp' => now()->format('d/m/Y H:i')
                ]);
            }

        } catch (\Exception $e) {
            // En caso de error, liberar locks si aún no se han liberado
            // (esto manejará el caso donde el error ocurre antes de liberar los locks)
            try {
                $this->ticketLockService->releaseTickets($sessionId);
            } catch (\Exception $releaseError) {
                Log::error('Error liberando locks en catch', ['error' => $releaseError->getMessage()]);
            }
            
            Log::error('Error general en checkout', [
                'message' => $e->getMessage(),
                'session_id' => $sessionId ?? 'unknown',
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return $this->redirectToError([
                'title' => 'Error Inesperado',
                'message' => 'Ha ocurrido un error inesperado. Por favor intenta nuevamente.',
                'errorCode' => 'SYSTEM_ERROR',
                'canRetry' => true,
                'retryUrl' => route('event.detail', $request->input('event_id')),
                'eventId' => $request->input('event_id'),
                'eventName' => Event::find($request->input('event_id'))->name ?? null,
                'timestamp' => now()->format('d/m/Y H:i')
            ]);
        }
    }

    /**
     * Redirigir a la página de error con datos específicos
     */
    private function redirectToError(array $errorData): RedirectResponse
    {
        return redirect()->route('checkout.error', [
            'data' => base64_encode(json_encode($errorData))
        ]);
    }

    /**
     * Mostrar página de error
     */
    public function error(Request $request): Response | RedirectResponse
    {
        $encodedData = $request->query('data');
        
        if (!$encodedData) {
            return redirect()->route('home')
                ->with('error', 'Error desconocido');
        }

        try {
            $errorData = json_decode(base64_decode($encodedData), true);
            
            if (!$errorData) {
                throw new \Exception('Datos de error inválidos');
            }

            return Inertia::render('public/checkouterror', [
                'errorData' => $errorData
            ]);

        } catch (\Exception $e) {
            Log::error('Error mostrando página de error', [
                'message' => $e->getMessage(),
                'encoded_data' => $encodedData
            ]);

            return redirect()->route('home')
                ->with('error', 'Ha ocurrido un error. Por favor intenta nuevamente.');
        }
    }

    public function success(Request $request): Response | RedirectResponse
    {

        $orderId = $request->query('order');
        $accountCreated = $request->query('account_created', false);
        
        if (!$orderId) {
            Log::error('Order ID no encontrado en success page');
            return redirect()->route('home')
                ->with('error', 'Orden no encontrada');
        }

        try {
            
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