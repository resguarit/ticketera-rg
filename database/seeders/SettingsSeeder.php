<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('settings')->truncate();

        $settings = [
            // General Settings
            [
                'key' => 'site_name',
                'value' => 'RG Entradas',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Nombre del sitio web',
                'is_encrypted' => false,
            ],
            [
                'key' => 'site_description',
                'value' => 'La mejor plataforma de venta de tickets',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Descripción del sitio web',
                'is_encrypted' => false,
            ],
            
            // Contact Settings
            [
                'key' => 'support_email',
                'value' => 'contacto@rgentradas.com',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Email de soporte',
                'is_encrypted' => false,
            ],
            [
                'key' => 'support_phone',
                'value' => '+54 9 2216 91-4649',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Teléfono de soporte',
                'is_encrypted' => false,
            ],
            
            // Business Hours
            [
                'key' => 'business_days',
                'value' => 'Lunes a Viernes',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Días de atención',
                'is_encrypted' => false,
            ],
            [
                'key' => 'business_hours',
                'value' => '9:00 - 18:00',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Horarios de atención',
                'is_encrypted' => false,
            ],
            
            // Social Media
            [
                'key' => 'facebook_url',
                'value' => 'https://www.facebook.com/share/17N6jjxJvY/?mibextid=wwXIfr',
                'group' => 'general',
                'type' => 'string',
                'description' => 'URL de Facebook',
                'is_encrypted' => false,
            ],
            [
                'key' => 'instagram_url',
                'value' => 'https://www.instagram.com/rgentradas/',
                'group' => 'general',
                'type' => 'string',
                'description' => 'URL de Instagram',
                'is_encrypted' => false,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }

        $this->command->info('Settings seeded successfully!');
    }
}
