<?php
// filepath: app/Http/Controllers/Public/CheckoutController.php

namespace App\Http\Controllers\Public;

use App\DTO\CheckoutData;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use App\Models\Order;
use App\Models\User;
use App\Services\EmailDispatcherService;
use App\Services\OrderService;
use App\Services\CheckoutService;
use App\Services\TicketLockService; // NUEVO
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    protected OrderService $orderService;
    protected EmailDispatcherService $emailDispatcher;
    protected TicketLockService $ticketLockService;
    protected CheckoutService $checkoutService;

    public function __construct(OrderService $orderService, EmailDispatcherService $emailDispatcher, TicketLockService $ticketLockService, CheckoutService $checkoutService)
    {
        $this->orderService = $orderService;
        $this->emailDispatcher = $emailDispatcher;
        $this->ticketLockService = $ticketLockService;
        $this->checkoutService = $checkoutService;
    }

    public function confirm(Request $request, Event $event): RedirectResponse | Response
    {
        $sessionId = $this->getPersistentLockId();

        try {
            $this->ticketLockService->releaseAllSessionLocks($sessionId);
            Log::info('Locks anteriores liberados para nueva sesión de checkout', [
                'session_base_id' => substr($sessionId, -8)
            ]);
        } catch (\Exception $e) {
            Log::warning('Error liberando locks anteriores', [
                'session_id' => substr($sessionId, -8),
                'error' => $e->getMessage()
            ]);
        }

        // ACTUALIZADO: Cargar el evento con ciudad y provincia
        $event->load(['venue.ciudad.provincia', 'category', 'organizer', 'functions.ticketTypes', 'cuotas']);

        $dataEncoded = $request->input('data');
        if (!$dataEncoded) {
            return redirect()->route('event.detail', $event->id)
                ->with('error', 'Datos de selección no proporcionados');
        }

        $decoded = json_decode(base64_decode($dataEncoded), true);

        $functionId = $decoded['function_id'];
        $selectedTicketIds = $decoded['tickets'];

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
                $errorMessages = array_map(function ($failure) {
                    return "Error con {$failure['message']}";
                }, $lockResult['failures']);

                return redirect()->route('event.detail', $event->id)
                    ->withErrors(['tickets' => $errorMessages])
                    ->with('error', 'Algunos tickets ya no están disponibles. Por favor, revisa tu selección.');
            }

            // Guardar información de bloqueo en sesión
            $request->session()->put('locked_tickets', $lockResult['locked_tickets']);
        }

        $cuotas_map = $event->cuotas
            ->where('habilitada', true)
            ->groupBy('bin')
            ->map(function ($items) {
                return $items->pluck('cantidad_cuotas')->unique()->sort()->values();
            });

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
            'cuotas' => $event->cuotas->where('habilitada', true)->values(),
            'cuotas_map' => $cuotas_map,
        ];

        return Inertia::render('public/newcheckoutconfirm', [
            'eventData' => $eventData,
            'eventId' => $event->id,
            'sessionId' => $sessionId, // NUEVO: Pasar session ID al frontend
            'lockExpiration' => now()->addMinutes(TicketLockService::LOCK_DURATION)->toISOString(),
            'ambient' => env('PAYWAY_ENV'),
        ]);
    }

    private function getPersistentLockId(): string
    {
        if (!session()->has('checkout_session_id')) {
            $newLockId = (string) Str::uuid();
            session(['checkout_session_id' => $newLockId]);
            Log::info('Generado nuevo checkout_session_id', ['lock_id' => $newLockId]);
        }
        return session('checkout_session_id');
    }

    public function processPayment(Request $request): RedirectResponse
    {
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

        $lockVerification = $this->ticketLockService->verifyLocks($lockedTickets, $sessionId);

        if (!$lockVerification['all_valid']) {
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
                'billing_info.discountCode' => 'nullable|string',
                'payment_info' => 'required|array',
                'payment_info.method' => 'required|string|in:visa_debito,visa_credito,mastercard_debito,mastercard_credito,amex,visa_prepaga,mastercard_prepaga',
                'payment_info.installments' => 'required|integer|min:1',
                'token' => 'required|string',
                'bin' => 'nullable|string',
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

            return redirect()->back()->withInput()->withErrors($e->errors());
        }

        try {

            $this->ticketLockService->releaseTickets($sessionId);

            $checkoutData = new CheckoutData(
                eventId: $validated['event_id'],
                functionId: $validated['function_id'],
                selected_tickets: $validated['selected_tickets'],
                paymentMethod: $validated['payment_info']['method'],
                installments: $validated['payment_info']['installments'],
                billingInfo: $validated['billing_info'] ?? null,
                paymentToken: $validated['token'],
                bin: $validated['bin'],
            );

            $checkoutResult = $this->checkoutService->processOrderPayment($checkoutData);

            if ($checkoutResult->success) {

                $request->session()->forget(['checkout_session_id', 'locked_tickets']);

                $redirectParams = ['order' => $checkoutResult->order->transaction_id ?? $checkoutResult->order->id];

                $signedUrl = URL::temporarySignedRoute('checkout.success', now()->addMinutes(60), $redirectParams);

                return redirect()->to($signedUrl)
                    ->with('success', '¡Compra realizada exitosamente!');
            } else {

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

        $orderKey = $request->query('order');
        $accountCreated = $request->query('account_created', false);

        if (!$orderKey) {
            Log::error('Order ID no encontrado en success page');
            return redirect()->route('home')
                ->with('error', 'Orden no encontrada');
        }

        try {

            // ACTUALIZADO: Cargar la orden con ciudad y provincia
            $order = Order::with([
                'items.ticketType.eventFunction.event.venue.ciudad.provincia',
                'client.person'
            ])
                ->where(function ($q) use ($orderKey) {
                    $q->where('transaction_id', $orderKey)
                        ->orWhere('id', $orderKey);
                })
                ->firstOrFail();

            // Si hay usuario logueado, asegurar que sea el dueño de la orden
            if (Auth::check() && $order->client_id !== Auth::id()) {
                abort(403, 'No tienes permiso para ver esta orden');
            }

            // Obtener resumen de la orden usando el servicio
            $orderSummary = $this->orderService->getOrderSummary($order);

            // Obtener datos del evento y función
            $firstTicket = $order->items->first();
            $eventFunction = $firstTicket->ticketType->eventFunction;
            $event = $eventFunction->event;


            // Preparar datos para la vista
            $purchaseData = [
                'transaction_id' => $orderSummary['order_number'],
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
                'tickets' => $orderSummary['grouped_tickets']->map(function ($ticket) {
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
                'order_id' => $orderKey,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('home')
                ->with('error', 'Error al mostrar la página de éxito');
        }
    }

    public function checkEmail(string $email): JsonResponse
    {
        $email = urldecode($email);

        $exists = User::where('email', $email)->exists();

        return response()->json([
            'exists' => $exists,
            'email' => $email
        ]);
    }

    public function releaseLocks(Request $request): RedirectResponse
    {
        $sessionId = $request->session()->get('checkout_session_id');
        $eventId = $request->input('event_id'); // Recibir desde el request

        if (!$sessionId) {
            // Si no hay eventId, redirigir a home con mensaje
            if (!$eventId) {
                return redirect()->route('home')
                    ->with('error', 'Sesión expirada');
            }

            return redirect()->route('event.detail', ['event' => $eventId])
                ->with('warning', 'Sesión expirada');
        }

        try {
            $this->ticketLockService->releaseTickets($sessionId);

            // Limpiar sesión
            $request->session()->forget(['checkout_session_id', 'locked_tickets']);

            // Si no hay eventId en el request, intentar obtenerlo del sessionStorage o redirigir a home
            if (!$eventId) {
                Log::warning('EventId no proporcionado en releaseLocks', [
                    'session_id' => substr($sessionId, -8)
                ]);

                return redirect()->route('home')
                    ->with('warning', 'Tu tiempo de reserva ha expirado. Los tickets han sido liberados.');
            }

            // Redirigir al detalle del evento
            return redirect()->route('event.detail', ['event' => $eventId])
                ->with('warning', 'Tu tiempo de reserva ha expirado. Los tickets han sido liberados.');
        } catch (\Exception $e) {
            Log::error('Error liberando locks', [
                'session_id' => $sessionId,
                'event_id' => $eventId,
                'error' => $e->getMessage()
            ]);

            // Fallback seguro
            if (!$eventId) {
                return redirect()->route('home')
                    ->with('error', 'Ha ocurrido un error. Por favor, intenta nuevamente.');
            }

            return redirect()->route('event.detail', ['event' => $eventId])
                ->with('error', 'Ha ocurrido un error. Por favor, intenta nuevamente.');
        }
    }
}
