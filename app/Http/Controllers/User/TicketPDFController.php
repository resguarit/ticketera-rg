<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\IssuedTicket;
use App\Services\PdfService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class TicketPDFController extends Controller
{
    public function __construct(
        private PdfService $pdfService
    ) {}

    /**
     * Descargar ticket individual en PDF
     */
    public function downloadSingle(IssuedTicket $ticket)
    {
        // Verificar que el ticket pertenece al usuario autenticado
        if ($ticket->client_id !== Auth::id()) {
            abort(403, 'No tienes permiso para descargar este ticket');
        }

        $ticketData = $this->pdfService->generateTicketPdfWithName($ticket, 220);

        return $ticketData['pdf']->download($ticketData['filename']);
    }

    /**
     * Descargar todos los tickets de una orden
     */
    public function downloadOrder($transaction_id)
    {
        $user = Auth::user();

        $order = \App\Models\Order::with([
            'items.ticketType.eventFunction.event.venue.ciudad.provincia',
            'items.ticketType.eventFunction.event.organizer',
            'client.person',
        ])
            ->where('client_id', $user->id)
            ->where('transaction_id', $transaction_id)
            ->firstOrFail();

        if ($order === null || $order->items->isEmpty()) {
            abort(404, 'No se encontraron tickets para esta orden');
        }

        $ticketsWithQR = $order->items->map(function ($ticket) {
            $ticketData = $this->pdfService->generateTicketData($ticket, 120);
            $ticket->qrCode = $ticketData['qrCode'];

            return $ticket;
        });

        $ticketsByEvent = $ticketsWithQR->groupBy(function ($ticket) {
            return $ticket->ticketType->eventFunction->event->id;
        });

        $data = [
            'order' => $order,
            'ticketsByEvent' => $ticketsByEvent,
            'user' => $user,
            'person' => $user->person,
        ];

        $pdf = Pdf::loadView('pdfs.order-tickets', $data);

        $orderNumber = $order->transaction_id ?? $order->id;

        return $pdf->download("tickets-orden-{$orderNumber}.pdf");
    }
}
