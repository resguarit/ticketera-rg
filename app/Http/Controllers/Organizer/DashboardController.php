<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = Auth::user();

        $organizerData = [
            'name' => 'Fan Tickets', 
            'id' => 1,
        ];

        return Inertia::render('organizer/dashboard', [
            'organizer' => $organizerData, 
        ]);
    }
}
