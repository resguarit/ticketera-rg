<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Assistant;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Enums\OrderStatus;
use App\Enums\IssuedTicketStatus;
use App\Enums\UserRole;
use App\Exports\AttendeesExport;
use App\Models\EventFunction;
use Carbon\Carbon;
use App\Models\IssuedTicket;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Response;
use App\Services\EmailDispatcherService;
use App\Services\OrderService;
use Maatwebsite\Excel\Facades\Excel;

class AssistantController extends Controller
{
    use AuthorizesRequests;

    protected $emailService;

    public function __construct(EmailDispatcherService $emailService)
    {
        $this->emailService = $emailService;
    }

    /**
     * Obtiene el organizador correcto considerando impersonación
     */
    private function getOrganizer(Request $request): \App\Models\Organizer
    {
        if ($request->session()->has('impersonated_organizer_id')) {
            return \App\Models\Organizer::findOrFail($request->session()->get('impersonated_organizer_id'));
        }

        return Auth::user()->organizer;
    }

    private function checkOwnership(Request $request, Event $event)
    {
        // 🔧 CORREGIDO: Usar getOrganizer para obtener el organizador correcto
        $organizer = $this->getOrganizer($request);

        if ($event->organizer_id !== $organizer->id) {
            abort(403);
        }
    }

    public function index(Request $request, Event $event)
    {
        // 🔧 CORREGIDO: Usar el método helper
        $organizer = $this->getOrganizer($request);

        if ($event->organizer_id !== $organizer->id) {
            abort(403, 'No tienes permisos para ver esta página.');
        }

        // --- Obtener filtros de la request ---
        $selectedFunctionId = $request->input('function_id');
        $searchTerm = $request->input('search');
        $sortDirection = $request->input('sort_direction', 'desc');
        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        // Filtro de fecha
        $dateFilter = $request->input('date_filter', 'all');
        $dateRange = $this->getDateRange($dateFilter);

        // 1. Query para Asistentes Invitados (Modelo Assistant)
        $invitedQuery = Assistant::query()
            ->join('person', 'assistants.person_id', '=', 'person.id')
            ->join('event_functions', 'assistants.event_function_id', '=', 'event_functions.id')
            ->where('event_functions.event_id', $event->id)
            ->select(
                'assistants.id as assistant_id',
                DB::raw('null as order_id'),
                DB::raw('"invited" as type'),
                DB::raw("CONCAT(person.name, ' ', person.last_name) as full_name"),
                'person.dni',
                'assistants.email',
                'event_functions.name as function_name',
                'event_functions.start_time as function_date_time',
                DB::raw('0 as total_amount'),
                DB::raw('0 as subtotal'),
                DB::raw('null as order_status'),
                'assistants.deleted_at as is_cancelled_at',
                'assistants.created_at as invited_at',
                'assistants.sended_at',
                DB::raw('null as purchased_at'),
                'assistants.created_at as sort_date'
            )
            ->withCount('issuedTickets as tickets_count')
            ->withCount(['issuedTickets as tickets_used' => function ($query) {
                $query->where('status', IssuedTicketStatus::USED);
            }]);

        // Aplicar filtro de fecha a invitados
        if ($dateFilter !== 'all') {
            $invitedQuery->whereBetween('assistants.created_at', [$dateRange['start'], $dateRange['end']]);
        }

        // 2. Query para Compradores (Modelo Order)
        $buyersQuery = Order::query()
            ->join('users', 'orders.client_id', '=', 'users.id')
            ->join('person', 'users.person_id', '=', 'person.id')
            ->join('issued_tickets', 'orders.id', '=', 'issued_tickets.order_id')
            ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
            ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
            ->leftJoin('discount_codes', 'orders.discount_code_id', '=', 'discount_codes.id')
            ->where('event_functions.event_id', $event->id)
            ->select(
                DB::raw('null as assistant_id'),
                'orders.id as order_id',
                DB::raw('"buyer" as type'),
                DB::raw("CONCAT(person.name, ' ', person.last_name) as full_name"),
                'person.dni',
                'users.email',
                DB::raw('MIN(event_functions.name) as function_name'),
                DB::raw('MIN(event_functions.start_time) as function_date_time'),
                'orders.total_amount',
                'orders.subtotal',
                'orders.status as order_status',
                DB::raw('null as is_cancelled_at'),
                DB::raw('null as invited_at'),
                DB::raw('null as sended_at'),
                'orders.order_date as purchased_at',
                'orders.order_date as sort_date'
            )
            ->withCount('issuedTickets as tickets_count')
            ->withCount(['issuedTickets as tickets_used' => function ($query) {
                $query->where('status', IssuedTicketStatus::USED);
            }])
            ->groupBy('orders.id', 'full_name', 'person.dni', 'users.email', 'orders.total_amount', 'orders.subtotal', 'orders.status', 'orders.order_date');

        // Aplicar filtro de fecha a compradores
        if ($dateFilter !== 'all') {
            $buyersQuery->whereBetween('orders.order_date', [$dateRange['start'], $dateRange['end']]);
        }

        // 3. Aplicar Filtro de Función
        if ($selectedFunctionId && $selectedFunctionId !== 'all') {
            $invitedQuery->where('assistants.event_function_id', $selectedFunctionId);

            $buyersQuery->whereIn('orders.id', function ($query) use ($selectedFunctionId) {
                $query->select('order_id')
                    ->from('issued_tickets')
                    ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                    ->where('ticket_types.event_function_id', $selectedFunctionId);
            });
        }

        // 4. Aplicar Filtro de Búsqueda
        if ($searchTerm) {
            $invitedQuery->where(function ($q) use ($searchTerm) {
                $q->where(DB::raw("CONCAT(person.name, ' ', person.last_name)"), 'like', "%{$searchTerm}%")
                    ->orWhere('person.dni', 'like', "%{$searchTerm}%")
                    ->orWhere('assistants.email', 'like', "%{$searchTerm}%");
            });

            $buyersQuery->where(function ($q) use ($searchTerm) {
                $q->where(DB::raw("CONCAT(person.name, ' ', person.last_name)"), 'like', "%{$searchTerm}%")
                    ->orWhere('person.dni', 'like', "%{$searchTerm}%")
                    ->orWhere('users.email', 'like', "%{$searchTerm}%")
                    ->orWhere('orders.transaction_id', 'like', "%{$searchTerm}%")
                    ->orWhere('discount_codes.code', 'like', "%{$searchTerm}%");
            });
        }

        // 5. Combinar Queries
        $combinedQuery = $invitedQuery->unionAll($buyersQuery);

        // 6. Aplicar Ordenamiento
        $finalQuery = DB::query()->fromSub($combinedQuery, 'attendees')
            ->orderBy('sort_date', $sortDirection);

        // 7. Paginar
        $attendees = $finalQuery->paginate(10)->appends($request->query());

        // 8. Formatear datos para la vista
        $attendees->getCollection()->transform(function ($attendee) {
            $attendee = (array) $attendee;

            $functionDate = new Carbon($attendee['function_date_time']);
            return [
                'assistant_id' => $attendee['assistant_id'],
                'order_id' => $attendee['order_id'],
                'type' => $attendee['type'],
                'full_name' => $attendee['full_name'],
                'dni' => $attendee['dni'],
                'email' => $attendee['email'],
                'function_name' => $attendee['function_name'],
                'function_date' => $functionDate->isoFormat('D MMM YYYY, HH:mm'),
                'total_amount' => (float) $attendee['total_amount'],
                'subtotal' => (float) $attendee['subtotal'],
                'order_status' => $attendee['order_status'],
                'is_cancelled' => !empty($attendee['is_cancelled_at']) || $attendee['order_status'] === OrderStatus::CANCELLED->value,
                'invited_at' => $attendee['invited_at'] ? (new Carbon($attendee['invited_at']))->isoFormat('D MMM YYYY, HH:mm') : null,
                'sended_at' => $attendee['sended_at'] ? (new Carbon($attendee['sended_at']))->isoFormat('D MMM YYYY, HH:mm') : null,
                'purchased_at' => $attendee['purchased_at'] ? (new Carbon($attendee['purchased_at']))->isoFormat('D MMM YYYY, HH:mm') : null,
                'tickets_count' => (int) $attendee['tickets_count'],
                'tickets_used' => (int) $attendee['tickets_used'],
            ];
        });

        // 9. Obtener datos adicionales para la página
        $functions = $event->functions()->get(['id', 'name', 'start_time'])
            ->map(function ($function) {
                return [
                    'id' => $function->id,
                    'name' => $function->name,
                    'start_time' => $function->start_time->isoFormat('D MMM, HH:mm'),
                ];
            });

        $stats = [
            'total_attendees' => $finalQuery->count(),
        ];

        return Inertia::render('organizer/events/attendees', [
            'event' => $event->load('functions'),
            'attendees' => $attendees,
            'functions' => $functions,
            'selectedFunctionId' => $selectedFunctionId ? (int) $selectedFunctionId : null,
            'stats' => $stats,
            'search' => $searchTerm,
            'sort_direction' => $sortDirection,
            'date_filter' => $dateFilter
        ]);
    }

    public function store(Event $event, Request $request)
    {
        $this->checkOwnership($request, $event);

        $request->validate([
            'function_id' => 'required|exists:event_functions,id',
            'person_id' => 'required|exists:person,id',
            'email' => 'nullable|email',
            'quantity' => 'required|integer|min:1|max:10',
        ]);

        $function = EventFunction::where('id', $request->function_id)
            ->where('event_id', $event->id)
            ->firstOrFail();

        $assistant = Assistant::create([
            'event_function_id' => $request->function_id,
            'person_id' => $request->person_id,
            'email' => $request->email,
            'quantity' => $request->quantity,
        ]);

        return redirect()->back()->with('success', 'Asistente invitado correctamente.');
    }

    public function destroy(Event $event, Assistant $assistant, Request $request)
    {
        $this->checkOwnership($request, $event);

        if ($assistant->eventFunction->event_id !== $event->id) {
            abort(404);
        }

        try {
            DB::beginTransaction();

            IssuedTicket::where('assistant_id', $assistant->id)
                ->whereHas('ticketType', function ($query) use ($assistant) {
                    $query->where('event_function_id', $assistant->event_function_id);
                })
                ->where('status', '!=', \App\Enums\IssuedTicketStatus::CANCELLED)
                ->update([
                    'status' => \App\Enums\IssuedTicketStatus::CANCELLED
                ]);

            $assistant->delete();

            DB::commit();

            return redirect()->back()
                ->with('success', 'Asistente cancelado correctamente y sus tickets han sido marcados como cancelados.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->withErrors(['error' => 'Error al cancelar el asistente: ' . $e->getMessage()]);
        }
    }

    public function resendInvitation(Event $event, Assistant $assistant, Request $request)
    {
        $this->checkOwnership($request, $event);

        if ($assistant->eventFunction->event_id !== $event->id) {
            abort(404);
        }

        $request->validate([
            'ticket_ids' => 'required|array|min:1',
            'ticket_ids.*' => 'required|integer|exists:issued_tickets,id'
        ]);

        $ticketIds = $request->ticket_ids;

        $tickets = IssuedTicket::whereIn('id', $ticketIds)
            ->where('assistant_id', $assistant->id)
            ->with([
                'assistant.person',
                'ticketType.eventFunction.event'
            ])
            ->get();

        if ($tickets->count() !== count($ticketIds)) {
            return redirect()->back()->withErrors(['error' => 'Algunos tickets no pertenecen a este asistente.']);
        }

        $invalidTickets = $tickets->filter(function ($ticket) use ($event) {
            return $ticket->ticketType->eventFunction->event_id !== $event->id;
        });

        if ($invalidTickets->count() > 0) {
            return redirect()->back()->withErrors(['error' => 'Algunos tickets no pertenecen a este evento.']);
        }

        $this->emailService->sendBatchInvitation($tickets, $assistant->email);

        $assistant->update([
            'sended_at' => now(),
        ]);

        IssuedTicket::whereIn('id', $ticketIds)
            ->update(['email_sent_at' => now()]);

        return redirect()->back()->with('success', 'Invitación reenviada correctamente para ' . $tickets->count() . ' tickets.');
    }

    public function resendPurchase(Event $event, Order $order, Request $request)
    {
        $this->checkOwnership($request, $event);

        $orderBelongsToEvent = $order->issuedTickets()
            ->whereHas('ticketType.eventFunction', function ($query) use ($event) {
                $query->where('event_id', $event->id);
            })
            ->exists();

        if (!$orderBelongsToEvent) {
            abort(404, 'Esta orden no pertenece al evento especificado.');
        }

        $this->emailService->resendTicketPurchaseConfirmation($order);

        return redirect()->back()->with('success', 'Tickets de compra reenviados correctamente.');
    }

    public function refund(Event $event, Order $order, Request $request, OrderService $orderService)
    {
        $this->checkOwnership($request, $event);

        $orderBelongsToEvent = $order->issuedTickets()
            ->whereHas('ticketType.eventFunction', function ($query) use ($event) {
                $query->where('event_id', $event->id);
            })
            ->exists();

        if (!$orderBelongsToEvent) {
            abort(404, 'Esta orden no pertenece al evento especificado.');
        }

        $request->validate([
            'amount' => 'required|numeric|min:0|max:' . $order->total_amount,
        ]);

        try {
            $orderService->refundOrder($order, $request->amount);
            return redirect()->back()->with('success', 'Orden devuelta correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al devolver la orden: ' . $e->getMessage()]);
        }
    }

    public function showOrderDetails(Event $event, Order $order, Request $request)
    {
        $this->checkOwnership($request, $event);

        $orderBelongsToEvent = $order->issuedTickets()
            ->whereHas('ticketType.eventFunction', function ($query) use ($event) {
                $query->where('event_id', $event->id);
            })
            ->exists();

        if (!$orderBelongsToEvent) {
            abort(404, 'Esta orden no pertenece al evento especificado.');
        }

        $order->load([
            'client.person',
            'issuedTickets.ticketType.sector',
            'discountCode'
        ]);

        $person = $order->client->person;

        $ticketsByType = $order->issuedTickets
            ->groupBy('ticket_type_id');

        $perType = $ticketsByType->map(function ($tickets) {
            $firstTicket = $tickets->first();
            $ticketType = $firstTicket->ticketType;
            $ticketsEmitidos = $tickets->count();
            $price = $ticketType->price;

            if ($ticketType->is_bundle) {
                $bundleQuantity = $ticketType->bundle_quantity ?? 1;
                $lotesVendidos = intval($ticketsEmitidos / $bundleQuantity);
                $subtotal = $lotesVendidos * $price;

                return [
                    'ticket_type_id' => $ticketType->id,
                    'ticket_type_name' => $ticketType->name . ($ticketType->sector ? ' - ' . $ticketType->sector->name : ''),
                    'price' => round($price, 2),
                    'quantity' => $lotesVendidos,
                    'bundle_quantity' => $bundleQuantity,
                    'tickets_emitidos' => $ticketsEmitidos,
                    'subtotal' => round($subtotal, 2),
                    'tickets_used' => $tickets->where('status', 'used')->count(),
                    'tickets_available' => $tickets->where('status', 'available')->count(),
                    'is_bundle' => true,
                ];
            } else {
                $subtotal = $ticketsEmitidos * $price;

                return [
                    'ticket_type_id' => $ticketType->id,
                    'ticket_type_name' => $ticketType->name,
                    'price' => round($price, 2),
                    'quantity' => $ticketsEmitidos,
                    'bundle_quantity' => 1,
                    'tickets_emitidos' => $ticketsEmitidos,
                    'subtotal' => round($subtotal, 2),
                    'tickets_used' => $tickets->where('status', 'used')->count(),
                    'tickets_available' => $tickets->where('status', 'available')->count(),
                    'is_bundle' => false,
                ];
            }
        })->values();

        $orderSubtotal = $order->subtotal ?? $perType->sum('subtotal');
        $discountPercentage = $order->discount ?? 0;
        $discountAmount = $orderSubtotal * $discountPercentage;
        $subtotalAfterDiscount = $orderSubtotal - $discountAmount;
        $serviceFeeAmount = $order->service_fee ?? 0;
        $taxPercentage = $order->tax ?? 0;
        $totalPaid = $order->total_amount;

        return response()->json([
            'type' => 'buyer',
            'order' => [
                'id' => $order->id,
                'order_date' => $order->created_at->format('d/m/Y H:i'),
                'status' => $order->status->value,
                'payment_method' => $order->payment_method,
                'transaction_id' => $order->transaction_id,
            ],
            'person' => [
                'full_name' => trim($person->name . ' ' . $person->last_name),
                'dni' => $person->dni,
                'email' => $order->client->email,
                'phone' => $person->phone,
            ],
            'per_type' => $perType,
            'totals' => [
                'subtotal' => round($orderSubtotal, 2),
                'discount_percentage' => round($discountPercentage * 100, 1),
                'discount_amount' => round($discountAmount, 2),
                'subtotal_after_discount' => round($subtotalAfterDiscount, 2),
                'service_fee_amount' => round($serviceFeeAmount, 2),
                'tax_percentage' => round($taxPercentage * 100, 1),
                'total_paid' => round($totalPaid, 2),
                'refunded_amount' => round($order->refunded_amount ?? 0, 2),
            ],
            'discount_code' => $order->discountCode ? [
                'code' => $order->discountCode->code,
                'description' => $order->discountCode->description,
            ] : null,
            'order_details' => $order->order_details,
        ]);
    }

    public function showAssistantDetails(Event $event, Assistant $assistant, Request $request)
    {
        $this->checkOwnership($request, $event);

        if ($assistant->eventFunction->event_id !== $event->id) {
            abort(404, 'Este asistente no pertenece al evento especificado.');
        }

        $assistant->load([
            'person',
            'eventFunction',
            'issuedTickets.ticketType.sector'
        ]);

        $person = $assistant->person;

        $ticketsByType = $assistant->issuedTickets
            ->where('status', '!=', 'cancelled')
            ->groupBy('ticket_type_id');

        $perType = collect();

        if ($ticketsByType->count() > 0) {
            $perType = $ticketsByType->map(function ($tickets) {
                $firstTicket = $tickets->first();
                if (!$firstTicket || !$firstTicket->ticketType) {
                    return null;
                }

                $ticketType = $firstTicket->ticketType;
                $quantity = $tickets->count();
                $courtesyValue = $ticketType->price;

                return [
                    'ticket_type_id' => $ticketType->id,
                    'ticket_type_name' => $ticketType->name . ($ticketType->sector ? ' - ' . $ticketType->sector->name : ''),
                    'courtesy_value' => round($courtesyValue, 2),
                    'quantity' => $quantity,
                    'total_courtesy_value' => round($quantity * $courtesyValue, 2),
                    'tickets_used' => $tickets->where('status', 'used')->count(),
                    'tickets_available' => $tickets->where('status', 'available')->count(),
                    'ticket_ids' => $tickets->pluck('id')->toArray(),
                ];
            })
                ->filter()
                ->values();
        }

        $totalTickets = $assistant->issuedTickets->where('status', '!=', 'cancelled')->count();
        $ticketsUsed = $assistant->issuedTickets->where('status', 'used')->count();
        $ticketsAvailable = $assistant->issuedTickets->where('status', 'available')->count();
        $totalCourtesyValue = $perType->sum('total_courtesy_value');

        return response()->json([
            'type' => 'invited',
            'assistant' => [
                'id' => $assistant->id,
                'invited_at' => $assistant->created_at->format('d/m/Y H:i'),
                'sended_at' => $assistant->sended_at?->format('d/m/Y H:i'),
                'email' => $assistant->email,
                'quantity' => $assistant->quantity,
            ],
            'person' => [
                'full_name' => trim($person->name . ' ' . $person->last_name),
                'dni' => $person->dni,
                'email' => $assistant->email ?: $person->user?->email,
                'phone' => $person->phone,
            ],
            'function' => [
                'name' => $assistant->eventFunction->name,
                'start_time' => $assistant->eventFunction->start_time->format('d/m/Y H:i'),
            ],
            'per_type' => $perType,
            'totals' => [
                'total_tickets' => $totalTickets,
                'tickets_used' => $ticketsUsed,
                'tickets_available' => $ticketsAvailable,
                'total_courtesy_value' => round($totalCourtesyValue, 2),
            ],
        ]);
    }

    public function export(Request $request, Event $event)
    {
        $this->checkOwnership($request, $event);

        $filters = [
            'function_id' => $request->input('function_id'),
            'search' => $request->input('search'),
            'date_filter' => $request->input('date_filter'),
        ];

        $type = $request->input('export_type', 'tickets');

        $fileName = 'asistentes-' . $event->slug . '-' . $type . '-' . now()->format('Y-m-d') . '.xlsx';

        return Excel::download(new AttendeesExport($event, $filters, $type), $fileName);
    }

    /**
     * Obtiene el rango de fechas según el filtro seleccionado
     */
    private function getDateRange(string $filter): array
    {
        $end = Carbon::now()->endOfDay();

        $start = match ($filter) {
            'today' => Carbon::now()->startOfDay(),
            'week' => Carbon::now()->subDays(7)->startOfDay(),
            'month' => Carbon::now()->subMonth()->startOfDay(),
            'quarter' => Carbon::now()->subMonths(3)->startOfDay(),
            'all' => Carbon::create(1970, 1, 1)->startOfDay(),
            default => Carbon::create(1970, 1, 1)->startOfDay(),
        };

        return ['start' => $start, 'end' => $end];
    }
}
