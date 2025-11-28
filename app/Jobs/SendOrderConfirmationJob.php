<?php

namespace App\Jobs;

use App\Mail\TicketsPurchased;
use App\Models\Order;
use App\Services\PdfService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmationJob implements ShouldQueue
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

        $email = new TicketsPurchased($this->order, $attachments);
        Mail::to($this->order->client->email)->send($email);
    }
}
