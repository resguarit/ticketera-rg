<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Settlement;
use App\Models\Event;
use App\Models\EventFunction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SettlementsExport;
use App\Exports\SettlementTicketsExport;

class SettlementController extends Controller
{
    public function index(Request $request)
    {
        $eventId = $request->input('event_id');
        $functionId = $request->input('function_id');

        // Obtener todos los eventos para el selector
        $events = Event::with('organizer')
            ->orderBy('name')
            ->get(['id', 'name', 'organizer_id'])
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'organizer_name' => $event->organizer->name ?? '',
                ];
            });

        $functions = [];
        $settlements = [];

        if ($eventId) {
            // Obtener funciones del evento seleccionado
            $functions = EventFunction::where('event_id', $eventId)
                ->orderBy('start_time')
                ->get(['id', 'name', 'start_time'])
                ->map(function ($function) {
                    return [
                        'id' => $function->id,
                        'name' => $function->name,
                        'start_time' => $function->start_time->format('d/m/Y H:i'),
                    ];
                });

            if ($functionId) {
                // Obtener liquidaciones de la función seleccionada
                $settlements = Settlement::where('event_function_id', $functionId)
                    ->with('eventFunction.event')
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
        }

        return Inertia::render('admin/settlements/index', [
            'events' => $events,
            'functions' => $functions,
            'settlements' => $settlements,
            'selectedEventId' => $eventId ? (int) $eventId : null,
            'selectedFunctionId' => $functionId ? (int) $functionId : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_function_id' => 'required|exists:event_functions,id',
            'transfer_date' => 'required|date',
            'quantity' => 'required|integer|min:1',
            'amount_unit_gross' => 'required|numeric|min:0',
            'amount_total_gross' => 'required|numeric|min:0',
            'amount_unit_net' => 'required|numeric|min:0',
            'amount_total_net' => 'required|numeric|min:0',
            'discounts' => 'nullable|numeric|min:0',
            'discount_observation' => 'nullable|string|max:255',
            'total_transfer' => 'required|numeric|min:0',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240', // 10MB max
            'invoice' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240', // 10MB max
        ]);

        // Manejar archivo adjunto (transferencia)
        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('settlements', 'public');
        }

        // Manejar archivo de factura
        $invoicePath = null;
        if ($request->hasFile('invoice')) {
            $invoicePath = $request->file('invoice')->store('settlements', 'public');
        }

        Settlement::create([
            'event_function_id' => $validated['event_function_id'],
            'transfer_date' => $validated['transfer_date'],
            'quantity' => $validated['quantity'],
            'amount_unit_gross' => $validated['amount_unit_gross'],
            'amount_total_gross' => $validated['amount_total_gross'],
            'amount_unit_net' => $validated['amount_unit_net'],
            'amount_total_net' => $validated['amount_total_net'],
            'discounts' => $validated['discounts'] ?? 0,
            'discount_observation' => $validated['discount_observation'],
            'total_transfer' => $validated['total_transfer'],
            'attachment_path' => $attachmentPath,
            'invoice_path' => $invoicePath,
        ]);

        return redirect()->back()->with('success', 'Liquidación creada correctamente.');
    }

    public function update(Request $request, Settlement $settlement)
    {
        $validated = $request->validate([
            'transfer_date' => 'required|date',
            'quantity' => 'required|integer|min:1',
            'amount_unit_gross' => 'required|numeric|min:0',
            'amount_total_gross' => 'required|numeric|min:0',
            'amount_unit_net' => 'required|numeric|min:0',
            'amount_total_net' => 'required|numeric|min:0',
            'discounts' => 'nullable|numeric|min:0',
            'discount_observation' => 'nullable|string|max:255',
            'total_transfer' => 'required|numeric|min:0',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
            'invoice' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
        ]);

        // Manejar archivo adjunto (transferencia)
        if ($request->hasFile('attachment')) {
            // Eliminar archivo anterior si existe
            if ($settlement->attachment_path) {
                Storage::disk('public')->delete($settlement->attachment_path);
            }
            $validated['attachment_path'] = $request->file('attachment')->store('settlements', 'public');
        }

        // Manejar archivo de factura
        if ($request->hasFile('invoice')) {
            // Eliminar archivo anterior si existe
            if ($settlement->invoice_path) {
                Storage::disk('public')->delete($settlement->invoice_path);
            }
            $validated['invoice_path'] = $request->file('invoice')->store('settlements', 'public');
        }

        $settlement->update([
            'transfer_date' => $validated['transfer_date'],
            'quantity' => $validated['quantity'],
            'amount_unit_gross' => $validated['amount_unit_gross'],
            'amount_total_gross' => $validated['amount_total_gross'],
            'amount_unit_net' => $validated['amount_unit_net'],
            'amount_total_net' => $validated['amount_total_net'],
            'discounts' => $validated['discounts'] ?? 0,
            'discount_observation' => $validated['discount_observation'],
            'total_transfer' => $validated['total_transfer'],
            'attachment_path' => $validated['attachment_path'] ?? $settlement->attachment_path,
            'invoice_path' => $validated['invoice_path'] ?? $settlement->invoice_path,
        ]);

        return redirect()->back()->with('success', 'Liquidación actualizada correctamente.');
    }

    public function destroy(Settlement $settlement)
    {
        // Eliminar archivo adjunto si existe
        if ($settlement->attachment_path) {
            Storage::disk('public')->delete($settlement->attachment_path);
        }

        // Eliminar factura si existe
        if ($settlement->invoice_path) {
            Storage::disk('public')->delete($settlement->invoice_path);
        }

        $settlement->delete();

        return redirect()->back()->with('success', 'Liquidación eliminada correctamente.');
    }

    public function exportSettlements(Request $request)
    {
        $functionId = $request->input('function_id');

        if (!$functionId) {
            return redirect()->back()->withErrors(['error' => 'Debe seleccionar una función.']);
        }

        $function = EventFunction::with('event')->findOrFail($functionId);
        $fileName = 'liquidaciones-' . $function->event->slug . '-' . now()->format('Y-m-d') . '.xlsx';

        return Excel::download(new SettlementsExport($functionId), $fileName);
    }

    public function exportTickets(Request $request) {}
}
