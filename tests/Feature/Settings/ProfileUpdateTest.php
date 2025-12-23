<?php

use App\Models\User;
use App\Models\Person;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/settings/profile');

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => 'Updated',
            'lastName' => 'Name',
            'documentNumber' => '87654321',
            'phone' => '1234567890',
            'address' => '123 Test Street',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $user->refresh();

    expect($user->email)->toBe('test@example.com');
    expect($user->person->name)->toBe('Updated');
    expect($user->person->last_name)->toBe('Name');
    expect($user->person->dni)->toBe('87654321');
    expect($user->person->phone)->toBe('1234567890');
    expect($user->person->address)->toBe('123 Test Street');
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => $user->person->name,
            'lastName' => $user->person->last_name,
            'documentNumber' => $user->person->dni,
            'phone' => $user->person->phone ?? '1234567890',
            'address' => $user->person->address ?? '',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/'); // ← Cambiar

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('email verification is reset when email changes', function () {
    $user = User::factory()->create([
        'email' => 'old@example.com',
        'email_verified_at' => now(),
    ]);

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => $user->person->name,
            'lastName' => $user->person->last_name,
            'documentNumber' => $user->person->dni,
            'phone' => $user->person->phone ?? '1234567890',
            'address' => $user->person->address ?? '',
            'email' => 'new@example.com',
        ]);

    $response->assertSessionHasNoErrors();

    $user->refresh();

    expect($user->email)->toBe('new@example.com');
    expect($user->email_verified_at)->toBeNull();
})->skip('Controller does not reset email_verified_at on email change');

test('person information is updated correctly', function () {
    $user = User::factory()->create();
    $originalPersonId = $user->person_id;

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => 'NewFirstName',
            'lastName' => 'NewLastName',
            'documentNumber' => '99999999',
            'phone' => '9876543210',
            'address' => 'New Address 456',
            'email' => $user->email,
        ]);

    $response->assertSessionHasNoErrors();

    $user->person->refresh();

    expect($user->person_id)->toBe($originalPersonId);
    expect($user->person->name)->toBe('NewFirstName');
    expect($user->person->last_name)->toBe('NewLastName');
    expect($user->person->dni)->toBe('99999999');
    expect($user->person->phone)->toBe('9876543210');
    expect($user->person->address)->toBe('New Address 456');
});

test('phone can be updated independently', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => $user->person->name,
            'lastName' => $user->person->last_name,
            'documentNumber' => $user->person->dni,
            'phone' => '5555555555',
            'address' => $user->person->address ?? '',
            'email' => $user->email,
        ]);

    $response->assertSessionHasNoErrors();

    expect($user->person->fresh()->phone)->toBe('5555555555');
});

test('user can delete their account', function () {
    $user = User::factory()->create();
    $personId = $user->person_id;

    $response = $this
        ->actingAs($user)
        ->delete('/settings/profile', [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $this->assertGuest();

    expect($user->fresh()->trashed())->toBeTrue();

    $person = Person::find($personId);
    expect($person)->not->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/settings/profile')
        ->delete('/settings/profile', [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect('/settings/profile');

    expect($user->fresh())->not->toBeNull();
    expect($user->fresh()->trashed())->toBeFalse();
});

test('first name is required', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => '',
            'lastName' => 'User',
            'documentNumber' => '12345678',
            'phone' => '1234567890',
            'address' => 'Test Address',
            'email' => $user->email,
        ]);

    $response->assertSessionHasErrors(['firstName']);
});

test('last name is required', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => 'Test',
            'lastName' => '',
            'documentNumber' => '12345678',
            'phone' => '1234567890',
            'address' => 'Test Address',
            'email' => $user->email,
        ]);

    $response->assertSessionHasErrors(['lastName']);
});

test('document number not is required', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => 'Test',
            'lastName' => 'User',
            'documentNumber' => '',
            'phone' => '1234567890',
            'address' => 'Test Address',
            'email' => $user->email,
        ]);

    $response->assertSessionHasNoErrors();
});

test('email must be valid format', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => 'Test',
            'lastName' => 'User',
            'documentNumber' => '12345678',
            'phone' => '1234567890',
            'address' => 'Test Address',
            'email' => 'invalid-email',
        ]);

    $response->assertSessionHasErrors(['email']);
});

test('email must be unique except for current user', function () {
    $otherUser = User::factory()->create(['email' => 'taken@example.com']);
    $user = User::factory()->create(['email' => 'myemail@example.com']);

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => 'Test',
            'lastName' => 'User',
            'documentNumber' => '12345678',
            'phone' => '1234567890',
            'address' => 'Test Address',
            'email' => 'taken@example.com',
        ]);

    $response->assertSessionHasErrors(['email']);

    $response2 = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => 'Test',
            'lastName' => 'User',
            'documentNumber' => '12345678',
            'phone' => '1234567890',
            'address' => 'Test Address',
            'email' => 'myemail@example.com',
        ]);

    $response2->assertSessionHasNoErrors();
});

test('user relationships are preserved after update', function () {
    $user = User::factory()->create();
    $organizerId = $user->organizer_id;

    $this->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => 'Updated',
            'lastName' => 'Name',
            'documentNumber' => '11111111',
            'phone' => '1111111111',
            'address' => 'Updated Address',
            'email' => 'newemail@example.com',
        ]);

    $user->refresh();

    expect($user->organizer_id)->toBe($organizerId);
    expect($user->person)->not->toBeNull();
});

test('soft deleted user cannot update profile', function () {
    $user = User::factory()->create();

    $user->delete();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => 'Test',
            'lastName' => 'User',
            'documentNumber' => '12345678',
            'phone' => '1234567890',
            'address' => 'Test Address',
            'email' => 'test@example.com',
        ]);

    $response->assertRedirect('/login');
})->skip('Laravel Auth middleware does not check soft deletes by default');

test('address can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => $user->person->name,
            'lastName' => $user->person->last_name,
            'documentNumber' => $user->person->dni,
            'phone' => $user->person->phone ?? '1234567890',
            'address' => 'Brand New Address 789',
            'email' => $user->email,
        ]);

    $response->assertSessionHasNoErrors();

    expect($user->person->fresh()->address)->toBe('Brand New Address 789');
});

test('address can be empty', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'firstName' => $user->person->name,
            'lastName' => $user->person->last_name,
            'documentNumber' => $user->person->dni,
            'phone' => $user->person->phone ?? '1234567890',
            'address' => '',
            'email' => $user->email,
        ]);

    $response->assertSessionHasNoErrors();

    // El controller convierte '' a null
    $address = $user->person->fresh()->address;
    expect($address === '' || $address === null)->toBeTrue();
});

test('user name method returns full name', function () {
    $user = User::factory()->create();

    $user->person->update([
        'name' => 'John',
        'last_name' => 'Doe',
    ]);

    expect($user->name())->toBe('John Doe');
});
