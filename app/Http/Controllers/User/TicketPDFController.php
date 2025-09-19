<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\IssuedTicket;
use App\Services\PdfService;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

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
    public function downloadOrder($orderId)
    {
        $user = Auth::user();
        
        // Verificar que la orden pertenece al usuario
        $order = \App\Models\Order::with([
            'items.ticketType.eventFunction.event.venue.ciudad.provincia',
            'items.ticketType.eventFunction.event.organizer',
            'client.person'
        ])
        ->where('client_id', $user->id)
        ->findOrFail($orderId);

        // Agrupar tickets por evento/función
        $ticketsByEvent = $order->items->groupBy(function($ticket) {
            return $ticket->ticketType->eventFunction->event->id;
        });

        $data = [
            'order' => $order,
            'ticketsByEvent' => $ticketsByEvent,
            'user' => $user,
            'person' => $user->person,
        ];

        $pdf = Pdf::loadView('pdfs.order-tickets', $data);
        
        $orderNumber = 'TM-' . date('Y') . '-' . str_pad($order->id, 6, '0', STR_PAD_LEFT);
        
        return $pdf->download("tickets-orden-{$orderNumber}.pdf");
    }
}