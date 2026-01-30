<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use App\Models\TicketType;
use App\Models\Person;
use App\Models\Assistant;
use App\Models\IssuedTicket;
use App\Enums\IssuedTicketStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Services\OrderService;
use Carbon\Carbon;

class PhysicalTicketController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Show the form to generate physical tickets
     */
    public function create(Event $event)
    {
        if ($event->organizer_id !== Auth::user()->organizer->id) {
            abort(403, 'No tienes permisos para gestionar este evento.');
        }

        // Fetch event functions with ticket types (individual only, same as invitation)
        $eventFunctions = $event->functions()
            ->with(['ticketTypes' => function ($query) {
                $query->where('is_bundle', false)
                    ->with(['issuedTickets', 'sector']);
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

                    $ticketType->sold = $totalIssued;
                    $ticketType->available = max(0, $available);
                    $ticketType->name = $ticketType->name . ($ticketType->sector ? ' - ' . $ticketType->sector->name : '');

                    return $ticketType;
                });

                $function->date = $startTime->format('d/m/Y');
                $function->time = $startTime->format('H:i');
                $function->formatted_date = $startTime->format('d \d\e F \d\e Y');
                $function->day_name = $startTime->locale('es')->dayName;

                return $function;
            });

        return Inertia::render('organizer/events/physical-tickets/new', [
            'event' => $event->load(['category', 'venue']),
            'eventFunctions' => $eventFunctions,
        ]);
    }

    /**
     * Store physical tickets (Generate functionality)
     */
    public function store(Request $request, Event $event)
    {
        if ($event->organizer_id !== Auth::user()->organizer->id) {
            abort(403, 'No tienes permisos para gestionar este evento.');
        }

        $validator = Validator::make($request->all(), [
            'person.name' => 'required|string|max:100',
            'person.last_name' => 'required|string|max:100',
            'person.dni' => 'nullable|string|max:20',
            'person.email' => 'nullable|email|max:255', // Email optional for physical tickets
            'person.phone' => 'nullable|string|max:20',
            'person.address' => 'nullable|string|max:500',
            'tickets' => 'required|array|min:1',
            'tickets.*.event_function_id' => 'required|exists:event_functions,id',
            'tickets.*.ticket_type_id' => 'required|exists:ticket_types,id',
            'tickets.*.quantity' => 'required|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            // Similar validation logic as AttendeeInvitationController...
            $functionIds = collect($request->tickets)->pluck('event_function_id')->unique();
            $validFunctions = $event->functions()->whereIn('id', $functionIds)->pluck('id');

            if ($validFunctions->count() !== $functionIds->count()) {
                throw new \Exception('Una o más funciones no pertenecen a este evento.');
            }

            foreach ($request->tickets as $ticketRequest) {
                $ticketType = TicketType::where('id', $ticketRequest['ticket_type_id'])
                    ->where('event_function_id', $ticketRequest['event_function_id'])
                    ->first();

                if (!$ticketType || $ticketType->is_bundle) {
                    throw new \Exception('Tipo de ticket inválido o es un lote.');
                }
            }

            // Create/Update Person
            $personData = $request->person;
            $person = null;

            if ($personData['dni']) {
                $person = Person::where('dni', $personData['dni'])->first();
            }

            if (!$person) {
                // If no name provided (e.g. generic physical ticket), use placeholder? 
                // Validator requires name/lastname so we assume we have them.
                $person = Person::create([
                    'name' => $personData['name'],
                    'last_name' => $personData['last_name'],
                    'dni' => $personData['dni'],
                    'phone' => $personData['phone'],
                    'address' => $personData['address'],
                ]);
            } else {
                $person->update([
                    'name' => $personData['name'],
                    'last_name' => $personData['last_name'],
                    'phone' => $personData['phone'] ?: $person->phone,
                    'address' => $personData['address'] ?: $person->address,
                ]);
            }

            $issuedTicketIds = [];

            foreach ($request->tickets as $ticketRequest) {
                $eventFunction = EventFunction::find($ticketRequest['event_function_id']);
                $ticketType = TicketType::find($ticketRequest['ticket_type_id']);

                // Create or find Assistant
                // Note: For physical tickets, we might want to differentiate them?
                // For now, using 'invited' logic but without email sending is fine.
                // We'll treat them as "Assistant" with 'sended_at' potentially null or a specific flag/status if needed.
                // But the user just said "same logic as invited but without email".

                $assistant = Assistant::where('event_function_id', $eventFunction->id)
                    ->where('person_id', $person->id)
                    ->where('email', $personData['email']) // Email might be null
                    ->first();

                if (!$assistant) {
                    $assistant = Assistant::create([
                        'event_function_id' => $eventFunction->id,
                        'person_id' => $person->id,
                        'email' => $personData['email'],
                        'quantity' => $ticketRequest['quantity'],
                        'sended_at' => now(), // Mark as "sent" (issued) immediately? Or null? 
                        // If null, it shows as "Pendiente" in badge. 
                        // User request: "generar las entradas emitidas". 
                        // Let's set it to now() so it looks "Valid/Invitado" or maybe we need a new way to distinguish.
                        // For now keep it consistent with "Invite" flow.
                    ]);
                } else {
                    $assistant->increment('quantity', $ticketRequest['quantity']);
                }

                for ($i = 0; $i < $ticketRequest['quantity']; $i++) {
                    $ticket = IssuedTicket::create([
                        'ticket_type_id' => $ticketType->id,
                        'order_id' => null,
                        'assistant_id' => $assistant->id,
                        'client_id' => null,
                        'unique_code' => $this->orderService->generateUniqueTicketCode($ticketType, 'FIS'), // FIS for Fisico
                        'bundle_reference' => null,
                        'status' => IssuedTicketStatus::AVAILABLE,
                        'issued_at' => now(),
                        'email_sent_at' => null, // Explicitly null as we don't send email
                    ]);
                    $issuedTicketIds[] = $ticket->id;
                }
            }

            DB::commit();

            // Return the print URL for the generated tickets
            return redirect()->route('organizer.events.attendees', $event)
                ->with('success', 'Entradas físicas generadas correctamente.')
                ->with('print_url', route('organizer.events.physical-tickets.print', [
                    'event' => $event->id,
                    'tickets' => $issuedTicketIds
                ]));
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withErrors(['general' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Print view for physical tickets
     */
    public function print(Request $request, Event $event)
    {
        if ($event->organizer_id !== Auth::user()->organizer->id) {
            abort(403);
        }

        $ticketIds = $request->input('tickets');
        $assistantId = $request->input('assistant');

        $query = IssuedTicket::query()
            ->with([
                'ticketType.eventFunction.event.venue.ciudad.provincia',
                'ticketType.eventFunction.event.organizer',
                'ticketType.sector',
                'assistant.person'
            ]);

        if ($ticketIds) {
            if (is_string($ticketIds)) {
                $ticketIds =  explode(',', $ticketIds);
            }
            $query->whereIn('id', $ticketIds);
        } elseif ($assistantId) {
            $query->where('assistant_id', $assistantId);
            // Ensure tickets belong to this event (security check)
            $query->whereHas('ticketType.eventFunction', function ($q) use ($event) {
                $q->where('event_id', $event->id);
            });
        } else {
            abort(404, 'No se especificaron tickets para imprimir.');
        }

        $tickets = $query->get();

        if ($tickets->isEmpty()) {
            abort(404, 'No se encontraron tickets.');
        }

        // return view directly
        return view('ticket.ticket-template', compact('tickets'));
    }
}
