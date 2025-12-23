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
        $banners = Banner::orderBy('created_at', 'desc')->get();
        return Inertia::render('admin/banners/index', [
            'banners' => $banners
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240', // 10MB max
            'mobile_image' => 'nullable|image|max:10240', // 10MB max
            'title' => 'nullable|string|max:255',
        ]);

        $path = $request->file('image')->store('banners', 'public');
        $mobilePath = $request->file('mobile_image')
            ? $request->file('mobile_image')->store('banners', 'public')
            : null;

        Banner::create([
            'image_path' => $path,
            'mobile_image_path' => $mobilePath,
            'title' => $request->input('title'),
        ]);

        return back();
    }

    public function update(Request $request, Banner $banner)
    {
        $banner->update([
            'is_archived' => $request->boolean('is_archived')
        ]);

        return back();
    }

    public function destroy(Banner $banner)
    {
        if ($banner->image_path) {
            Storage::disk('public')->delete($banner->image_path);
        }

        $banner->delete();

        return redirect()->route('admin.banners.index')->with('success', 'Banner eliminado correctamente.');
    }
}
