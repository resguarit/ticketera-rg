<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Setting;
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

}