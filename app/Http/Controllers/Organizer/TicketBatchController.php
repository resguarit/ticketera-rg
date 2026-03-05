<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\IssuedTicket;
use App\Models\Order;
use App\Models\TicketBatch;
use App\Models\TicketType;
use App\Enums\EmissionType;
use App\Enums\IssuedTicketStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\SalesChannel;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Carbon\Carbon;

class TicketBatchController extends Controller
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private function getOrganizer(Request $request): \App\Models\Organizer
    {
        if ($request->session()->has('impersonated_organizer_id')) {
            return \App\Models\Organizer::findOrFail($request->session()->get('impersonated_organizer_id'));
        }
        return Auth::user()->organizer;
    }

    private function authorizeEvent(Event $event, Request $request): void
    {
        $organizer = $this->getOrganizer($request);
        if ($event->organizer_id !== $organizer->id) {
            abort(403, 'No tenés permisos para gestionar este evento.');
        }
    }

    // ─── Index ─────────────────────────────────────────────────────────────────

    public function index(Request $request, Event $event)
    {
        $this->authorizeEvent($event, $request);

        $batches = TicketBatch::with([
            'eventFunction',
            'ticketType',
            'promoter',
        ])
            ->whereHas('eventFunction', fn($q) => $q->where('event_id', $event->id))
            ->orderByDesc('created_at')
            ->get()
            ->map(function (TicketBatch $batch) {
                $total     = $batch->issuedTickets()->count();
                $inactive  = $batch->issuedTickets()->where('status', IssuedTicketStatus::INACTIVE)->count();
                $available = $batch->issuedTickets()->where('status', IssuedTicketStatus::AVAILABLE)->whereNull('order_id')->count();
                $sold      = $batch->issuedTickets()->whereNotNull('order_id')->where('status', '!=', IssuedTicketStatus::CANCELLED)->count();
                $cancelled = $batch->issuedTickets()->where('status', IssuedTicketStatus::CANCELLED)->count();

                return [
                    'id'            => $batch->id,
                    'type'          => $batch->type,
                    'quantity'      => $batch->quantity,
                    'is_reconciled' => $batch->is_reconciled,
                    'description'   => $batch->description,
                    'created_at'    => $batch->created_at->format('d/m/Y H:i'),
                    'event_function' => $batch->eventFunction ? [
                        'id'   => $batch->eventFunction->id,
                        'date' => Carbon::parse($batch->eventFunction->start_time)->format('d/m/Y H:i'),
                    ] : null,
                    'ticket_type' => $batch->ticketType ? [
                        'id'    => $batch->ticketType->id,
                        'name'  => $batch->ticketType->name,
                        'price' => (float) $batch->ticketType->price,
                    ] : null,
                    'promoter' => $batch->promoter ? [
                        'id'   => $batch->promoter->id,
                        'name' => $batch->promoter->name,
                    ] : null,
                    'stats' => compact('total', 'inactive', 'available', 'sold', 'cancelled'),
                ];
            });

        // Funciones activas del evento para el formulario de creación
        $eventFunctions = $event->functions()
            ->with(['ticketTypes' => fn($q) => $q->where('is_bundle', false)->orderBy('price', 'desc')])
            ->where('is_active', true)
            ->get()
            ->map(fn($f) => [
                'id'   => $f->id,
                'date' => Carbon::parse($f->start_time)->format('d/m/Y H:i'),
                'ticket_types' => $f->ticketTypes->map(fn($t) => [
                    'id'    => $t->id,
                    'name'  => $t->name,
                    'price' => (float) $t->price,
                ]),
            ]);

        // Promotores del evento
        $promoters = \App\Models\Promoter::where('organizer_id', $event->organizer_id)->get(['id', 'name']);

        return Inertia::render('organizer/events/batches/index', [
            'event'          => $event->load(['category', 'venue']),
            'batches'        => $batches,
            'eventFunctions' => $eventFunctions,
            'promoters'      => $promoters,
            'platform_fee'   => (float) $event->tax,
        ]);
    }

    // ─── Activation View ───────────────────────────────────────────────────────

    public function activationView(Request $request, Event $event)
    {
        $this->authorizeEvent($event, $request);

        // Solo lotes de tipo require_activation para el evento
        $batches = TicketBatch::with(['ticketType', 'eventFunction'])
            ->whereHas('eventFunction', fn($q) => $q->where('event_id', $event->id))
            ->where('type', TicketBatch::TYPE_REQUIRE_ACTIVATION)
            ->get()
            ->map(fn($b) => [
                'id'           => $b->id,
                'description'  => $b->description,
                'ticket_type'  => ['name' => $b->ticketType?->name, 'price' => (float) $b->ticketType?->price],
                'event_function' => ['date' => Carbon::parse($b->eventFunction?->start_time)->format('d/m/Y H:i')],
            ]);

        // Stats del día: solo activaciones individuales en puerta (require_activation)
        $today = now()->toDateString();
        $todayOrders = Order::query()
            ->whereDate('order_date', $today)
            ->where('sales_channel', SalesChannel::BOX_OFFICE)
            ->where('status', OrderStatus::PAID)
            ->whereHas('issuedTickets', fn($q) => $q
                ->whereNotNull('batch_id')
                ->whereHas('batch', fn($bq) => $bq->where('type', TicketBatch::TYPE_REQUIRE_ACTIVATION))
            )
            ->whereHas('issuedTickets.ticketType.eventFunction', fn($q) => $q->where('event_id', $event->id))
            ->with('issuedTickets')
            ->get();

        $todayCount   = $todayOrders->sum(fn($o) => $o->issuedTickets->count());
        $todayRevenue = $todayOrders->sum('total_amount');

        $recentActivations = $todayOrders
            ->sortByDesc('order_date')
            ->take(20)
            ->map(fn($o) => [
                'id'             => $o->id,
                'time'           => $o->order_date->format('H:i'),
                'payment_method' => $o->payment_method,
                'total_amount'   => (float) $o->total_amount,
                'ticket_count'   => $o->issuedTickets->count(),
            ])
            ->values();

        // Tickets inactivos para búsqueda en frontend (con código único)
        $inactiveTickets = IssuedTicket::with(['batch:id,description,ticket_type_id', 'ticketType:id,name'])
            ->whereHas('batch', fn($q) => $q
                ->whereHas('eventFunction', fn($q2) => $q2->where('event_id', $event->id))
                ->where('type', TicketBatch::TYPE_REQUIRE_ACTIVATION)
            )
            ->where('status', IssuedTicketStatus::INACTIVE)
            ->get(['id', 'unique_code', 'batch_id', 'ticket_type_id'])
            ->map(fn($t) => [
                'unique_code'  => $t->unique_code,
                'batch_id'     => $t->batch_id,
                'ticket_type'  => $t->ticketType?->name,
                'description'  => $t->batch?->description,
            ]);

        return Inertia::render('organizer/events/batches/activation', [
            'event'              => $event->load(['category', 'venue']),
            'batches'            => $batches,
            'platform_fee'       => (float) $event->tax,
            'today_count'        => $todayCount,
            'today_revenue'      => (float) $todayRevenue,
            'recent_activations' => $recentActivations,
            'inactive_tickets'   => $inactiveTickets,
        ]);
    }

    // ─── Store (crear lote) ────────────────────────────────────────────────────

    public function store(Request $request, Event $event)
    {
        $this->authorizeEvent($event, $request);

        $validated = $request->validate([
            'event_function_id' => ['required', 'integer', 'exists:event_functions,id'],
            'ticket_type_id'    => ['required', 'integer', 'exists:ticket_types,id'],
            'quantity'          => ['required', 'integer', 'min:1', 'max:5000'],
            'type'              => ['required', 'string', 'in:require_activation,pre_activated'],
            'promoter_id'       => ['nullable', 'integer', 'exists:promoters,id'],
            'description'       => ['nullable', 'string', 'max:500'],
        ]);

        // Verificar que la función pertenece al evento
        $eventFunction = $event->functions()->findOrFail($validated['event_function_id']);

        // Verificar que el ticket type pertenece a esa función
        $ticketType = TicketType::where('id', $validated['ticket_type_id'])
            ->where('event_function_id', $eventFunction->id)
            ->where('is_bundle', false)
            ->firstOrFail();

        $type     = $validated['type'];
        $quantity = (int) $validated['quantity'];
        $status   = $type === TicketBatch::TYPE_REQUIRE_ACTIVATION
            ? IssuedTicketStatus::INACTIVE
            : IssuedTicketStatus::AVAILABLE;

        $batch = null;
        try {
            DB::transaction(function () use ($validated, $ticketType, $quantity, $status, $type, &$batch) {
                $batch = TicketBatch::create([
                    'event_function_id' => $validated['event_function_id'],
                    'ticket_type_id'    => $validated['ticket_type_id'],
                    'promoter_id'       => $validated['promoter_id'] ?? null,
                    'quantity'          => $quantity,
                    'type'              => $type,
                    'description'       => $validated['description'] ?? null,
                    'is_reconciled'     => false,
                ]);

                // Inserción masiva de tickets
                $now     = now();
                $tickets = [];
                for ($i = 0; $i < $quantity; $i++) {
                    $tickets[] = [
                        'ticket_type_id' => $ticketType->id,
                        'order_id'       => null,
                        'assistant_id'   => null,
                        'client_id'      => null,
                        'batch_id'       => $batch->id,
                        'unique_code'    => $this->orderService->generateUniqueTicketCode($ticketType, 'BAT'),
                        'bundle_reference' => null,
                        'status'         => $status->value,
                        'emission_type'  => EmissionType::PRE_PRINTED->value,
                        'issued_at'      => $now,
                        'email_sent_at'  => null,
                        'created_at'     => $now,
                        'updated_at'     => $now,
                    ];
                }
                // Insertar en bloques de 500 para no superar límites de MySQL
                foreach (array_chunk($tickets, 500) as $chunk) {
                    IssuedTicket::insert($chunk);
                }
            });
        } catch (\Exception $e) {
            return back()->withErrors(['general' => 'Error al crear el lote: ' . $e->getMessage()]);
        }

        return redirect()
            ->route('organizer.events.batches.index', $event)
            ->with('success', "Lote #{$batch->id} creado con {$quantity} entradas.");
    }

    // ─── Download PDF ──────────────────────────────────────────────────────────

    public function downloadPdf(Request $request, Event $event, TicketBatch $batch)
    {
        $this->authorizeEvent($event, $request);

        // Verificar que el lote pertenece al evento
        abort_unless(
            $batch->eventFunction && $batch->eventFunction->event_id === $event->id,
            404
        );

        $tickets = IssuedTicket::with([
            'ticketType.eventFunction.event.venue.ciudad.provincia',
            'ticketType.eventFunction.event.organizer',
            'ticketType.sector',
            'assistant.person',
            'client.person',
        ])
            ->where('batch_id', $batch->id)
            ->where('status', '!=', IssuedTicketStatus::CANCELLED)
            ->get();

        if ($tickets->isEmpty()) {
            abort(404, 'Este lote no tiene entradas disponibles para imprimir.');
        }

        return view('ticket.ticket-template', compact('tickets'));
    }

    // ─── Activate (Puerta) ─────────────────────────────────────────────────────

    public function activate(Request $request, Event $event)
    {
        $this->authorizeEvent($event, $request);

        $validated = $request->validate([
            'unique_code'    => ['required', 'string'],
            'payment_method' => ['required', 'string', 'in:' . implode(',', array_map(
                fn($m) => $m->value,
                array_filter(PaymentMethod::cases(), fn($m) => !$m->isPayway())
            ))],
            'apply_fee' => ['boolean'],
        ]);

        try {
            $result = DB::transaction(function () use ($validated, $event) {
                // Buscar ticket por código
                $ticket = IssuedTicket::with(['ticketType.eventFunction', 'batch'])
                    ->where('unique_code', $validated['unique_code'])
                    ->lockForUpdate()
                    ->first();

                if (!$ticket) {
                    throw new \Exception('Código no encontrado. Verificá que el QR sea válido.');
                }

                // Verificar que pertenece a este evento
                if ($ticket->ticketType?->eventFunction?->event_id !== $event->id) {
                    throw new \Exception('Esta entrada no pertenece a este evento.');
                }

                // Validar que sea de un lote de activación
                if (!$ticket->batch_id || $ticket->batch?->type !== TicketBatch::TYPE_REQUIRE_ACTIVATION) {
                    throw new \Exception('Esta entrada no es de un lote para activación en puerta.');
                }

                // Validar estado
                if ($ticket->status !== IssuedTicketStatus::INACTIVE) {
                    $label = match($ticket->status) {
                        IssuedTicketStatus::AVAILABLE  => 'ya fue activada/cobrada anteriormente.',
                        IssuedTicketStatus::USED        => 'ya fue utilizada para el ingreso.',
                        IssuedTicketStatus::CANCELLED   => 'está anulada.',
                        default                         => 'tiene un estado inválido (' . $ticket->status->value . ').',
                    };
                    throw new \Exception("Este ticket {$label}");
                }

                $ticketType = $ticket->ticketType;
                $applyFee   = (bool) ($validated['apply_fee'] ?? true);

                $subtotal   = (float) $ticketType->price;
                $feeRate    = $applyFee ? ((float) $event->tax / 100) : 0.0;
                $serviceFee = round($subtotal * $feeRate, 2);
                $total      = $subtotal + $serviceFee;

                $order = Order::create([
                    'client_id'      => null,
                    'contact_email'  => null,
                    'order_date'     => now(),
                    'status'         => OrderStatus::PAID,
                    'sales_channel'  => SalesChannel::BOX_OFFICE,
                    'payment_method' => $validated['payment_method'],
                    'transaction_id' => 'ACT-' . $event->id . '-' . substr(Str::uuid()->toString(), 0, 23),
                    'subtotal'       => $subtotal,
                    'tax'            => $feeRate,
                    'service_fee'    => $serviceFee,
                    'total_amount'   => $total,
                    'order_details'  => [[
                        'ticket_type_id'   => $ticketType->id,
                        'ticket_type_name' => $ticketType->name,
                        'price'            => $subtotal,
                        'quantity'         => 1,
                        'subtotal'         => $subtotal,
                    ]],
                ]);

                $ticket->update([
                    'order_id' => $order->id,
                    'status'   => IssuedTicketStatus::AVAILABLE,
                ]);

                return [
                    'order_id'           => $order->id,
                    'ticket_id'          => $ticket->id,
                    'ticket_type_name'   => $ticketType->name,
                    'total_amount'       => $total,
                    'payment_method'     => $validated['payment_method'],
                ];
            });

            return response()->json(['success' => true, 'data' => $result]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    // ─── Reconcile (Rendición) ─────────────────────────────────────────────────

    public function tickets(Request $request, Event $event, TicketBatch $batch)
    {
        $this->authorizeEvent($event, $request);

        abort_unless(
            $batch->eventFunction && $batch->eventFunction->event_id === $event->id,
            404
        );

        $tickets = $batch->issuedTickets()
            ->select('id', 'unique_code', 'status', 'order_id')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json(['tickets' => $tickets]);
    }

    public function reconcile(Request $request, Event $event, TicketBatch $batch)
    {
        $this->authorizeEvent($event, $request);

        abort_unless(
            $batch->eventFunction && $batch->eventFunction->event_id === $event->id,
            404
        );

        $validated = $request->validate([
            'sold_ticket_ids'   => ['required', 'array'],
            'sold_ticket_ids.*' => ['integer', 'exists:issued_tickets,id'],
            'sales_channel'     => ['required', 'string', 'in:box_office,sales_point'],
            'apply_fee'         => ['boolean'],
        ]);

        // Validaciones de negocio
        if ($batch->type !== TicketBatch::TYPE_PRE_ACTIVATED) {
            return response()->json(['message' => 'Solo se pueden rendir lotes de tipo pre-activado.'], 422);
        }

        try {
            DB::transaction(function () use ($batch, $validated, $event) {
                // Get ALL tickets for this batch
                $allTickets = $batch->issuedTickets()->lockForUpdate()->get();
                
                $soldIds = collect($validated['sold_ticket_ids']);
                
                // Ensure all USED rockets are forced to be included in soldIds to avoid mismatches
                $usedTickets = $allTickets->filter(fn($t) => $t->status === IssuedTicketStatus::USED);
                $usedTicketIds = $usedTickets->pluck('id')->toArray();
                
                $finalSoldIds = array_unique(array_merge($soldIds->toArray(), $usedTicketIds));
                
                // Separate tickets
                $soldTickets = $allTickets->filter(fn($t) => in_array($t->id, $finalSoldIds));
                $cancelledTickets = $allTickets->filter(fn($t) => !in_array($t->id, $finalSoldIds));

                $applyFee    = (bool) ($validated['apply_fee'] ?? true);
                $salesChannel = $validated['sales_channel'] === 'sales_point'
                    ? SalesChannel::SALES_POINT
                    : SalesChannel::BOX_OFFICE;

                // 1. Cancel tickets that weren't sold (but only if they are AVAILABLE)
                $ticketsToCancel = $cancelledTickets->filter(fn($t) => $t->status === IssuedTicketStatus::AVAILABLE);
                if ($ticketsToCancel->isNotEmpty()) {
                    IssuedTicket::whereIn('id', $ticketsToCancel->pluck('id'))
                        ->update(['status' => IssuedTicketStatus::CANCELLED->value]);
                }

                // 2. Reactivate tickets that were CANCELLED but are now marked as SOLD
                $ticketsToReactivate = $soldTickets->filter(fn($t) => $t->status === IssuedTicketStatus::CANCELLED);
                if ($ticketsToReactivate->isNotEmpty()) {
                    IssuedTicket::whereIn('id', $ticketsToReactivate->pluck('id'))
                        ->update(['status' => IssuedTicketStatus::AVAILABLE->value]);
                }

                // 3. Create macro order for sold tickets that DO NOT have an order yet
                $ticketsNeedingOrder = $soldTickets->filter(fn($t) => is_null($t->order_id));
                $soldQty = $ticketsNeedingOrder->count();

                if ($soldQty > 0) {
                    $ticketType  = $batch->ticketType;
                    $unitPrice   = (float) $ticketType->price;
                    $subtotal    = $unitPrice * $soldQty;
                    $feeRate     = $applyFee ? ((float) $event->tax / 100) : 0.0;
                    $serviceFee  = round($subtotal * $feeRate, 2);
                    $total       = $subtotal + $serviceFee;

                    $order = Order::create([
                        'client_id'      => null,
                        'contact_email'  => null,
                        'order_date'     => now(),
                        'status'         => OrderStatus::PAID,
                        'sales_channel'  => $salesChannel,
                        'payment_method' => PaymentMethod::CASH,
                        'transaction_id' => 'RND-' . $batch->id . '-' . substr(Str::uuid()->toString(), 0, 20),
                        'subtotal'       => $subtotal,
                        'tax'            => $feeRate,
                        'service_fee'    => $serviceFee,
                        'total_amount'   => $total,
                        'order_details'  => [[
                            'ticket_type_id'   => $ticketType->id,
                            'ticket_type_name' => $ticketType->name,
                            'price'            => $unitPrice,
                            'quantity'         => $soldQty,
                            'subtotal'         => $subtotal,
                            'batch_id'         => $batch->id,
                        ]],
                    ]);

                    // Assign order_id to these tickets
                    IssuedTicket::whereIn('id', $ticketsNeedingOrder->pluck('id'))
                        ->update(['order_id' => $order->id]);
                }

                // 4. Mark batch as reconciled
                $batch->update(['is_reconciled' => true]);
            });

            return back()->with('success', 'Lote rendido correctamente.');

        } catch (\Exception $e) {
            return back()->withErrors(['general' => 'Error al rendir el lote: ' . $e->getMessage()]);
        }
    }

    // ─── Void (Anular lote) ────────────────────────────────────────────────────

    public function void(Request $request, Event $event, TicketBatch $batch)
    {
        $this->authorizeEvent($event, $request);

        abort_unless(
            $batch->eventFunction && $batch->eventFunction->event_id === $event->id,
            404
        );

        if ($batch->is_reconciled) {
            return back()->withErrors(['general' => 'No se puede anular un lote ya rendido.']);
        }

        try {
            DB::transaction(function () use ($batch) {
                // Cancelar todos los tickets activos del lote (inactive o available sin orden)
                $batch->issuedTickets()
                    ->whereIn('status', [IssuedTicketStatus::INACTIVE->value, IssuedTicketStatus::AVAILABLE->value])
                    ->whereNull('order_id')
                    ->update(['status' => IssuedTicketStatus::CANCELLED->value]);
            });

            return back()->with('success', 'Lote anulado correctamente.');

        } catch (\Exception $e) {
            return back()->withErrors(['general' => 'Error al anular el lote: ' . $e->getMessage()]);
        }
    }
}
