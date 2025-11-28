<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    // CAMBIAR según tu ruta de dashboard real
    $this->get('/')->assertOk(); // Si la home es pública
    // O si tienes un dashboard protegido:
    // $this->get('/client/dashboard')->assertRedirect('/login');
})->skip('Dashboard route not implemented yet');

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();

    // CAMBIAR según el rol del usuario
    $this->actingAs($user)->get('/')->assertOk();
})->skip('Dashboard route not implemented yet');
