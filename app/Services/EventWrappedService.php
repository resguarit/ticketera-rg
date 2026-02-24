<?php

namespace App\Services;

use App\Models\IssuedTicket;
use App\Models\ScanLog;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EventWrappedService
{
    // -------------------------------------------------------------------------
    // 1. TOP ESCANEADORES (Ranking de Porteros)
    // -------------------------------------------------------------------------
    // Agrupa scan_logs por device_name, cuenta sólo los result='success'
    // y ordena de mayor a menor. Devuelve un array listo para el frontend.
    // -------------------------------------------------------------------------
    public function topScanners(?int $eventFunctionId = null): Collection
    {
        return ScanLog::query()
            ->select('device_name', DB::raw('COUNT(*) as total_success'))
            ->where('result', 'success')
            ->when($eventFunctionId, fn($q) => $q->where('event_function_id', $eventFunctionId))
            ->groupBy('device_name')
            ->orderByDesc('total_success')
            ->get()
            ->map(fn($row) => [
                'device'        => $row->device_name,
                'total_success' => (int) $row->total_success,
            ]);
    }

    // -------------------------------------------------------------------------
    // 2. ASISTENCIA: COMPRADORES vs. INVITADOS
    // -------------------------------------------------------------------------
    // Considera como "asistente" a todo issued_ticket que tenga al menos un
    // scan_log con result='success'. Luego lo clasifica según si su order_id
    // es NULL (invitado) o NOT NULL (comprador).
    // -------------------------------------------------------------------------
    public function attendanceBreakdown(?int $eventFunctionId = null): array
    {
        // 1. Asistentes reales (tuvieron al menos un scan 'success')
        $attendedIds = ScanLog::query()
            ->select('issued_ticket_id')
            ->where('result', 'success')
            ->when($eventFunctionId, fn($q) => $q->where('event_function_id', $eventFunctionId))
            ->distinct()
            ->pluck('issued_ticket_id');

        $buyersAttended = IssuedTicket::whereIn('id', $attendedIds)
            ->whereNotNull('order_id')
            ->whereHas('order', fn($q) => $q->where('status', \App\Enums\OrderStatus::PAID))
            ->count();

        $guestsAttended = IssuedTicket::whereIn('id', $attendedIds)
            ->whereNull('order_id')
            ->count();

        // 2. Totales emitidos (para calcular no-shows)
        $totalBuyersIssued = IssuedTicket::query()
            ->whereNotNull('order_id')
            ->whereHas('order', fn($q) => $q->where('status', \App\Enums\OrderStatus::PAID))
            ->when($eventFunctionId, function ($q) use ($eventFunctionId) {
                $q->whereHas('ticketType', fn($sq) => $sq->where('event_function_id', $eventFunctionId));
            })
            ->count();

        $totalGuestsIssued = IssuedTicket::query()
            ->whereNull('order_id')
            ->when($eventFunctionId, function ($q) use ($eventFunctionId) {
                $q->whereHas('ticketType', fn($sq) => $sq->where('event_function_id', $eventFunctionId));
            })
            ->count();

        return [
            'total_attended' => $buyersAttended + $guestsAttended,
            'buyers_attended' => $buyersAttended,
            'guests_attended' => $guestsAttended,
            'total_buyers' => $totalBuyersIssued,
            'total_guests' => $totalGuestsIssued,
            'buyers_no_show' => max(0, $totalBuyersIssued - $buyersAttended),
            'guests_no_show' => max(0, $totalGuestsIssued - $guestsAttended),
        ];
    }

    // -------------------------------------------------------------------------
    // 3. "LOS COLADOS" (Fallas de Sincronización / Doble Ingreso)
    // -------------------------------------------------------------------------
    // Detecta tickets escaneados con éxito más de una vez. Agrupa scan_logs
    // por issued_ticket_id y filtra donde el COUNT de 'success' > 1.
    // Devuelve la cantidad total y los IDs afectados.
    // -------------------------------------------------------------------------
    public function duplicateEntries(?int $eventFunctionId = null): array
    {
        $duplicates = ScanLog::query()
            ->select('scan_logs.issued_ticket_id', DB::raw('COUNT(*) as scans'), 'issued_tickets.unique_code')
            ->join('issued_tickets', 'scan_logs.issued_ticket_id', '=', 'issued_tickets.id')
            ->where('scan_logs.result', 'success')
            ->when($eventFunctionId, fn($q) => $q->where('scan_logs.event_function_id', $eventFunctionId))
            ->groupBy('scan_logs.issued_ticket_id', 'issued_tickets.unique_code')
            ->having('scans', '>', 1)
            ->get();

        return [
            'total'              => $duplicates->count(),
            'issued_ticket_ids'  => $duplicates->pluck('issued_ticket_id')->values()->all(),
            'detail'             => $duplicates->map(fn($row) => [
                'issued_ticket_id' => $row->issued_ticket_id,
                'unique_code'      => $row->unique_code,
                'scan_count'       => (int) $row->scans,
            ])->values()->all(),
        ];
    }

    // -------------------------------------------------------------------------
    // 4. CURVA DE INGRESO (Timeline en bloques de 30 minutos)
    // -------------------------------------------------------------------------
    // Agrupa los escaneos exitosos en intervalos de 30 minutos usando
    // DATE_FORMAT con un redondeo manual al bloque inferior de 30 min.
    // Devuelve un array asociativo: ["23:00" => 120, "23:30" => 300, ...].
    // -------------------------------------------------------------------------
    public function entryCurve(?int $eventFunctionId = null): array
    {
        $rows = ScanLog::query()
            ->select(
                // Redondea al bloque de 30 min: resta los minutos sobrantes (% 30)
                DB::raw("DATE_FORMAT(
                    scanned_at - INTERVAL (MINUTE(scanned_at) MOD 30) MINUTE,
                    '%Y-%m-%d %H:%i'
                ) as time_block"),
                DB::raw('COUNT(*) as total')
            )
            ->where('result', 'success')
            ->when($eventFunctionId, fn($q) => $q->where('event_function_id', $eventFunctionId))
            ->groupBy('time_block')
            ->orderBy('time_block')
            ->get();

        // Devuelve ["23:00" => 120] para consumo fácil en el frontend
        return $rows->mapWithKeys(fn($row) => [
            Carbon::parse($row->time_block)->format('H:i') => (int) $row->total,
        ])->all();
    }

    // -------------------------------------------------------------------------
    // 5. EL "PICO DE CAOS" (Minuto de Oro)
    // -------------------------------------------------------------------------
    // Agrupa por minuto exacto (H:i) y devuelve el minuto con más ingresos.
    // Retorna el timestamp formateado, la cantidad y el minuto completo.
    // -------------------------------------------------------------------------
    public function peakMinute(?int $eventFunctionId = null): array
    {
        $row = ScanLog::query()
            ->select(
                DB::raw("DATE_FORMAT(scanned_at, '%Y-%m-%d %H:%i') as minute"),
                DB::raw('COUNT(*) as total')
            )
            ->where('result', 'success')
            ->when($eventFunctionId, fn($q) => $q->where('event_function_id', $eventFunctionId))
            ->groupBy('minute')
            ->orderByDesc('total')
            ->first();

        if (! $row) {
            return ['minute' => null, 'total' => 0, 'formatted' => null];
        }

        $carbon = Carbon::parse($row->minute);

        return [
            'minute'    => $row->minute,               // "2025-02-15 23:47"
            'formatted' => $carbon->format('H:i'),     // "23:47"
            'total'     => (int) $row->total,
        ];
    }

    // -------------------------------------------------------------------------
    // 6. APERTURA Y CIERRE (Primer y Último escaneo exitoso)
    // -------------------------------------------------------------------------
    // Obtiene el MIN y MAX de scanned_at filtrando sólo result='success'.
    // Devuelve ambos timestamps en formato legible y como objetos Carbon.
    // -------------------------------------------------------------------------
    public function openingAndClosing(?int $eventFunctionId = null): array
    {
        $row = ScanLog::query()
            ->select(
                DB::raw('MIN(scanned_at) as first_scan'),
                DB::raw('MAX(scanned_at) as last_scan')
            )
            ->where('result', 'success')
            ->when($eventFunctionId, fn($q) => $q->where('event_function_id', $eventFunctionId))
            ->first();

        $first = $row?->first_scan ? Carbon::parse($row->first_scan) : null;
        $last  = $row?->last_scan  ? Carbon::parse($row->last_scan)  : null;

        return [
            'opening' => [
                'timestamp' => $first?->toDateTimeString(),   // "2025-02-15 22:58:34"
                'formatted' => $first?->format('d/m/Y H:i'), // "15/02/2025 22:58"
            ],
            'closing' => [
                'timestamp' => $last?->toDateTimeString(),
                'formatted' => $last?->format('d/m/Y H:i'),
            ],
            'duration_minutes' => $first && $last
                ? (int) $first->diffInMinutes($last)
                : null,
        ];
    }

    // -------------------------------------------------------------------------
    // HELPER: Resumen completo (todos los datos en una sola llamada)
    // -------------------------------------------------------------------------
    public function fullReport(?int $eventFunctionId = null): array
    {
        return [
            'top_scanners'      => $this->topScanners($eventFunctionId),
            'attendance'        => $this->attendanceBreakdown($eventFunctionId),
            'duplicate_entries' => $this->duplicateEntries($eventFunctionId),
            'entry_curve'       => $this->entryCurve($eventFunctionId),
            'peak_minute'       => $this->peakMinute($eventFunctionId),
            'opening_closing'   => $this->openingAndClosing($eventFunctionId),
        ];
    }
}
