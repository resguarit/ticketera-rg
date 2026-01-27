<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::ordered()->get();
        return Inertia::render('admin/banners/index', [
            'banners' => $banners
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240',
            'mobile_image' => 'nullable|image|max:10240',
            'title' => 'nullable|string|max:255',
            'duration_seconds' => 'nullable|integer|min:1|max:60',
        ]);

        $path = $request->file('image')->store('banners', 'public');
        $mobilePath = $request->file('mobile_image')
            ? $request->file('mobile_image')->store('banners', 'public')
            : null;

        // Obtener el orden más alto y sumar 1
        $maxOrder = Banner::max('display_order') ?? 0;

        Banner::create([
            'image_path' => $path,
            'mobile_image_path' => $mobilePath,
            'title' => $request->input('title'),
            'duration_seconds' => $request->input('duration_seconds', 5),
            'display_order' => $maxOrder + 1,
        ]);

        return back()->with('success', 'Banner creado exitosamente');
    }

    public function edit(Banner $banner)
    {
        return Inertia::render('admin/banners/edit', [
            'banner' => $banner
        ]);
    }

    public function update(Request $request, Banner $banner)
    {
        $request->validate([
            'image' => 'nullable|image|max:10240',
            'mobile_image' => 'nullable|image|max:10240',
            'title' => 'nullable|string|max:255',
            'is_archived' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
            'duration_seconds' => 'nullable|integer|min:1|max:60',
        ]);

        $updateData = [];

        // Actualizar imagen desktop si se subió una nueva
        if ($request->hasFile('image')) {
            if ($banner->image_path) {
                Storage::disk('public')->delete($banner->image_path);
            }
            $updateData['image_path'] = $request->file('image')->store('banners', 'public');
        }

        // Actualizar imagen mobile si se subió una nueva
        if ($request->hasFile('mobile_image')) {
            if ($banner->mobile_image_path) {
                Storage::disk('public')->delete($banner->mobile_image_path);
            }
            $updateData['mobile_image_path'] = $request->file('mobile_image')->store('banners', 'public');
        }

        // Actualizar otros campos
        if ($request->has('title')) {
            $updateData['title'] = $request->input('title');
        }

        if ($request->has('is_archived')) {
            $updateData['is_archived'] = $request->boolean('is_archived');
        }

        if ($request->has('display_order')) {
            $updateData['display_order'] = $request->input('display_order');
        }

        if ($request->has('duration_seconds')) {
            $updateData['duration_seconds'] = $request->input('duration_seconds');
        }

        $banner->update($updateData);

        return redirect()->route('admin.banners.index')->with('success', 'Banner actualizado exitosamente');
    }

    public function destroy(Banner $banner)
    {
        if ($banner->image_path) {
            Storage::disk('public')->delete($banner->image_path);
        }

        if ($banner->mobile_image_path) {
            Storage::disk('public')->delete($banner->mobile_image_path);
        }

        $banner->delete();

        return redirect()->route('admin.banners.index')->with('success', 'Banner eliminado correctamente.');
    }

    /**
     * Actualizar el orden de múltiples banners
     */
    public function updateOrder(Request $request)
    {
        $request->validate([
            'banners' => 'required|array',
            'banners.*.id' => 'required|exists:banners,id',
            'banners.*.display_order' => 'required|integer|min:0',
        ]);

        foreach ($request->input('banners') as $bannerData) {
            Banner::where('id', $bannerData['id'])
                ->update(['display_order' => $bannerData['display_order']]);
        }

        return back()->with('success', 'Orden actualizado correctamente');
    }
}
