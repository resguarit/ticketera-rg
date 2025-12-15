<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\IssuedTicket;
use App\Models\ScanLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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
                'assistant.person',
                'client.person',
                'scanLogs' => function ($q) {
                    $q->orderBy('scanned_at', 'desc');
                }
            ])
            ->whereHas('ticketType.eventFunction', function ($q) use ($event) {
                $q->where('event_id', $event->id);
            });

        if ($functionId && $functionId !== 'all') {
            $query->whereHas('ticketType', function ($q) use ($functionId) {
                $q->where('event_function_id', $functionId);
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('unique_code', 'like', "%{$search}%")
                    ->orWhereHas('client.person', function ($p) use ($search) {
                        $p->where('name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('dni', 'like', "%{$search}%")
                            ->orWhereRaw("CONCAT(name, ' ', last_name) LIKE ?", ["%{$search}%"]);
                    })
                    ->orWhereHas('assistant.person', function ($p) use ($search) {
                        $p->where('name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('dni', 'like', "%{$search}%")
                            ->orWhereRaw("CONCAT(name, ' ', last_name) LIKE ?", ["%{$search}%"]);
                    });
            });
        }

        $statsQuery = clone $query;
        $stats = $statsQuery->select(
            DB::raw("COUNT(CASE WHEN status = 'used' THEN 1 END) as entered"),
            DB::raw("COUNT(CASE WHEN status = 'available' THEN 1 END) as pending")
        )->first();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $tickets = $query->orderBy('updated_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        $tickets->getCollection()->transform(function ($ticket) {
            $person = $ticket->client?->person ?? $ticket->assistant?->person;
            $ownerName = $person ? $person->name . ' ' . $person->last_name : 'Desconocido';
            $ownerDni = $person ? $person->dni : '-';
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
                'device_used' => $ticket->device_used,
                'validated_at' => $ticket->validated_at?->isoFormat('D MMM HH:mm'),
                'last_scan_result' => $lastScan?->result,
                'scan_history' => $ticket->scanLogs->map(function ($log) {
                    return [
                        'result' => $log->result,
                        'device_name' => $log->device_name,
                        'scanned_at' => $log->scanned_at?->isoFormat('D MMM HH:mm:ss'),
                    ];
                }),
            ];
        });

        $functions = $event->functions()->select('id', 'name', 'start_time')->get()
            ->map(function ($f) {
                return [
                    'id' => $f->id,
                    'name' => $f->name,
                    'start_time_formatted' => Carbon::parse($f->start_time)->isoFormat('D MMM, HH:mm'),
                ];
            });

        return Inertia::render('organizer/events/access', [
            'event' => $event,
            'tickets' => $tickets,
            'functions' => $functions,
            'filters' => $request->all(['search', 'status', 'function_id']),
            'stats' => [ // Enviamos las stats al front
                'entered' => (int) $stats->entered,
                'pending' => (int) $stats->pending,
            ]
        ]);
    }

    public function toggleStatus(Request $request, Event $event, IssuedTicket $ticket)
    {
        $newStatus = $request->input('status');

        $ticket->update([
            'status' => $newStatus,
            'validated_at' => $newStatus === 'used' ? now() : null,
            'device_used' => $newStatus === 'used' ? 'Panel Organizador (' . Auth::user()->name() . ')' : null
        ]);

        ScanLog::create([
            'issued_ticket_id' => $ticket->id,
            'event_function_id' => $ticket->ticketType->event_function_id,
            'device_uuid' => 'web-panel',
            'device_name' => 'Panel Web (' . Auth::user()->name() . ')',
            'result' => 'manual_override_' . $newStatus,
            'scanned_code' => $ticket->unique_code,
            'scanned_at' => now(),
        ]);

        return back()->with('success', 'Estado actualizado correctamente.');
    }
}
