<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Mail\ContactFormMail;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    /**
     * Mostrar página de Términos y Condiciones
     */
    public function terms(): Response
    {
        return Inertia::render('public/terms', [
            'supportEmail' => Setting::get('support_email', 'soporte@rgentradas.com'),
            'supportPhone' => Setting::get('support_phone', '+54 9 11 1234-5678'),
        ]);
    }

    /**
     * Mostrar página de Política de Privacidad
     */
    public function privacy(): Response
    {
        return Inertia::render('public/privacy');
    }

    /**
     * Mostrar página de Botón de Arrepentimiento
     */
    public function arrepentimiento(): Response
    {
        return Inertia::render('public/arrepentimiento', [
            'supportEmail' => Setting::get('support_email', 'soporte@rgentradas.com'),
            'supportPhone' => Setting::get('support_phone', '+54 9 11 1234-5678'),
        ]);
    }

    /**
     * Procesar envío de formulario de contacto/arrepentimiento
     */
    public function sendContact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'dni' => 'nullable|string|max:20',
            'cardHolderDni' => 'nullable|string|max:20',
            'orderNumber' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:2000',
            'event' => 'nullable|string|max:500',
            'ticketQuantity' => 'nullable|string|max:10',
            'paymentMethod' => 'nullable|string|max:255',
            'reason' => 'nullable|string|max:1000', // Agregar este campo
            'declaration' => 'nullable|string|max:1000',
        ]);

        $recipient = Setting::get('support_email', 'contacto@rgentradas.com');

        try {
            Mail::to($recipient)->send(new ContactFormMail($validated));
            return back()->with('success', 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.');
        } catch (\Exception $e) {
            return back()->with('error', 'Hubo un error al enviar el mensaje. Por favor intenta más tarde.');
        }
    }
}