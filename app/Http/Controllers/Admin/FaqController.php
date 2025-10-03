<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class FaqController extends Controller
{
    public function index(): Response
    {
        $faqs = Faq::orderBy('category')->orderBy('order')->get()->groupBy('category');
        
        $categoryDetails = [
            'Compra de Tickets' => ['icon' => 'Ticket', 'color' => 'primary'],
            'Pagos y Facturación' => ['icon' => 'CreditCard', 'color' => 'red-500'],
            'Eventos' => ['icon' => 'Users', 'color' => 'orange-500'],
            'Cuenta y Perfil' => ['icon' => 'Shield', 'color' => 'green-500'],
        ];

        return Inertia::render('admin/faqs/index', [
            'faqsByCategory' => $faqs,
            'categoryDetails' => $categoryDetails,
        ]);
    }

    public function create(): Response
    {
        $categories = Faq::select('category')->distinct()->pluck('category');
        return Inertia::render('admin/faqs/create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'faq_category_id' => 'required|exists:faq_categories,id',
            'question' => 'required|string',
            'answer' => 'required|string',
            'order' => 'nullable|integer',
        ]);

        Faq::create($validated);

        return redirect()->route('admin.faqs.index')->with('success', 'Pregunta frecuente creada exitosamente.');
    }

    public function show(string $id)
    {
        //
    }

    public function edit(Faq $faq): Response
    {
        $categories = Faq::select('category')->distinct()->pluck('category');
        return Inertia::render('admin/faqs/edit', [
            'faq' => $faq,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Faq $faq): RedirectResponse
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'answer' => 'required|string',
            'order' => 'nullable|integer',
        ]);

        $faq->update($validated);

        return redirect()->route('admin.faqs.index')->with('success', 'Pregunta frecuente actualizada exitosamente.');
    }

    public function destroy(Faq $faq): RedirectResponse
    {
        $faq->delete();
        return redirect()->route('admin.faqs.index')->with('success', 'Pregunta frecuente eliminada exitosamente.');
    }
}
