<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FaqCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqCategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/faqs/index', [
            'categories' => FaqCategory::with('faqs')->orderBy('order')->get(),
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
        ]);

        FaqCategory::create($validated);

        return redirect()->route('admin.faqs.index')->with('success', 'Categoría creada.');
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, FaqCategory $faqCategory)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
        ]);

        $faqCategory->update($validated);

        return redirect()->route('admin.faqs.index')->with('success', 'Categoría actualizada.');
    }

    public function destroy(FaqCategory $faqCategory)
    {
        $faqCategory->delete();
        return redirect()->route('admin.faqs.index')->with('success', 'Categoría eliminada.');
    }
}
