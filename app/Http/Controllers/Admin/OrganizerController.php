<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOrganizerRequest;
use App\Http\Requests\Admin\UpdateOrganizerRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Organizer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;

class OrganizerController extends Controller
{
    public function index(Request $request): Response
    {
        $totalOrganizers = Organizer::count();
        $activeOrganizers = Organizer::count();
        $totalEvents = Event::count();
        $totalRevenue = 0;

        $stats = [
            'total_organizers' => $totalOrganizers,
            'active_organizers' => $activeOrganizers,
            'total_events' => $totalEvents,
            'total_revenue' => $totalRevenue,
        ];

        $organizers = Organizer::query()
            ->withCount('events')
            ->when($request->input('search'), function (Builder $query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy($request->input('sort_by', 'created_at'), $request->input('sort_direction', 'desc'))
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/organizers/index', [
            'organizers' => $organizers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'sort_by', 'sort_direction']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/organizers/new');
    }

    public function store(StoreOrganizerRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('logo_url')) {
            $file = $request->file('logo_url');
            $filename = time() . '_' . $file->getClientOriginalName();
            
            // Mover el archivo a public/images/organizers
            $file->move(public_path('images/organizers'), $filename);
            
            // Guardar solo el nombre del archivo en la base de datos
            $validated['logo_url'] = $filename;
        }

        Organizer::create($validated);
        
        return redirect()->route('admin.organizers.index')
            ->with('success', 'Organizador creado correctamente.');
    }

    public function show(int $organizerId): Response
    {
        $organizer = Organizer::with(['events.category', 'events.venue', 'users.person'])->findOrFail($organizerId);
        return Inertia::render('admin/organizers/show', [
            'organizer' => $organizer,
        ]);
    }

    public function edit(int $organizerId): Response
    {
        $organizer = Organizer::findOrFail($organizerId);
        return Inertia::render('admin/organizers/edit', [
            'organizer' => $organizer,
        ]);
    }

    public function update(UpdateOrganizerRequest $request, $organizerId): RedirectResponse
    {
        $organizer = Organizer::findOrFail($organizerId);
        $validated = $request->validated();

        if ($request->hasFile('logo_url')) {
            // Eliminar el logo anterior si existe
            if ($organizer->logo_url) {
                $oldLogoPath = public_path('images/organizers/' . $organizer->logo_url);
                if (file_exists($oldLogoPath)) {
                    unlink($oldLogoPath);
                }
            }

            $file = $request->file('logo_url');
            $filename = time() . '_' . $file->getClientOriginalName();
            
            // Mover el nuevo archivo
            $file->move(public_path('images/organizers'), $filename);
            
            $validated['logo_url'] = $filename;
        }

        $organizer->update($validated);
        
        return redirect()->route('admin.organizers.index')
            ->with('success', 'Organizador actualizado correctamente.');
    }

    public function destroy(int $organizerId): RedirectResponse
    {
        $organizer = Organizer::findOrFail($organizerId);
        
        // Eliminar el logo si existe
        if ($organizer->logo_url) {
            $logoPath = public_path('images/organizers/' . $organizer->logo_url);
            if (file_exists($logoPath)) {
                unlink($logoPath);
            }
        }
        
        $organizer->delete();
        
        return redirect()->route('admin.organizers.index')
            ->with('success', 'Organizador eliminado correctamente.');
    }
}