<?php

namespace App\Http\Controllers\Organizer;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\DiscountCode;
use App\Models\Event;
use App\Models\Promoter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PromoterController extends Controller
{
    public function index(Event $event)
    {
        if ($event->organizer_id !== Auth::user()->organizer_id) {
            abort(403);
        }

        $promoters = $event->organizer->promoters()
            ->whereHas('discountCodes', function ($q) use ($event) {
                $q->where('event_id', $event->id);
            })
            ->with(['discountCodes' => function ($q) use ($event) {
                $q->where('event_id', $event->id);
            }])
            ->get()
            ->map(function ($promoter) use ($event) {

                // Mapeamos cada código con sus estadísticas individuales
                $codesDetails = $promoter->discountCodes
                    ->where('event_id', $event->id)
                    ->map(function ($code) use ($event) {

                        // Estadísticas por código individual
                        $stats = DB::table('orders')
                            ->where('discount_code_id', $code->id)
                            ->where('status', OrderStatus::PAID->value) // Asegúrate que este Enum coincida
                            ->selectRaw('COUNT(*) as count, SUM(total_amount) as total')
                            ->first();

                        return [
                            'id' => $code->id,
                            'code' => $code->code,
                            'sales_count' => (int) ($stats->count ?? 0),
                            'revenue' => (float) ($stats->total ?? 0),
                            // Generamos el link desde el backend usando el name de la ruta pública
                            'link' => route('event.detail', ['event' => $event->id, 'ref' => $code->code]),
                            'discount_value' => $code->value
                        ];
                    })->values();

                return [
                    'id' => $promoter->id,
                    'name' => $promoter->name,
                    'email' => $promoter->email,
                    'phone' => $promoter->phone,
                    'notes' => $promoter->notes,
                    'codes' => $codesDetails,
                    'total_sales' => $codesDetails->sum('sales_count'),
                    'total_revenue' => $codesDetails->sum('revenue'),
                ];
            });

        return Inertia::render('organizer/events/promoters', [
            'event' => $event,
            'promoters' => $promoters
        ]);
    }

    public function store(Request $request, Event $event)
    {
        if ($event->organizer_id !== Auth::user()->organizer_id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:1000',
            'code' => 'required|string|max:20|unique:discount_codes,code',
            //'discount_value' => 'nullable|numeric|min:0', // 'value' en tu DB
        ]);

        DB::transaction(function () use ($data, $event) {
            // buscar o crear el vendedor
            $promoter = Promoter::firstOrCreate(
                [
                    'organizer_id' => $event->organizer_id,
                    'email' => $data['email'],
                ],
                [
                    'name' => $data['name'],
                    'phone' => $data['phone'] ?? null,
                    'notes' => $data['notes'] ?? null,
                ]
            );

            // actualizar nombre si ya existía para asegurar datos frescos
            if (!$promoter->wasRecentlyCreated) {
                $promoter->update([
                    'name' => $data['name'],
                    'notes' => $data['notes'] ?? $promoter->notes,
                ]);
            }

            // crear el código de descuento asociado
            DiscountCode::create([
                'event_id' => $event->id,
                'promoter_id' => $promoter->id,
                'name' => $data['name'] . ' (Vendedor)',
                'code' => strtoupper($data['code']),
                'value' => 0 //$data['discount_value'] ?? 0,
            ]);
        });

        return back()->with('success', 'Vendedor y codigo asignados correctamente.');
    }

    public function destroy(Event $event, Promoter $promoter)
    {
        if ($event->organizer_id !== Auth::user()->organizer_id) {
            abort(403);
        }

        if ($promoter->organizer_id !== $event->organizer_id) {
            abort(403);
        }

        DB::transaction(function () use ($promoter, $event) {
            // 1. Soft Delete de los códigos asociados a ESTE evento
            $promoter->discountCodes()
                ->where('event_id', $event->id)
                ->delete();

            // 2. Soft Delete del Promotor 
            // NOTA: Solo eliminamos al promotor si queremos que desaparezca GLOBALMENTE del organizador.
            // Si el promotor se comparte entre eventos, quizás solo quieras borrar los códigos de este evento.
            // Asumiremos por tu requerimiento ("eliminar el vendedor") que se borra la entidad.
            $promoter->delete();
        });

        return back()->with('success', 'Vendedor y sus códigos eliminados correctamente.');
    }

    public function destroyCode(Event $event, Promoter $promoter, DiscountCode $code)
    {
        if ($event->organizer_id !== Auth::user()->organizer_id) {
            abort(403);
        }

        // Verificar que el código pertenezca al promotor y al evento
        if ($code->promoter_id !== $promoter->id || $code->event_id !== $event->id) {
            abort(403);
        }

        $code->delete();

        return back()->with('success', 'Código eliminado correctamente.');
    }
}
