<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\IssuedTicket;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\ScanLog;
use App\Enums\IssuedTicketStatus;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(Request $request, Event $event)
    {
        if ($event->organizer_id !== Auth::user()->organizer_id) {
            abort(403);
        }

        $search = $request->input('search');
        $status = $request->input('status');
        $functionId = $request->input('function_id');

        $query = IssuedTicket::query()
            ->with([
                'ticketType.eventFunction',
                'assistant.person', // Para invitados
                'client.person',    // Para compradores
                'scanLogs' => function ($q) { // Historial de escaneos
                    $q->orderBy('scanned_at', 'desc');
                }
            ])
            // Filtrar solo tickets de este evento
            ->whereHas('ticketType.eventFunction', function ($q) use ($event) {
                $q->where('event_id', $event->id);
            });

        if ($functionId && $functionId !== 'all') {
            $query->whereHas('ticketType', function ($q) use ($functionId) {
                $q->where('event_function_id', $functionId);
            });
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('unique_code', 'like', "%{$search}%") // Búsqueda rápida por código
                    ->orWhereHas('client.person', function ($p) use ($search) {
                        $p->where('name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('dni', 'like', "%{$search}%");
                    })
                    ->orWhereHas('assistant.person', function ($p) use ($search) {
                        $p->where('name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('dni', 'like', "%{$search}%");
                    });
            });
        }

        $tickets = $query->orderBy('updated_at', 'desc') // Los modificados recientemente primero (ej. recién escaneados)
            ->paginate(20)
            ->withQueryString();

        // Transformar datos para la vista "Master"
        $tickets->getCollection()->transform(function ($ticket) {
            // Determinar dueño
            $person = $ticket->client?->person ?? $ticket->assistant?->person;
            $ownerName = $person ? $person->name . ' ' . $person->last_name : 'Desconocido';
            $ownerDni = $person ? $person->dni : '-';

            // Último escaneo relevante
            $lastScan = $ticket->scanLogs->first();

            return [
                'id' => $ticket->id,
                'unique_code' => $ticket->unique_code,
                'status' => $ticket->status,
                'owner_name' => $ownerName,
                'owner_dni' => $ownerDni,
                'ticket_type' => $ticket->ticketType->name,
                'function_name' => $ticket->ticketType->eventFunction->name,
                'is_bundle' => $ticket->isFromBundle(),
                'bundle_reference' => $ticket->bundle_reference,
                'device_used' => $ticket->device_used, // Quién lo escaneó (nombre del dispositivo)
                'validated_at' => $ticket->validated_at?->format('d/m H:i:s'),
                'last_scan_result' => $lastScan?->result, // success, invalid_code, etc.
                'scan_history' => $ticket->scanLogs->map(function ($log) {
                    return [
                        'result' => $log->result,
                        'device_name' => $log->device_name,
                        'scanned_at' => $log->scanned_at, // Formatear en front
                    ];
                }),
            ];
        });

        // Obtener funciones para el filtro
        $functions = $event->functions()->select('id', 'name', 'start_time')->get();

        return Inertia::render('organizer/events/tickets-manangment', [
            'event' => $event,
            'tickets' => $tickets,
            'functions' => $functions,
            'filters' => $request->all(['search', 'status', 'function_id']),
        ]);
    }

    public function toggleStatus(Request $request, Event $event, IssuedTicket $ticket)
    {
        if ($event->organizer_id !== Auth::user()->organizer_id) {
            abort(403);
        }

        $newStatus = $request->input('status'); // 'used' o 'available'

        $ticket->update([
            'status' => $newStatus,
            'validated_at' => $newStatus === 'used' ? now() : null,
            'device_used' => $newStatus === 'used' ? 'Panel Organizador (' . Auth::user()->name . ')' : null
        ]);

        // Registrar en el log que fue un cambio manual
        ScanLog::create([
            'issued_ticket_id' => $ticket->id,
            'event_function_id' => $ticket->ticketType->event_function_id,
            'device_uuid' => 'web-panel',
            'device_name' => 'Panel Web (' . Auth::user()->name . ')',
            'result' => 'manual_override_' . $newStatus,
            'scanned_code' => $ticket->unique_code,
            'scanned_at' => now(),
        ]);

        return back()->with('success', 'Estado del ticket actualizado.');
    }
}
