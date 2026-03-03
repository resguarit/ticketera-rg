<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\IssuedTicket;
use App\Models\Order;
use App\Models\TicketType;
use App\Enums\EmissionType;
use App\Enums\IssuedTicketStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\SalesChannel;
use App\Jobs\SendOrderTicketJob;
use App\Services\OrderService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BoxOfficeController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Obtiene el organizador correcto considerando impersonación.
     */
    private function getOrganizer(Request $request): \App\Models\Organizer
    {
        if ($request->session()->has('impersonated_organizer_id')) {
            return \App\Models\Organizer::findOrFail($request->session()->get('impersonated_organizer_id'));
        }

        return Auth::user()->organizer;
    }

    /**
     * Muestra la vista de boletería (punto de venta presencial).
     */
    public function index(Request $request, Event $event)
    {
        $organizer = $this->getOrganizer($request);

        if ($event->organizer_id !== $organizer->id) {
            abort(403, 'No tienes permisos para gestionar este evento.');
        }

        // Cargar funciones activas con sus ticket types individuales (no-bundle)
        $eventFunctions = $event->functions()
            ->with(['ticketTypes' => function ($query) {
                $query->where('is_bundle', false)
                    ->where('is_hidden', false)
                    ->with('sector');
            }])
            ->where('is_active', true)
            ->get()
            ->map(function ($function) {
                $startTime = Carbon::parse($function->start_time);

                $function->ticketTypes = $function->ticketTypes->map(function ($ticketType) {
                    $totalIssued = $ticketType->issuedTickets()
                        ->whereNotNull('order_id')
                        ->where('status', '!=', IssuedTicketStatus::CANCELLED)
                        ->count();

                    $available = $ticketType->quantity - $totalIssued;
                    $ticketType->available = max(0, $available);
                    $ticketType->sold      = $totalIssued;

                    return $ticketType;
                });

                $function->date           = $startTime->format('d/m/Y');
                $function->time           = $startTime->format('H:i');
                $function->formatted_date = $startTime->format('d \d\e F \d\e Y');
                $function->day_name       = $startTime->locale('es')->dayName;

                return $function;
            });

        return Inertia::render('organizer/events/box-office', [
            'event'          => $event->load(['category', 'venue']),
            'eventFunctions' => $eventFunctions,
            'platform_fee'   => (float) $event->tax,   // e.g. 0.10 → 10%
        ]);
    }

    /**
     * Procesa una venta de boletería.
     * Crea la Order, los IssuedTickets y opcionalmente dispara el envío de email.
     */
    public function store(Request $request, Event $event)
    {
        $organizer = $this->getOrganizer($request);

        if ($event->organizer_id !== $organizer->id) {
            abort(403, 'No tienes permisos para gestionar este evento.');
        }

        $validated = $request->validate([
            'ticket_type_id' => ['required', 'integer', 'exists:ticket_types,id'],
            'quantity'        => ['required', 'integer', 'min:1', 'max:200'],
            'payment_method'  => ['required', 'string', 'in:' . implode(',', array_map(
                fn($m) => $m->value,
                array_filter(PaymentMethod::cases(), fn($m) => !$m->isPayway())
            ))],
            'contact_email'   => ['nullable', 'email', 'max:255'],
            'apply_fee'       => ['boolean'],
        ]);

        // Verificar que el ticket type pertenece a este evento y tiene stock
        $ticketType = TicketType::whereHas('eventFunction', function ($q) use ($event) {
            $q->where('event_id', $event->id);
        })->where('id', $validated['ticket_type_id'])
            ->where('is_bundle', false)
            ->firstOrFail();

        $quantity  = (int) $validated['quantity'];
        $applyFee  = (bool) ($validated['apply_fee'] ?? true);

        // Verificar stock disponible
        $totalIssued = $ticketType->issuedTickets()
            ->whereNotNull('order_id')
            ->where('status', '!=', IssuedTicketStatus::CANCELLED)
            ->count();

        $available = $ticketType->quantity - $totalIssued;

        if ($quantity > $available) {
            return response()->json([
                'message' => "Stock insuficiente. Solo quedan {$available} entradas disponibles.",
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Calcular totales — event->tax está en porcentaje (ej. 15.0 = 15%), convertir a tasa decimal
            $subtotal   = $ticketType->price * $quantity;
            $feeRate    = $applyFee ? ((float) $event->tax / 100) : 0.0;
            $serviceFee = round($subtotal * $feeRate, 2);
            $total      = $subtotal + $serviceFee;

            // Crear la orden (sin cliente registrado)
            $order = Order::create([
                'client_id'      => null,
                'contact_email'  => $validated['contact_email'] ?? null,
                'order_date'     => now(),
                'status'         => OrderStatus::PAID,
                'sales_channel'  => SalesChannel::BOX_OFFICE,
                'payment_method' => $validated['payment_method'],
                'subtotal'       => $subtotal,
                'tax'            => $feeRate,
                'service_fee'    => $serviceFee,
                'total_amount'   => $total,
                'order_details'  => [
                    [
                        'ticket_type_id' => $ticketType->id,
                        'ticket_type_name' => $ticketType->name,
                        'price'          => $ticketType->price,
                        'quantity'       => $quantity,
                        'subtotal'       => $subtotal,
                    ],
                ],
            ]);

            // Crear los issued tickets
            $ticketIds = [];
            for ($i = 0; $i < $quantity; $i++) {
                $ticket = IssuedTicket::create([
                    'ticket_type_id' => $ticketType->id,
                    'order_id'       => $order->id,
                    'assistant_id'   => null,
                    'client_id'      => null,
                    'unique_code'    => $this->orderService->generateUniqueTicketCode($ticketType, 'BOX'),
                    'bundle_reference' => null,
                    'status'         => IssuedTicketStatus::AVAILABLE,
                    'emission_type'  => EmissionType::BOX_OFFICE->value,
                    'issued_at'      => now(),
                    'email_sent_at'  => null,
                ]);
                $ticketIds[] = $ticket->id;
            }

            // Incrementar cantidad vendida del ticket type
            $ticketType->increment('quantity_sold', $quantity);

            DB::commit();

            // Disparar envío de email si hay destinatario
            if ($order->contact_email) {
                SendOrderTicketJob::dispatch($order);
            }

            return response()->json([
                'success'    => true,
                'order_id'   => $order->id,
                'ticket_ids' => $ticketIds,
                'print_url'  => route('organizer.events.physical-tickets.print', [
                    'event'   => $event->id,
                    'tickets' => implode(',', $ticketIds),
                ]),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al procesar la venta: ' . $e->getMessage(),
            ], 500);
        }
    }
}
