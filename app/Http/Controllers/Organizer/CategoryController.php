<?php
// filepath: app/Http/Controllers/Organizer/CategoryController.php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::withCount('events')->get();
        
        return Inertia::render('organizer/categories/index', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:7'
        ]);

        Category::create($request->only(['name', 'icon', 'color']));

        return redirect()->back()->with('success', 'Categoría creada exitosamente');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:7'
        ]);

        $category->update($request->only(['name', 'icon', 'color']));

        return redirect()->back()->with('success', 'Categoría actualizada exitosamente');
    }

    public function destroy(Category $category): RedirectResponse
    {
        // Verificar si tiene eventos asociados
        if ($category->events()->count() > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar una categoría que tiene eventos asociados');
        }

        $category->delete();

        return redirect()->back()->with('success', 'Categoría eliminada exitosamente');
    }

    // API endpoint para select options
    public function getForSelect()
    {
        $categories = Category::select('id', 'name', 'icon', 'color')->get();
        
        return response()->json($categories);
    }
}