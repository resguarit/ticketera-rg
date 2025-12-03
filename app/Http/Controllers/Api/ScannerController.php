<?php

namespace App\Http\Controllers\Api;

use App\Enums\IssuedTicketStatus;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use App\Models\IssuedTicket;
use App\Models\ScanLog;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ScannerController extends Controller
{
    public function config()
    {
        $events = Event::where('is_archived', false)
            ->whereHas('functions', function($q) {
                $q->where('start_time', '>=', now()->subDays(2));
            })
            ->with(['functions' => function($q) {
                $q->where('is_active', true)
                  ->select('id', 'event_id', 'name', 'start_time');
            }, 'venue.sectors:id,venue_id,name'])
            ->get(['id', 'venue_id', 'name', 'hero_banner_url']);

        return response()->json([
            'events' => $events
        ]);
    }

    public function downloadTickets(Request $request, $functionId)
    {
        try {
            $function = EventFunction::findOrFail($functionId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Función no encontrada'], 404);
        }

        $tickets = IssuedTicket::query()
            ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
            ->where('ticket_types.event_function_id', $functionId)
            ->whereIn('issued_tickets.status', [IssuedTicketStatus::AVAILABLE, IssuedTicketStatus::USED]) 
            ->with(['assistant.person', 'client.person', 'ticketType'])
            ->select([
                'issued_tickets.id',
                'issued_tickets.unique_code',
                'issued_tickets.status',
                'issued_tickets.ticket_type_id',
                'issued_tickets.assistant_id',
                'issued_tickets.client_id',
                'issued_tickets.bundle_reference',
                'issued_tickets.validated_at',
                'issued_tickets.updated_at',
                'ticket_types.sector_id',
                'ticket_types.name as ticket_name',
                'ticket_types.is_bundle',
                'ticket_types.bundle_quantity'
            ])
            ->get();

        $mappedTickets = $tickets->map(function ($ticket) {
            $ownerName = 'Desconocido';
            $ownerDni = '';
            
            if ($ticket->assistant && $ticket->assistant->person) {
                $ownerName = $ticket->assistant->person->name . ' ' . ($ticket->assistant->person->last_name ?? '');
                $ownerDni = $ticket->assistant->person->dni ?? '';
            } elseif ($ticket->client && $ticket->client->person) {
                $ownerName = $ticket->client->person->name . ' ' . ($ticket->client->person->last_name ?? '');
                $ownerDni = $ticket->client->person->dni ?? '';
            }

            return [
                'c' => $ticket->unique_code,       // Code (PK local)
                's' => $ticket->status->value,     // Status
                'sec' => $ticket->sector_id,       // Sector ID
                'n' => $ownerName,                 // Name
                'd' => $ownerDni,                  // DNI
                't' => $ticket->ticket_name,       // Type Name
                'b' => $ticket->is_bundle ? $ticket->bundle_quantity : 1, // Bundle Qty
                'br' => $ticket->bundle_reference, // Bundle Ref
                'va' => $ticket->validated_at ? $ticket->validated_at->toIso8601String() : null, // Validated At
            ];
        });

        return response()->json([
            'function_id' => $function->id,
            'timestamp' => now()->toIso8601String(),
            'tickets' => $mappedTickets
        ]);
    }

    public function sync(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'scans' => 'required|array',
            'scans.*.code' => 'required',
            'scans.*.result' => 'required',
            'scans.*.timestamp' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $scans = $request->input('scans');
        $deviceUuid = $request->header('x-device-uuid', 'unknown-uuid');
        $deviceName = $request->header('x-device-name', 'Unknown Device');

        $processedIds = [];
        $serverTimezone = config('app.timezone');

        DB::transaction(function () use ($scans, $deviceUuid, $deviceName, $serverTimezone, &$processedIds) {
            foreach ($scans as $scanData) {
                $code = $scanData['code'];
                $result = $scanData['result'];

                $isoDate = Carbon::parse($scanData['timestamp']);
                $dbDate = $isoDate->setTimezone($serverTimezone);

                $ticket = IssuedTicket::where('unique_code', $code)->first();

                if ($ticket) {
                    // Logueamos siempre
                    ScanLog::create([
                        'issued_ticket_id' => $ticket->id,
                        'event_function_id' => $ticket->ticketType->event_function_id,
                        'device_uuid' => $deviceUuid,
                        'device_name' => $deviceName,
                        'result' => $result,
                        'scanned_code' => $code,
                        'scanned_at' => $dbDate
                    ]);

                    if ($result === 'success' && $ticket->status !== IssuedTicketStatus::USED) {
                        $ticket->update([
                            'status' => IssuedTicketStatus::USED,
                            'validated_at' => $dbDate,
                            'device_used' => $deviceName
                        ]);
                    }
                } else {
                    ScanLog::create([
                        'issued_ticket_id' => null,
                        'event_function_id' => null,
                        'device_uuid' => $deviceUuid,
                        'device_name' => $deviceName,
                        'result' => 'invalid_code',
                        'scanned_code' => $code,
                        'scanned_at' => $dbDate
                    ]);
                }

                $processedIds[] = $code; // Devolvemos el código para que la app sepa que se guardó
            }
        });

        return response()->json(['processed' => $processedIds]);
    }

    public function updates(Request $request, $functionId)
    {
        $request->validate([
            'since' => 'required|date'
        ]);

        $sinceRaw = Carbon::parse($request->query('since'));
        $since = $sinceRaw->setTimezone(config('app.timezone'));

        try {
            $function = EventFunction::findOrFail($functionId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Función no encontrada'], 404);
        }

        $updates = IssuedTicket::query()
            ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
            ->where('ticket_types.event_function_id', $functionId)
            ->where('issued_tickets.updated_at', '>', $since)
            ->select([
                'issued_tickets.unique_code',
                'issued_tickets.status',
                'issued_tickets.validated_at',
                'issued_tickets.updated_at'
            ])
            ->get();

        $mappedUpdates = $updates->map(function ($ticket) {
            return [
                'c' => $ticket->unique_code,       
                's' => $ticket->status->value,
                'va' => $ticket->validated_at ? $ticket->validated_at->toIso8601String() : null,
            ];
        });

        return response()->json([
            'timestamp' => now()->toIso8601String(), // La app guardará esto como su nuevo "since"
            'updates' => $mappedUpdates
        ]);
    }
}
