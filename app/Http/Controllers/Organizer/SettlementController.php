<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Settlement;
use App\Models\Event;
use App\Models\EventFunction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SettlementsExport;
use App\Exports\SettlementTicketsExport;
use App\Enums\UserRole;

class SettlementController extends Controller
{
    private function checkOwnership(Event $event)
    {
        if (Auth::user()->role === UserRole::ADMIN && session('impersonated_organizer_id') == $event->organizer_id) {
            return;
        }

        if ($event->organizer_id !== Auth::user()->organizer_id) {
            abort(403);
        }
    }

    public function index(Request $request, Event $event)
    {
        $this->checkOwnership($event);

        $functionId = $request->input('function_id');

        // Obtener funciones del evento
        $functions = $event->functions()
            ->orderBy('start_time')
            ->get(['id', 'name', 'start_time'])
            ->map(function ($function) {
                return [
                    'id' => $function->id,
                    'name' => $function->name,
                    'start_time' => $function->start_time->format('d/m/Y H:i'),
                ];
            });

        // Si no se seleccionó función y solo hay una, seleccionarla por defecto
        if (!$functionId && $functions->count() === 1) {
            $functionId = $functions->first()['id'];
        }

        $settlements = [];
        if ($functionId) {
            // Verificar que la función pertenece al evento
            $functionBelongsToEvent = $event->functions()->where('id', $functionId)->exists();

            if (!$functionBelongsToEvent) {
                abort(404, 'La función no pertenece a este evento.');
            }

            // Obtener liquidaciones de la función seleccionada
            $settlements = Settlement::where('event_function_id', $functionId)
                ->orderBy('transfer_date', 'desc')
                ->get()
                ->map(function ($settlement) {
                    return [
                        'id' => $settlement->id,
                        'transfer_date' => $settlement->transfer_date->format('Y-m-d\TH:i'),
                        'quantity' => $settlement->quantity,
                        'amount_unit_gross' => (float) $settlement->amount_unit_gross,
                        'amount_total_gross' => (float) $settlement->amount_total_gross,
                        'amount_unit_net' => (float) $settlement->amount_unit_net,
                        'amount_total_net' => (float) $settlement->amount_total_net,
                        'discounts' => (float) $settlement->discounts,
                        'discount_observation' => $settlement->discount_observation,
                        'total_transfer' => (float) $settlement->total_transfer,
                        'attachment_path' => $settlement->attachment_path,
                        'attachment_url' => $settlement->attachment_path
                            ? Storage::url($settlement->attachment_path)
                            : null,
                        'invoice_path' => $settlement->invoice_path,
                        'invoice_url' => $settlement->invoice_path
                            ? Storage::url($settlement->invoice_path)
                            : null,
                    ];
                });
        }

        return Inertia::render('organizer/events/functions/settlements/index', [
            'event' => $event->load('functions'),
            'functions' => $functions,
            'settlements' => $settlements,
            'selectedFunctionId' => $functionId ? (int) $functionId : null,
        ]);
    }

    public function exportSettlements(Request $request, Event $event)
    {
        $this->checkOwnership($event);

        $functionId = $request->input('function_id');

        if (!$functionId) {
            return redirect()->back()->withErrors(['error' => 'Debe seleccionar una función.']);
        }

        // Verificar que la función pertenece al evento
        $function = $event->functions()->findOrFail($functionId);
        $fileName = 'liquidaciones-' . $event->slug . '-' . now()->format('Y-m-d') . '.xlsx';

        return Excel::download(new SettlementsExport($functionId), $fileName);
    }

    public function exportTickets(Request $request, Event $event) {}
}
