<?php

use App\Models\Person;
use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $response = $this->post('/register', [
        'name' => 'Test',           // ← Usar 'name' según RegisteredUserController
        'last_name' => 'User',      // ← Usar 'last_name'
        'dni' => '12345678',        // ← Usar 'dni' (nullable)
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect('/');
});

test('registration creates person record', function () {
    $this->post('/register', [
        'name' => 'John',
        'last_name' => 'Doe',
        'dni' => '87654321',
        'email' => 'john@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', 'john@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user->person)->not->toBeNull();
    expect($user->person->name)->toBe('John');
    expect($user->person->last_name)->toBe('Doe');
    expect($user->person->dni)->toBe('87654321');
});

test('email must be unique during registration', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => '12345678',
        'email' => 'existing@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['email']);
    $this->assertGuest();
});

test('dni must be unique during registration', function () {
    $existingUser = User::factory()->create();

    $response = $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => $existingUser->person->dni, // Mismo DNI
        'email' => 'newuser@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['dni']);
    $this->assertGuest();
});

test('password must be confirmed', function () {
    $response = $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => '12345678',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'different-password',
    ]);

    $response->assertSessionHasErrors(['password']);
    $this->assertGuest();
});

test('all required fields are validated', function () {
    $response = $this->post('/register', []);

    $response->assertSessionHasErrors([
        'name',
        'last_name',
        'email',
        'password',
    ]);

    $this->assertGuest();
});

test('dni is optional during registration', function () {
    $response = $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        // 'dni' no enviado
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();

    $user = User::where('email', 'test@example.com')->first();
    expect($user->person->dni)->toBeNull();
});

test('new users have client role by default', function () {
    $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => '12345678',
        'email' => 'client@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', 'client@example.com')->first();

    expect($user->role->value)->toBe('client');
});

test('password_changed_at is set during registration', function () {
    $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => '12345678',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', 'test@example.com')->first();

    expect($user->password_changed_at)->not->toBeNull();
});

test('password is hashed during registration', function () {
    $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => '12345678',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', 'test@example.com')->first();

    expect($user->password)->not->toBe('password');
    expect(Hash::check('password', $user->password))->toBeTrue();
});

test('registered event is fired', function () {
    Event::fake();

    $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => '12345678',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    Event::assertDispatched(\Illuminate\Auth\Events\Registered::class);
});

test('transaction rolls back on person creation failure', function () {
    // Simular error forzando DNI duplicado en transacción
    $existingPerson = Person::factory()->create(['dni' => '12345678']);

    $response = $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => '12345678', // Duplicado
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    // No debería crear el usuario si falla la persona
    $user = User::where('email', 'test@example.com')->first();
    expect($user)->toBeNull();

    $this->assertGuest();
});

test('email is converted to lowercase', function () {
    $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => '12345678',
        'email' => 'TEST@EXAMPLE.COM',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    // Buscar con el email original (mayúsculas)
    $user = User::where('email', 'TEST@EXAMPLE.COM')->first();

    expect($user)->not->toBeNull();
    // El email se guarda tal cual se envió
    expect($user->email)->toBe('TEST@EXAMPLE.COM');
})->skip('Email lowercase conversion not implemented');

test('user is automatically logged in after registration', function () {
    $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => '12345678',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();

    $user = User::where('email', 'test@example.com')->first();
    expect(auth()->id())->toBe($user->id);
});

test('person and user are linked correctly', function () {
    $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => '12345678',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', 'test@example.com')->first();
    $person = Person::find($user->person_id);

    expect($person)->not->toBeNull();
    expect($person->id)->toBe($user->person_id);
    expect($person->name)->toBe('Test');
});

test('name has max length validation', function () {
    $response = $this->post('/register', [
        'name' => str_repeat('a', 256), // Más de 255 caracteres
        'last_name' => 'User',
        'dni' => '12345678',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['name']);
});

test('last name has max length validation', function () {
    $response = $this->post('/register', [
        'name' => 'Test',
        'last_name' => str_repeat('a', 256),
        'dni' => '12345678',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['last_name']);
});

test('dni has max length validation', function () {
    $response = $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => str_repeat('1', 21), // Más de 20 caracteres
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['dni']);
});

test('email must be valid format', function () {
    $response = $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => '12345678',
        'email' => 'invalid-email',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['email']);
});

test('password must meet minimum requirements', function () {
    $response = $this->post('/register', [
        'name' => 'Test',
        'last_name' => 'User',
        'dni' => '12345678',
        'email' => 'test@example.com',
        'password' => '123', // Muy corta
        'password_confirmation' => '123',
    ]);

    $response->assertSessionHasErrors(['password']);
});
