<?php

namespace App\Jobs;

use App\Mail\TicketsInvited;
use App\Models\IssuedTicket;
use App\Services\PdfService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesAndRestoresModelIdentifiers;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;

class SendTicketBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesAndRestoresModelIdentifiers, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public Collection $tickets, public string $recipientEmail) {}

    /**
     * Execute the job.
     */
    public function handle(PdfService $pdfService): void
    {
        if ($this->tickets->isEmpty()) {
            return;
        }

        $attachments = [];

        foreach ($this->tickets as $ticket) {
            $ticketData = $pdfService->generateTicketPdfWithName($ticket);
            $attachments[] = [
                'content' => $ticketData['pdf']->output(),
                'name' => $ticketData['filename'],
                'mime' => 'application/pdf',
            ];
        }

        $email = new TicketsInvited($this->tickets, $attachments);
        Mail::to($this->recipientEmail)->send($email);

        $ticketsIds = $this->tickets->pluck('id');
        IssuedTicket::whereIn('id', $ticketsIds)->update(['email_sent_at' => now()]);
    }
}
