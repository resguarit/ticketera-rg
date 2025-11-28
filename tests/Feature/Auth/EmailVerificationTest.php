<?php

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;

test('email verification screen can be rendered', function () {
    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->get('/verify-email');

    $response->assertStatus(200);
});

test('email can be verified', function () {
    $user = User::factory()->unverified()->create();

    Event::fake();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    Event::assertDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();

    // Cambiar según tu ruta post-verificación
    $response->assertRedirect('/'); // O la ruta que uses en tu app
});

test('email is not verified with invalid hash', function () {
    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1('wrong-email')]
    );

    $this->actingAs($user)->get($verificationUrl);

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('email verification link expires', function () {
    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->subMinutes(1), // URL expirada
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
    $response->assertStatus(403); // Forbidden
});

test('email verification notification can be sent', function () {
    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->post('/email/verification-notification');

    $response->assertSessionHas('status', 'verification-link-sent');
});

test('already verified email cannot be verified again', function () {
    $user = User::factory()->create(); // Ya verificado

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    // Redirige porque ya está verificado
    $response->assertRedirect('/'); // O tu ruta configurada
});

test('user must be authenticated to verify email', function () {
    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->get($verificationUrl);

    $response->assertRedirect('/login');
});

test('user cannot verify another users email', function () {
    $user = User::factory()->unverified()->create();
    $otherUser = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $otherUser->id, 'hash' => sha1($otherUser->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    expect($otherUser->fresh()->hasVerifiedEmail())->toBeFalse();
    $response->assertStatus(403);
});

test('verified event is fired when email is verified', function () {
    Event::fake();

    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $this->actingAs($user)->get($verificationUrl);

    Event::assertDispatched(Verified::class, function ($event) use ($user) {
        return $event->user->id === $user->id;
    });
});

test('email_verified_at timestamp is set correctly', function () {
    $user = User::factory()->unverified()->create();

    expect($user->email_verified_at)->toBeNull();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $this->actingAs($user)->get($verificationUrl);

    $user->refresh();

    expect($user->email_verified_at)->not->toBeNull();
    expect($user->email_verified_at)->toBeInstanceOf(\Illuminate\Support\Carbon::class);
});
