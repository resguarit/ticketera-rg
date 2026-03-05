<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use App\Mail\TicketsPurchased;
use App\Mail\TicketsResend;
use App\Models\Order;
use App\Services\PdfService;
use Barryvdh\DomPDF\Facade\Pdf;

class SendOrderTicketJob implements ShouldQueue
{
    use Queueable, Dispatchable, InteractsWithQueue, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public Order $order) {}

    /**
     * Execute the job.
     */
    public function handle(PdfService $pdfService): void
    {
        // Determinar el destinatario: cliente registrado o email de contacto (ventas de boletería)
        $recipient = $this->order->client?->email ?? $this->order->contact_email;

        // Si no hay destinatario, no hay nada que enviar
        if (!$recipient) {
            return;
        }

        $attachments = [];

        foreach ($this->order->items as $item) {
            $ticketData = $pdfService->generateTicketPdfWithName($item);

            $attachments[] = [
                'content' => $ticketData['pdf']->output(),
                'name'    => $ticketData['filename'],
                'mime'    => 'application/pdf',
            ];
        }

        $email = new TicketsResend($this->order, $attachments);
        Mail::to($recipient)->send($email);

        // Actualizar la fecha de envío de email de todos los tickets de la orden
        $this->order->items()->update(['email_sent_at' => now()]);
    }
}
