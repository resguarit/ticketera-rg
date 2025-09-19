<?php

namespace App\Services;

use App\Models\IssuedTicket;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Barryvdh\DomPDF\Facade\Pdf;

class PdfService
{
    public function __construct()
    {
        
    }

    /**
     * Genera los datos necesarios para crear un PDF de ticket
     * incluyendo el QR code y todas las relaciones cargadas
     * Funciona tanto para tickets de compra como de invitación
     */
    public function generateTicketData(IssuedTicket $ticket, int $qrSize = 200): array
    {
        // Cargar relaciones básicas que siempre necesitamos
        $ticket->load([
            'ticketType.eventFunction.event.venue.ciudad.provincia',
            'ticketType.eventFunction.event.organizer'
        ]);

        // Detectar el tipo de ticket y cargar relaciones específicas
        if ($ticket->order_id) {
            // Ticket de compra - cargar relaciones de orden
            $ticket->load(['order.client.person']);
            $user = $ticket->order->client;
            $person = $ticket->order->client->person;
            $orderNumber = str_pad($ticket->order->id, 5, '0', STR_PAD_LEFT);
        } else {
            // Ticket de invitación - cargar relaciones de assistant
            $ticket->load(['assistant.person']);
            $user = null; // No hay usuario para invitaciones
            $person = $ticket->assistant->person ?? null;
            $orderNumber = 'INV-' . substr($ticket->unique_code, 0, 8); // Usar parte del código único
        }

        $qrCode = base64_encode(
            QrCode::format('svg')->size($qrSize)->generate($ticket->unique_code)
        );

        $event = $ticket->ticketType->eventFunction->event;
        $eventFunction = $ticket->ticketType->eventFunction;

        return [
            'ticket' => $ticket,
            'event' => $event,
            'function' => $eventFunction,
            'user' => $user,
            'person' => $person,
            'qrCode' => $qrCode,
            'orderNumber' => $orderNumber, // Nuevo campo para el template
        ];
    }

    /**
     * Genera un PDF completo para un ticket
     * Devuelve el objeto PDF listo para ->download() o ->output()
     */
    public function generateTicketPdf(IssuedTicket $ticket, int $qrSize = 200)
    {
        $data = $this->generateTicketData($ticket, $qrSize);
        
        return Pdf::loadView('pdfs.ticket', $data);
    }

    /**
     * Genera el nombre del archivo PDF basado en los datos del ticket
     * Funciona tanto para tickets de compra como de invitación
     */
    public function generateTicketFileName(IssuedTicket $ticket): string
    {
        // Cargar solo las relaciones necesarias para el nombre
        $ticket->load('ticketType.eventFunction.event');
        
        $eventName = $ticket->ticketType->eventFunction->event->name;
        
        // Limpiar el nombre del evento para que sea válido como nombre de archivo
        $cleanEventName = preg_replace('/[^a-zA-Z0-9\-_]/', '-', $eventName);
        
        // Determinar el prefijo según el tipo de ticket
        $prefix = $ticket->order_id ? 'ticket' : 'invitation';
        
        return "{$prefix}-{$cleanEventName}-{$ticket->unique_code}.pdf";
    }

    /**
     * Genera un PDF completo para un ticket con su nombre sugerido
     * Devuelve un array con 'pdf' y 'filename'
     */
    public function generateTicketPdfWithName(IssuedTicket $ticket, int $qrSize = 200): array
    {
        $pdf = $this->generateTicketPdf($ticket, $qrSize);
        $filename = $this->generateTicketFileName($ticket);
        
        return [
            'pdf' => $pdf,
            'filename' => $filename
        ];
    }
}
