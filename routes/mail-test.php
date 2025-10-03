<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use Illuminate\Support\Facades\Mail;

Route::get('/test-email', function () {
    try {
        Mail::raw('Este es un correo de prueba.', function ($message) {
            $message->to('marianosalas24@gmail.com')
                    ->subject('Tus entradas para el evento');
        });
        return "¡Email de prueba enviado exitosamente!";
    } catch (\Exception $e) {
        return "Error al enviar el email: " . $e->getMessage();
    }
});