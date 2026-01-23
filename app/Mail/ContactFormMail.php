<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactFormMail extends Mailable
{
    use Queueable, SerializesModels;

    public $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nuevo mensaje de contacto / Arrepentimiento: ' . $this->data['subject'],
            replyTo: [$this->data['email']]
        );
    }

    public function content(): Content
    {
        // Detectar si es una solicitud de arrepentimiento
        $isArrepentimiento = isset($this->data['subject']) && 
                            str_contains($this->data['subject'], 'Arrepentimiento');
        
        return new Content(
            view: $isArrepentimiento ? 'emails.arrepentimiento' : 'emails.contact',
        );
    }
}