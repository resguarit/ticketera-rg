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
            'supportPhone' => Setting::get('support_phone', '+54 9 11 1234-5678'),
            'businessDays' => Setting::get('business_days', 'Lunes a Viernes'),
            'businessHours' => Setting::get('business_hours', '9:00 - 18:00'),
        ]);
    }
}