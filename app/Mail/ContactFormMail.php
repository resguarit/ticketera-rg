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
        // Detectar si es una solicitud de arrepentimiento
        $isArrepentimiento = isset($this->data['subject']) && 
                            str_contains($this->data['subject'], 'Arrepentimiento');
        
        // Construir el asunto apropiado
        if ($isArrepentimiento && !empty($this->data['orderNumber'])) {
            // Para arrepentimiento: "Botón de Arrepentimiento – Orden N° XXX"
            $subject = 'Botón de Arrepentimiento – Orden N° ' . $this->data['orderNumber'];
        } else {
            // Para formulario de contacto: solo el asunto del usuario
            $subject = 'Formulario de Contacto:' . $this->data['subject'];
        }
        
        return new Envelope(
            subject: $subject,
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