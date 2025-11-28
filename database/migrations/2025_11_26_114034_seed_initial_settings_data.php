<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $settings = [
            // Configuración General
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
            [
                'key' => 'support_email',
                'value' => 'support@rgentradas.com',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Email de soporte al cliente',
                'is_encrypted' => false,
            ],
            [
                'key' => 'support_phone',
                'value' => '+54 9 11 1234-5678',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Teléfono de contacto',
                'is_encrypted' => false,
            ],
            [
                'key' => 'business_days',
                'value' => 'Lunes a Viernes',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Días de atención al público',
                'is_encrypted' => false,
            ],
            [
                'key' => 'business_hours',
                'value' => '9:00 - 18:00',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Horarios de atención al público',
                'is_encrypted' => false,
            ],
        ];

        foreach ($settings as $setting) {
            // Solo insertar si no existe
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                array_merge($setting, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $keys = [
            'site_name',
            'site_description',
            'support_email',
            'support_phone',
            'business_days',
            'business_hours',
        ];

        DB::table('settings')->whereIn('key', $keys)->delete();
    }
};
