<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/settings', [
            'generalSettings' => $this->getGeneralSettings(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'group' => 'required|string|in:general',
            'settings' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            foreach ($validated['settings'] as $key => $value) {
                $settingKey = $this->mapSettingKey($validated['group'], $key);
                Setting::set($settingKey, $value);
            }

            DB::commit();
            Setting::clearCache();

            return response()->json([
                'message' => 'Configuraciones guardadas correctamente',
                'success' => true,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Error al guardar las configuraciones: ' . $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }

    private function mapSettingKey(string $group, string $key): string
    {
        $keyMappings = [
            'general' => [
                'siteName' => 'site_name',
                'siteDescription' => 'site_description',
                'supportEmail' => 'support_email',
                'supportPhone' => 'support_phone',
                'businessDays' => 'business_days',
                'businessHours' => 'business_hours',
                'facebookUrl' => 'facebook_url',
                'instagramUrl' => 'instagram_url',
            ],
        ];

        return $keyMappings[$group][$key] ?? $group . '_' . $key;
    }

    private function getGeneralSettings(): array
    {
        return [
            'siteName' => Setting::get('site_name', 'RG Entradas'),
            'siteDescription' => Setting::get('site_description', 'La mejor plataforma de venta de tickets'),
            'supportEmail' => Setting::get('support_email', 'support@rgentradas.com'),
            'supportPhone' => Setting::get('support_phone', '+54 9 11 1234-5678'),
            'businessDays' => Setting::get('business_days', 'Lunes a Viernes'),
            'businessHours' => Setting::get('business_hours', '9:00 - 18:00'),
            'facebookUrl' => Setting::get('facebook_url', 'https://www.facebook.com/share/17N6jjxJvY/?mibextid=wwXIfr'),
            'instagramUrl' => Setting::get('instagram_url', 'https://www.instagram.com/rgentradas/'),
        ];
    }
}