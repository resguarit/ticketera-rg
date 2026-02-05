<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use App\Enums\UserRole;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        
        $user = $request->user();

        // 🔧 NUEVO: Obtener el organizador correcto si hay impersonación
        $organizer = null;
        $isImpersonating = $request->session()->has('impersonated_organizer_id');
        
        if ($user) {
            if ($isImpersonating) {
                $organizer = \App\Models\Organizer::find($request->session()->get('impersonated_organizer_id'));
            } else {
                $organizer = $user->organizer;
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->person ? ($user->person->name . ' ' . $user->person->last_name) : $user->email,
                    'email' => $user->email,
                    'role' => $user->role instanceof UserRole ? $user->role->value : $user->role,
                    'organizer_id' => $organizer?->id ?? $user->organizer_id,
                    'person' => $user->person,
                    'organizer' => $organizer,
                ] : null,
                'is_impersonating' => $isImpersonating,
                'is_viewer' => $user && ($user->role === UserRole::VIEWER || $user->role === 'viewer'),
                'is_organizer' => $user && ($user->role === UserRole::ORGANIZER || $user->role === 'organizer'),
                'is_admin' => $user && ($user->role === UserRole::ADMIN || $user->role === 'admin'),
            ],
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'print_url' => fn() => $request->session()->get('print_url'),
            ],
            'credentials' => fn() => $request->session()->get('credentials'),
            'supportEmail' => Setting::get('support_email', 'contacto@rgentradas.com'),
            'supportPhone' => Setting::get('support_phone', '+54 9 2216 91-4649'),
            'instagramUrl' => Setting::get('instagram_url', 'https://www.instagram.com/rgentradas/'),
            'facebookUrl' => Setting::get('facebook_url', 'https://www.facebook.com/profile.php?id=61581574912784'),
            // 🔧 CORREGIDO: No mostrar must_change_password si está impersonando
            'must_change_password' => !$isImpersonating && $user?->password_changed_at === null,
        ];
    }
}
