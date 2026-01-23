<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Mail\ContactFormMail;
use App\Models\FaqCategory;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class HelpController extends Controller
{
    public function index()
    {
        $categories = FaqCategory::with(['faqs' => function ($query) {
            $query->orderBy('order');
        }])->orderBy('order')->get();

        return Inertia::render('public/help', [
            'faqCategories' => $categories,
            'supportEmail' => Setting::get('support_email', 'soporte@rgentradas.com'),
            'supportPhone' => Setting::get('support_phone', '+54 9 11 1234-5678'),
            'businessDays' => Setting::get('business_days', 'Lunes a Viernes'),
            'businessHours' => Setting::get('business_hours', '9:00 - 18:00'),
        ]);
    }

    /**
     * Procesar envío de formulario de contacto desde Centro de Ayuda
     */
    public function sendContact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
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