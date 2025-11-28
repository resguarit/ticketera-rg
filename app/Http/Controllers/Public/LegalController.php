<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    /**
     * Mostrar página de Términos y Condiciones
     */
    public function terms(): Response
    {
        return Inertia::render('public/terms');
    }

    /**
     * Mostrar página de Política de Privacidad
     */
    public function privacy(): Response
    {
        return Inertia::render('public/privacy');
    }

    /**
     * Mostrar página de Política de Reembolsos
     */
    public function refunds(): Response
    {
        return Inertia::render('public/refunds');
    }
}
