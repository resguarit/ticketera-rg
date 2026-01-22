<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Enums\UserRole;
use App\Models\Organizer;
use Illuminate\Support\Facades\Auth;

class IsOrganizer
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            abort(403, 'Unauthorized action.');
        }

        if ($user->role === UserRole::ADMIN) {
            if (session()->has('impersonated_organizer_id')) {
                $organizerId = session()->get('impersonated_organizer_id');
                $organizer = Organizer::find($organizerId);
                if ($organizer) {
                    $user->setRelation('organizer', $organizer);
                    $user->organizer_id = $organizerId;
                    return $next($request);
                }
            }

            return redirect()->route('admin.organizers.index')
                ->with('warning', 'Debes seleccionar un organizador.');
        }

        if ($user->role === UserRole::ORGANIZER) {
            return $next($request);
        }

        abort(403, 'Unauthorized action.');
    }
}
