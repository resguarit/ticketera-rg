<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WelcomePopup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WelcomePopupController extends Controller
{
    public function index(): Response
    {
        $popups = WelcomePopup::latest()->get();

        return Inertia::render('admin/popups/index', [
            'popups' => $popups,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/popups/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'image_url' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'mobile_image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'is_active' => 'boolean',
        ]);

        $popup = new WelcomePopup();
        $popup->is_active = $validated['is_active'] ?? true;

        if ($request->hasFile('image_url')) {
            $popup->image_url = $request->file('image_url')->store('welcome-popups', 'public');
        }

        if ($request->hasFile('mobile_image_url')) {
            $popup->mobile_image_url = $request->file('mobile_image_url')->store('welcome-popups/mobile', 'public');
        }

        $popup->save();

        return redirect()
            ->route('admin.popups.index')
            ->with('success', 'Popup de bienvenida creado exitosamente');
    }

    public function edit(WelcomePopup $welcomePopup): Response
    {
        return Inertia::render('admin/popups/edit', [
            'popup' => $welcomePopup,
        ]);
    }

    public function update(Request $request, WelcomePopup $welcomePopup)
    {
        $validated = $request->validate([
            'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'mobile_image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image_url')) {
            if ($welcomePopup->image_url) {
                Storage::disk('public')->delete($welcomePopup->image_url);
            }
            $welcomePopup->image_url = $request->file('image_url')->store('welcome-popups', 'public');
        }

        if ($request->hasFile('mobile_image_url')) {
            if ($welcomePopup->mobile_image_url) {
                Storage::disk('public')->delete($welcomePopup->mobile_image_url);
            }
            $welcomePopup->mobile_image_url = $request->file('mobile_image_url')->store('welcome-popups/mobile', 'public');
        }

        $welcomePopup->is_active = $validated['is_active'] ?? $welcomePopup->is_active;
        $welcomePopup->save();

        return redirect()
            ->route('admin.popups.index')
            ->with('success', 'Popup de bienvenida actualizado exitosamente');
    }

    public function destroy(WelcomePopup $welcomePopup)
    {
        if ($welcomePopup->image_url) {
            Storage::disk('public')->delete($welcomePopup->image_url);
        }

        if ($welcomePopup->mobile_image_url) {
            Storage::disk('public')->delete($welcomePopup->mobile_image_url);
        }

        $welcomePopup->delete();

        return redirect()
            ->route('admin.popups.index')
            ->with('success', 'Popup de bienvenida eliminado exitosamente');
    }

    public function toggleActive(WelcomePopup $welcomePopup)
    {
        $welcomePopup->update([
            'is_active' => !$welcomePopup->is_active
        ]);

        return back()->with('success', 'Estado del popup actualizado');
    }
}