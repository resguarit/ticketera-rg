<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class TicketsInvited extends Mailable
{
    use Queueable, SerializesModels;

    protected array $pdfAttachmentsData;
    public Collection $tickets;

    /**
     * Create a new message instance.
     */
    public function __construct(Collection $tickets, array $pdfAttachmentsData = [])
    {
        $this->tickets = $tickets;
        $this->pdfAttachmentsData = $pdfAttachmentsData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $eventName = $this->tickets->isNotEmpty() 
            ? $this->tickets->first()->ticketType?->eventFunction?->event?->name ?? 'Evento'
            : 'Evento';
            
        return new Envelope(
            subject: 'Has sido invitado al evento ' . $eventName
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.tickets.invited',
            with: [
                'tickets' => $this->tickets,
            ]
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
