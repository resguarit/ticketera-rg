<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\EventWrappedService;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class EventWrappedController extends Controller
{
    public function __construct(private EventWrappedService $eventWrappedService) {}

    public function show(Event $event, Request $request)
    {
        // El id de la función es opcional, si no se pasa, toma los stats de todo el evento.
        $eventFunctionId = $request->get('event_function_id');

        // Obtener el wrapper estadístico usando el servicio previamente creado
        $report = $this->eventWrappedService->fullReport($eventFunctionId);

        // URL pública firmada (expira en 14 días)
        $shareUrl = URL::temporarySignedRoute(
            'shared.wrapped',
            now()->addDays(14),
            ['event' => $event->id]
        );

        return Inertia::render('organizer/events/wrapped', [
            'event' => $event->only(['id', 'name']),
            'report' => $report,
            'shareUrl' => $shareUrl,
            'isShared' => false,
        ]);
    }

    public function showShared(Event $event, Request $request)
    {
        // Esta vista será idéntica, pero marcando isShared = true para ocultar controles
        if (! $request->hasValidSignature()) {
            abort(403, 'El enlace ha expirado o no es válido.');
        }

        $report = $this->eventWrappedService->fullReport();

        return Inertia::render('organizer/events/wrapped', [
            'event' => $event->only(['id', 'name']),
            'report' => $report,
            'shareUrl' => null,
            'isShared' => true,
        ]);
    }
}
