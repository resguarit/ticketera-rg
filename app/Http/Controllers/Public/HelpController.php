<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\FaqCategory;
use App\Models\Setting;
use Inertia\Inertia;

class HelpController extends Controller
{
    public function index()
    {
        $categories = FaqCategory::with(['faqs' => function ($query) {
            $query->orderBy('order');
        }])->orderBy('order')->get();

        return Inertia::render('public/help', [
            'faqCategories' => $categories,
            'supportEmail' => Setting::get('support_email', 'soporte@rgentradas.com'),
        ]);
    }
}