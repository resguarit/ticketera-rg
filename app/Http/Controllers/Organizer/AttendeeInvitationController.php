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

class AttendeeInvitationController extends Controller
{
    /**
     * Mostrar el formulario para invitar asistentes
     */
    public function create(Event $event)
    {
        // Verificar que el evento pertenezca al organizador actual
        if ($event->organizer_id !== Auth::user()->organizer->id) {
            abort(403, 'No tienes permisos para gestionar este evento.');
        }

        // Obtener las funciones del evento con sus tipos de tickets
        $eventFunctions = $event->functions()
            ->with(['ticketTypes' => function($query) {
                $query->with('issuedTickets');
            }])
            ->where('is_active', true)
            ->get()
            ->map(function($function) {
                $function->ticketTypes = $function->ticketTypes->map(function($ticketType) {
                    // Contar todos los tickets emitidos (incluyendo invitaciones)
                    $totalIssued = $ticketType->issuedTickets()
                        ->where('status', '!=', IssuedTicketStatus::CANCELLED)
                        ->count();
                    $available = $ticketType->quantity - $totalIssued;
                    
                    // Agregar propiedades calculadas al modelo existente
                    $ticketType->sold = $totalIssued;
                    $ticketType->available = $available;
                    
                    return $ticketType;
                });
                return $function;
            });

        return Inertia::render('organizer/events/attendees/new', [
            'event' => $event->load(['category', 'venue']),
            'eventFunctions' => $eventFunctions,
        ]);
    }

    /**
     * Crear invitación de asistente
     */
    public function store(Request $request, Event $event)
    {
        // Verificar que el evento pertenezca al organizador actual
        if ($event->organizer_id !== Auth::user()->organizer->id) {
            abort(403, 'No tienes permisos para gestionar este evento.');
        }

        $validator = Validator::make($request->all(), [
            'person.name' => 'required|string|max:100',
            'person.last_name' => 'required|string|max:100',
            'person.dni' => 'nullable|string|max:20',
            'person.email' => 'required|email|max:255',
            'person.phone' => 'nullable|string|max:20',
            'person.address' => 'nullable|string|max:500',
            'tickets' => 'required|array|min:1',
            'tickets.*.event_function_id' => 'required|exists:event_functions,id',
            'tickets.*.ticket_type_id' => 'required|exists:ticket_types,id',
            'tickets.*.quantity' => 'required|integer|min:1|max:10',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            // Verificar que las funciones pertenezcan al evento
            $functionIds = collect($request->tickets)->pluck('event_function_id')->unique();
            $validFunctions = $event->functions()->whereIn('id', $functionIds)->pluck('id');
            
            if ($validFunctions->count() !== $functionIds->count()) {
                throw new \Exception('Una o más funciones no pertenecen a este evento.');
            }

            // Verificar que los tipos de tickets pertenezcan a las funciones correspondientes
            foreach ($request->tickets as $ticketRequest) {
                $ticketType = TicketType::where('id', $ticketRequest['ticket_type_id'])
                    ->where('event_function_id', $ticketRequest['event_function_id'])
                    ->first();

                if (!$ticketType) {
                    throw new \Exception('Tipo de ticket inválido para la función seleccionada.');
                }
            }

            // Crear o encontrar la persona
            $personData = $request->person;
            $person = null;

            // Buscar persona por DNI (si se proporciona)
            if ($personData['dni']) {
                $person = Person::where('dni', $personData['dni'])->first();
            }

            if (!$person) {
                // Crear nueva persona
                $person = Person::create([
                    'name' => $personData['name'],
                    'last_name' => $personData['last_name'],
                    'dni' => $personData['dni'],
                    'phone' => $personData['phone'],
                    'address' => $personData['address'],
                ]);
            } else {
                // Solo actualizar datos básicos de la persona (NO el email, eso va en Assistant)
                $person->update([
                    'name' => $personData['name'],
                    'last_name' => $personData['last_name'],
                    'phone' => $personData['phone'] ?: $person->phone,
                    'address' => $personData['address'] ?: $person->address,
                ]);
            }

            // Crear asistentes y tickets directamente (SIN orden)
            foreach ($request->tickets as $ticketRequest) {
                $eventFunction = EventFunction::find($ticketRequest['event_function_id']);
                $ticketType = TicketType::find($ticketRequest['ticket_type_id']);

                // Verificar si ya existe un assistant para esta función + persona + email
                $assistant = Assistant::where('event_function_id', $eventFunction->id)
                    ->where('person_id', $person->id)
                    ->where('email', $personData['email'])
                    ->first();

                if (!$assistant) {
                    // Crear nuevo assistant
                    $assistant = Assistant::create([
                        'event_function_id' => $eventFunction->id,
                        'person_id' => $person->id,
                        'email' => $personData['email'],
                        'quantity' => $ticketRequest['quantity'],
                        'sended_at' => now(),
                    ]);
                } else {
                    // Si ya existe, incrementar la cantidad
                    $assistant->increment('quantity', $ticketRequest['quantity']);
                }

                // Crear tickets directamente (SIN order_id, SIN client_id)
                for ($i = 0; $i < $ticketRequest['quantity']; $i++) {
                    IssuedTicket::create([
                        'ticket_type_id' => $ticketType->id,
                        'order_id' => null, // No hay orden para invitaciones
                        'assistant_id' => $assistant->id,
                        'client_id' => null, // No hay cliente para invitaciones
                        'unique_code' => $this->generateUniqueTicketCode($ticketType),
                        'status' => IssuedTicketStatus::AVAILABLE,
                        'issued_at' => now(),
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('organizer.events.attendees', $event)
                ->with('success', 'Asistente invitado exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withErrors(['general' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Generar código único para el ticket
     */
    private function generateUniqueTicketCode(TicketType $ticketType): string
    {
        // Generar un código similar al OrderService pero para invitaciones
        $baseCode = 'INV-' . $ticketType->id . '-' . substr(time(), -6) . '-' . rand(100, 999);
        
        // Verificar que sea único
        while (IssuedTicket::where('unique_code', $baseCode)->exists()) {
            $baseCode = 'INV-' . $ticketType->id . '-' . substr(time(), -6) . '-' . rand(100, 999);
        }
        
        return $baseCode;
    }
}
