<?php

namespace App\Mail;

use Illuminate\Contracts\Queue\ShouldQueue;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketsResend extends Mailable
{
    use Queueable, SerializesModels;

    protected array $pdfAttachmentsData;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Order $order,
        array $pdfAttachmentsData = []
    ){
        $this->pdfAttachmentsData = $pdfAttachmentsData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $eventName = $this->order->items->first()?->ticketType?->eventFunction?->event?->name ?? 'Evento';
        
        return new Envelope(
            subject: 'Reenviamos tus entradas para ' . $eventName,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.tickets.resend',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];
        foreach ($this->pdfAttachmentsData as $attachmentData) {
            $attachments[] = Attachment::fromData(
                fn () => $attachmentData['content'],
                $attachmentData['name']
            )->withMime($attachmentData['mime']);
        }
        return $attachments;
    }
}
