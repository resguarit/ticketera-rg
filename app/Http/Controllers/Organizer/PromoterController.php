<?php

namespace App\Http\Controllers\Organizer;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
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

    public function index(Request $request, Event $event)
    {
        // 🔧 CORREGIDO: Usar el método helper
        $organizer = $this->getOrganizer($request);
        
        if ($event->organizer_id !== $organizer->id) {
            abort(403);
        }

        $activePromoters = $this->getPromotersWithStats($event, false);

        $archivedPromoters = $this->getPromotersWithStats($event, true);

        return Inertia::render('organizer/events/promoters', [
            'event' => $event,
            'promoters' => $activePromoters,
            'archived_promoters' => $archivedPromoters
        ]);
    }

    private function getPromotersWithStats(Event $event, bool $onlyTrashed)
    {
        $query = $event->organizer->promoters();

        if ($onlyTrashed) {
            $query->onlyTrashed();
        } else {
            $query->whereHas('discountCodes', function ($q) use ($event) {
                $q->withTrashed()->where('event_id', $event->id);
            });
        }

        return $query->with(['discountCodes' => function ($q) use ($event) {
            $q->withTrashed()->where('event_id', $event->id);
        }])
            ->get()
            ->map(function ($promoter) use ($event) {
                $codesDetails = $promoter->discountCodes
                    ->where('event_id', $event->id)
                    ->map(function ($code) use ($event) {
                        $stats = DB::table('orders')
                            ->where('discount_code_id', $code->id)
                            ->where('status', OrderStatus::PAID->value)
                            ->selectRaw('COUNT(*) as count, SUM(total_amount) as total')
                            ->first();

                        return [
                            'id' => $code->id,
                            'code' => $code->code,
                            'is_deleted' => $code->trashed(),
                            'sales_count' => (int) ($stats->count ?? 0),
                            'revenue' => (float) ($stats->total ?? 0),
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
                    'deleted_at' => $promoter->deleted_at,
                ];
            });
    }

    public function store(Request $request, Event $event)
    {
        // 🔧 CORREGIDO: Usar el método helper
        $organizer = $this->getOrganizer($request);
        
        if ($event->organizer_id !== $organizer->id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:1000',
            'code' => 'required|string|max:20|unique:discount_codes,code',
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
                'value' => 0
            ]);
        });

        return back()->with('success', 'Vendedor y codigo asignados correctamente.');
    }

    public function destroy(Request $request, Event $event, Promoter $promoter)
    {
        // 🔧 CORREGIDO: Usar el método helper
        $organizer = $this->getOrganizer($request);
        
        if ($event->organizer_id !== $organizer->id) {
            abort(403);
        }

        if ($promoter->organizer_id !== $event->organizer_id) {
            abort(403);
        }

        DB::transaction(function () use ($promoter, $event) {
            $promoter->discountCodes()
                ->where('event_id', $event->id)
                ->delete();

            $promoter->delete();
        });

        return back()->with('success', 'Vendedor y sus códigos eliminados correctamente.');
    }

    public function destroyCode(Request $request, Event $event, Promoter $promoter, DiscountCode $code)
    {
        // 🔧 CORREGIDO: Usar el método helper
        $organizer = $this->getOrganizer($request);
        
        if ($event->organizer_id !== $organizer->id) {
            abort(403);
        }

        if ($code->promoter_id !== $promoter->id || $code->event_id !== $event->id) {
            abort(403);
        }

        $code->delete();

        return back()->with('success', 'Código eliminado correctamente.');
    }

    public function restore(Request $request, Event $event, $promoter_id)
    {
        // 🔧 CORREGIDO: Usar el método helper
        $organizer = $this->getOrganizer($request);
        
        if ($event->organizer_id !== $organizer->id) {
            abort(403);
        }

        $promoter = Promoter::onlyTrashed()->findOrFail($promoter_id);

        $promoter->restore();

        $promoter->discountCodes()
            ->withTrashed()
            ->where('event_id', $event->id)
            ->restore();

        return back()->with('success', 'Vendedor reactivado correctamente.');
    }

    public function restoreCode(Request $request, Event $event, $promoter_id, $code_id)
    {
        // 🔧 CORREGIDO: Usar el método helper
        $organizer = $this->getOrganizer($request);
        
        if ($event->organizer_id !== $organizer->id) {
            abort(403);
        }

        $code = DiscountCode::withTrashed()->findOrFail($code_id);

        if ($code->event_id !== $event->id) {
            abort(403);
        }

        $code->restore();

        return back()->with('success', 'Código reactivado.');
    }
}
