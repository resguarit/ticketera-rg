<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Assistant;
use App\Models\EventFunction;
use App\Models\IssuedTicket;
use App\Models\Order;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\EmailDispatcherService;

class AssistantController extends Controller
{
    use AuthorizesRequests;

    protected $emailService;

    public function __construct(EmailDispatcherService $emailService)
    {
        $this->emailService = $emailService;
    }

    private function checkOwnership(Event $event)
    {
        if ($event->organizer_id !== Auth::user()->organizer_id) {
            abort(403);
        }
    }
    public function index(Event $event, Request $request): Response
    {
        $this->checkOwnership($event);
        
        $functionId = $request->get('function_id');
        
        $event->load(['category', 'venue', 'organizer', 'functions']);

        $eventData = [
            'id' => $event->id,
            'name' => $event->name,
            'description' => $event->description,
            'image_url' => $event->image_url,
            'featured' => $event->featured,
            'category' => $event->category,
            'venue' => $event->venue,
            'organizer' => $event->organizer,
            'created_at' => $event->created_at,
            'updated_at' => $event->updated_at,
            'functions' => $event->functions->map(function($function) {
                return [
                    'id' => $function->id,
                    'name' => $function->name,
                    'description' => $function->description,
                    'start_time' => $function->start_time,
                    'end_time' => $function->end_time,
                    'date' => $function->start_time?->format('d M Y'),
                    'time' => $function->start_time?->format('H:i'),
                    'formatted_date' => $function->start_time?->format('Y-m-d'),
                    'day_name' => $function->start_time?->locale('es')->isoFormat('dddd'),
                    'is_active' => $function->is_active,
                ];
            }),
        ];
        
        $functions = $event->functions()
            ->select('id', 'name', 'start_time')
            ->orderBy('start_time')
            ->get()
            ->map(function ($function) {
                return [
                    'id' => $function->id,
                    'name' => $function->name,
                    'start_time' => $function->start_time->format('d/m/Y H:i'),
                ];
            });

        $attendees = $this->getAttendeesFromIssuedTickets($event, $functionId);
        
        $attendees = $attendees->sortByDesc(function ($attendee) {
            return $attendee['type'] === 'buyer' 
                ? $attendee['purchased_at'] 
                : $attendee['invited_at'];
        });
        
        $stats = $this->calculateStats($attendees);
        
        $perPage = 10; 
        $currentPage = request()->input('page', 1);
        $offset = ($currentPage - 1) * $perPage;
        
        $paginatedItems = $attendees->slice($offset, $perPage)->values()->all();
        $totalItems = $attendees->count();
        
        $lastPage = ceil($totalItems / $perPage);
        $links = [];
        
        $links[] = [
            'url' => $currentPage > 1 ? url()->current() . '?' . http_build_query(array_merge(request()->query(), ['page' => $currentPage - 1])) : null,
            'label' => '&laquo; Anterior',
            'active' => false,
        ];
        
        $startPage = max(1, $currentPage - 2);
        $endPage = min($lastPage, $currentPage + 2);
        
        for ($i = $startPage; $i <= $endPage; $i++) {
            $links[] = [
                'url' => url()->current() . '?' . http_build_query(array_merge(request()->query(), ['page' => $i])),
                'label' => (string)$i,
                'active' => $i === (int)$currentPage,
            ];
        }
        
        $links[] = [
            'url' => $currentPage < $lastPage ? url()->current() . '?' . http_build_query(array_merge(request()->query(), ['page' => $currentPage + 1])) : null,
            'label' => 'Siguiente &raquo;',
            'active' => false,
        ];
        
        $attendeesPaginated = [
            'data' => $paginatedItems,
            'links' => $links,
            'total' => $totalItems,
            'current_page' => $currentPage,
            'last_page' => $lastPage,
            'per_page' => $perPage,
            'from' => ($currentPage - 1) * $perPage + 1,
            'to' => min($currentPage * $perPage, $totalItems),
        ];

        return Inertia::render('organizer/events/attendees', [
            'event' => $eventData,
            'attendees' => $attendeesPaginated,
            'functions' => $functions,
            'selectedFunctionId' => $functionId,
            'stats' => $stats,
        ]);
    }

    private function getAttendeesFromIssuedTickets(Event $event, $functionId = null)
    {
        $issuedTicketsQuery = DB::table('issued_tickets as it')
            ->join('ticket_types as tt', 'it.ticket_type_id', '=', 'tt.id')
            ->join('event_functions as ef', 'tt.event_function_id', '=', 'ef.id')
            ->where('ef.event_id', $event->id);

        if ($functionId) {
            $issuedTicketsQuery->where('ef.id', $functionId);
        }

        $issuedTickets = $issuedTicketsQuery
            ->select([
                'it.*', 
                'tt.name as ticket_type_name', 
                'tt.price as ticket_price',
                'ef.name as function_name',
                'ef.start_time as function_start_time'
            ])
            ->get();

        $attendees = collect();

        $invitedTickets = $issuedTickets->whereNotNull('assistant_id');
        $invitedGroups = $invitedTickets->groupBy('assistant_id');

        foreach ($invitedGroups as $assistantId => $tickets) {
            $assistant = Assistant::with(['person', 'eventFunction'])
                ->find($assistantId);
            
            if (!$assistant) continue;

            $person = $assistant->person;
            $function = $assistant->eventFunction;
            
            $attendees->push([
                'type' => 'invited',
                'assistant_id' => $assistant->id,
                'full_name' => trim($person->name . ' ' . $person->last_name),
                'dni' => $person->dni,
                'email' => $assistant->email ?: $person->user?->email,
                'phone' => $person->phone,
                'function_name' => $function->name,
                'function_date' => $function->start_time->format('d/m/Y H:i'),
                'invited_at' => $assistant->created_at->format('d/m/Y H:i'),
                'sended_at' => $assistant->sended_at?->format('d/m/Y H:i'),
                'tickets_count' => $tickets->count(),
                'tickets_used' => $tickets->where('status', 'used')->count(),
                'tickets' => $tickets->map(function ($ticket) {
                    return [
                        'id' => $ticket->id,
                        'unique_code' => $ticket->unique_code,
                        'status' => $ticket->status,
                        'ticket_type_name' => $ticket->ticket_type_name,
                        'price' => $ticket->ticket_price,
                        'validated_at' => $ticket->validated_at ? 
                            \Carbon\Carbon::parse($ticket->validated_at)->format('d/m/Y H:i') : null,
                    ];
                })->toArray(),
            ]);
        }

        $buyerTickets = $issuedTickets->whereNull('assistant_id')->whereNotNull('order_id');
        $buyerGroups = $buyerTickets->groupBy('order_id');

        foreach ($buyerGroups as $orderId => $tickets) {
            $order = \App\Models\Order::with(['client.person'])
                ->find($orderId);
            
            if (!$order || !$order->client || !$order->client->person) continue;

            $person = $order->client->person;
            $firstTicket = $tickets->first();
            
            $attendees->push([
                'type' => 'buyer',
                'order_id' => $order->id,
                'order_status' => $order->status,
                'full_name' => trim($person->name . ' ' . $person->last_name),
                'dni' => $person->dni,
                'email' => $order->client->email,
                'phone' => $person->phone,
                'function_name' => $firstTicket->function_name,
                'function_date' => \Carbon\Carbon::parse($firstTicket->function_start_time)->format('d/m/Y H:i'),
                'purchased_at' => $order->created_at->format('d/m/Y H:i'),
                'total_amount' => (float) $order->total_amount, // Usar el total real de la orden
                'tickets_count' => $tickets->count(),
                'tickets_used' => $tickets->where('status', 'used')->count(),
                'tickets' => $tickets->map(function ($ticket) {
                    return [
                        'id' => $ticket->id,
                        'unique_code' => $ticket->unique_code,
                        'status' => $ticket->status,
                        'ticket_type_name' => $ticket->ticket_type_name,
                        'price' => $ticket->ticket_price,
                        'validated_at' => $ticket->validated_at ? 
                            \Carbon\Carbon::parse($ticket->validated_at)->format('d/m/Y H:i') : null,
                    ];
                })->toArray(),
            ]);
        }

        return $attendees->sortBy('full_name')->values();
    }

    private function calculateStats($attendees)
    {
        $invitedAttendees = $attendees->where('type', 'invited');
        $buyerAttendees = $attendees->where('type', 'buyer');
        
        // CORREGIDO: Separar entradas vendidas vs tickets emitidos
        $totalEntradasVendidas = $attendees->sum('tickets_count'); // Esto sigue siendo correcto (lotes + individuales)
        $totalTicketsEmitidos = $attendees->sum(function($attendee) {
            // Para compradores: ya viene calculado correctamente en tickets_count
            // Para invitados: también viene calculado correctamente
            return $attendee['tickets_count']; // Este es el número real de tickets físicos
        });
        
        $ticketsUsed = $attendees->sum('tickets_used');
        $totalRevenue = $buyerAttendees->sum('total_amount');

        return [
            'total_attendees' => $attendees->count(),
            'invited_attendees' => $invitedAttendees->count(),
            'buyer_attendees' => $buyerAttendees->count(),
            'total_entradas_vendidas' => $totalEntradasVendidas, // CAMBIADO: entradas vendidas
            'total_tickets_emitidos' => $totalTicketsEmitidos,   // NUEVO: tickets emitidos físicos
            'total_tickets' => $totalTicketsEmitidos, // Mantener compatibilidad hacia atrás
            'tickets_used' => $ticketsUsed,
            'tickets_pending' => $totalTicketsEmitidos - $ticketsUsed,
            'total_revenue' => $totalRevenue,
        ];
    }

    public function store(Event $event, Request $request)
    {
        $this->checkOwnership($event);

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

    public function destroy(Event $event, Assistant $assistant)
    {
        $this->checkOwnership($event);

        if ($assistant->eventFunction->event_id !== $event->id) {
            abort(404);
        }

        try {
            DB::beginTransaction();

            // Cancelar solo los tickets de esta invitación específica (assistant_id + event_function)
            // No cancelar tickets de otras invitaciones del mismo asistente en otras funciones
            IssuedTicket::where('assistant_id', $assistant->id)
                ->whereHas('ticketType', function($query) use ($assistant) {
                    $query->where('event_function_id', $assistant->event_function_id);
                })
                ->where('status', '!=', \App\Enums\IssuedTicketStatus::CANCELLED)
                ->update([
                    'status' => \App\Enums\IssuedTicketStatus::CANCELLED
                ]);

            // Eliminar el asistente (soft delete)
            $assistant->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Asistente eliminado correctamente y sus tickets han sido cancelados.');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->back()->withErrors(['error' => 'Error al eliminar el asistente: ' . $e->getMessage()]);
        }
    }

    public function resendInvitation(Event $event, Assistant $assistant, Request $request)
    {
        $this->checkOwnership($event);

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

    public function resendPurchase(Event $event, Order $order)
    {
        $this->checkOwnership($event);

        // Verificar que la orden pertenezca al evento
        $orderBelongsToEvent = $order->issuedTickets()
            ->whereHas('ticketType.eventFunction', function ($query) use ($event) {
                $query->where('event_id', $event->id);
            })
            ->exists();

        if (!$orderBelongsToEvent) {
            abort(404, 'Esta orden no pertenece al evento especificado.');
        }

        // Reenviar los tickets de la orden usando el EmailDispatcherService
        $this->emailService->resendTicketPurchaseConfirmation($order);

        return redirect()->back()->with('success', 'Tickets de compra reenviados correctamente.');
    }

    public function showOrderDetails(Event $event, Order $order)
    {
        $this->checkOwnership($event);

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
            'issuedTickets.ticketType',
            'discountCode'
        ]);

        $person = $order->client->person;
        
        $ticketsByType = $order->issuedTickets
            ->groupBy('ticket_type_id');

        $perType = $ticketsByType->map(function ($tickets) {
            $firstTicket = $tickets->first();
            $ticketType = $firstTicket->ticketType;
            $ticketsEmitidos = $tickets->count(); // Cantidad de tickets físicos emitidos
            $price = $ticketType->price;

            // CORREGIDO: Para bundles, calcular lotes vendidos y subtotal correctamente
            if ($ticketType->is_bundle) {
                $bundleQuantity = $ticketType->bundle_quantity ?? 1;
                $lotesVendidos = intval($ticketsEmitidos / $bundleQuantity); // Lotes vendidos
                $subtotal = $lotesVendidos * $price; // Precio por lote × cantidad de lotes
                
                return [
                    'ticket_type_id' => $ticketType->id,
                    'ticket_type_name' => $ticketType->name,
                    'price' => round($price, 2), // Precio por lote
                    'quantity' => $lotesVendidos, // CORREGIDO: Mostrar lotes vendidos
                    'bundle_quantity' => $bundleQuantity,
                    'tickets_emitidos' => $ticketsEmitidos, // NUEVO: Tickets físicos emitidos
                    'subtotal' => round($subtotal, 2), // CORREGIDO: Subtotal basado en lotes
                    'tickets_used' => $tickets->where('status', 'used')->count(),
                    'tickets_available' => $tickets->where('status', 'available')->count(),
                    'is_bundle' => true,
                ];
            } else {
                // Para tickets individuales: mantener lógica original
                $subtotal = $ticketsEmitidos * $price;
                
                return [
                    'ticket_type_id' => $ticketType->id,
                    'ticket_type_name' => $ticketType->name,
                    'price' => round($price, 2),
                    'quantity' => $ticketsEmitidos, // Para individuales: cantidad = tickets emitidos
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
            ],
            'discount_code' => $order->discountCode ? [
                'code' => $order->discountCode->code,
                'description' => $order->discountCode->description,
            ] : null,
            'order_details' => $order->order_details,
        ]);
    }

    public function showAssistantDetails(Event $event, Assistant $assistant)
    {
        $this->checkOwnership($event);

        if ($assistant->eventFunction->event_id !== $event->id) {
            abort(404, 'Este asistente no pertenece al evento especificado.');
        }

        $assistant->load([
            'person',
            'eventFunction',
            'issuedTickets.ticketType'
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
                    'ticket_type_name' => $ticketType->name,
                    'courtesy_value' => round($courtesyValue, 2),
                    'quantity' => $quantity,
                    'total_courtesy_value' => round($quantity * $courtesyValue, 2),
                    'tickets_used' => $tickets->where('status', 'used')->count(),
                    'tickets_available' => $tickets->where('status', 'available')->count(),
                    'ticket_ids' => $tickets->pluck('id')->toArray(), // Agregamos los IDs específicos de los tickets
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
}
