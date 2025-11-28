<?php

namespace App\Jobs;

use App\Mail\TicketsResend;
use App\Models\Order;
use App\Services\PdfService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendOrderTicketJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public Order $order) {}

    /**
     * Execute the job.
     */
    public function handle(PdfService $pdfService): void
    {
        $attachments = [];

        foreach ($this->order->items as $item) {
            $ticketData = $pdfService->generateTicketPdfWithName($item);

            $attachments[] = [
                'content' => $ticketData['pdf']->output(),
                'name' => $ticketData['filename'],
                'mime' => 'application/pdf',
            ];
        }

        $email = new TicketsResend($this->order, $attachments);
        Mail::to($this->order->client->email)->send($email);

        // Actualizar la fecha de envío de email de todos los tickets de la orden
        $this->order->items()->update(['email_sent_at' => now()]);
    }
}
