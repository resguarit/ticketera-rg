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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general'); // general, email, payment, security, notification
            $table->string('type')->default('string'); // string, boolean, integer, float, json
            $table->text('description')->nullable();
            $table->boolean('is_encrypted')->default(false);
            $table->timestamps();
        });

        // Insertar configuraciones por defecto
        DB::table('settings')->insert([
            // General Settings
            ['key' => 'site_name', 'value' => 'RG Entradas', 'group' => 'general', 'type' => 'string', 'description' => 'Nombre del sitio', 'is_encrypted' => false],
            ['key' => 'site_description', 'value' => 'La mejor plataforma de venta de tickets', 'group' => 'general', 'type' => 'string', 'description' => 'Descripción del sitio', 'is_encrypted' => false],
            ['key' => 'contact_email', 'value' => 'contact@rgentradas.com', 'group' => 'general', 'type' => 'string', 'description' => 'Email de contacto', 'is_encrypted' => false],
            ['key' => 'support_email', 'value' => 'support@rgentradas.com', 'group' => 'general', 'type' => 'string', 'description' => 'Email de soporte', 'is_encrypted' => false],
            ['key' => 'timezone', 'value' => 'America/Argentina/Buenos_Aires', 'group' => 'general', 'type' => 'string', 'description' => 'Zona horaria', 'is_encrypted' => false],
            ['key' => 'currency', 'value' => 'ARS', 'group' => 'general', 'type' => 'string', 'description' => 'Moneda', 'is_encrypted' => false],
            ['key' => 'language', 'value' => 'es', 'group' => 'general', 'type' => 'string', 'description' => 'Idioma', 'is_encrypted' => false],

            // Email Settings
            ['key' => 'smtp_host', 'value' => 'smtp.gmail.com', 'group' => 'email', 'type' => 'string', 'description' => 'Servidor SMTP', 'is_encrypted' => false],
            ['key' => 'smtp_port', 'value' => '587', 'group' => 'email', 'type' => 'integer', 'description' => 'Puerto SMTP', 'is_encrypted' => false],
            ['key' => 'smtp_username', 'value' => '', 'group' => 'email', 'type' => 'string', 'description' => 'Usuario SMTP', 'is_encrypted' => false],
            ['key' => 'smtp_password', 'value' => '', 'group' => 'email', 'type' => 'string', 'description' => 'Contraseña SMTP', 'is_encrypted' => true],
            ['key' => 'smtp_encryption', 'value' => 'tls', 'group' => 'email', 'type' => 'string', 'description' => 'Encriptación SMTP', 'is_encrypted' => false],
            ['key' => 'from_email', 'value' => 'noreply@rgentradas.com', 'group' => 'email', 'type' => 'string', 'description' => 'Email remitente', 'is_encrypted' => false],
            ['key' => 'from_name', 'value' => 'RG Entradas', 'group' => 'email', 'type' => 'string', 'description' => 'Nombre remitente', 'is_encrypted' => false],

            // Payment Settings
            ['key' => 'stripe_enabled', 'value' => 'true', 'group' => 'payment', 'type' => 'boolean', 'description' => 'Habilitar Stripe', 'is_encrypted' => false],
            ['key' => 'stripe_public_key', 'value' => '', 'group' => 'payment', 'type' => 'string', 'description' => 'Clave pública de Stripe', 'is_encrypted' => false],
            ['key' => 'stripe_secret_key', 'value' => '', 'group' => 'payment', 'type' => 'string', 'description' => 'Clave secreta de Stripe', 'is_encrypted' => true],
            ['key' => 'mercadopago_enabled', 'value' => 'true', 'group' => 'payment', 'type' => 'boolean', 'description' => 'Habilitar MercadoPago', 'is_encrypted' => false],
            ['key' => 'mercadopago_access_token', 'value' => '', 'group' => 'payment', 'type' => 'string', 'description' => 'Access Token de MercadoPago', 'is_encrypted' => true],
            ['key' => 'commission_rate', 'value' => '5.0', 'group' => 'payment', 'type' => 'float', 'description' => 'Tasa de comisión', 'is_encrypted' => false],

            // Security Settings
            ['key' => 'two_factor_required', 'value' => 'false', 'group' => 'security', 'type' => 'boolean', 'description' => '2FA requerido', 'is_encrypted' => false],
            ['key' => 'password_min_length', 'value' => '8', 'group' => 'security', 'type' => 'integer', 'description' => 'Longitud mínima de contraseña', 'is_encrypted' => false],
            ['key' => 'session_timeout', 'value' => '60', 'group' => 'security', 'type' => 'integer', 'description' => 'Timeout de sesión (minutos)', 'is_encrypted' => false],
            ['key' => 'max_login_attempts', 'value' => '5', 'group' => 'security', 'type' => 'integer', 'description' => 'Máximos intentos de login', 'is_encrypted' => false],
            ['key' => 'ip_whitelist_enabled', 'value' => 'false', 'group' => 'security', 'type' => 'boolean', 'description' => 'Lista blanca de IPs', 'is_encrypted' => false],
            ['key' => 'maintenance_mode', 'value' => 'false', 'group' => 'security', 'type' => 'boolean', 'description' => 'Modo mantenimiento', 'is_encrypted' => false],

            // Notification Settings
            ['key' => 'email_notifications', 'value' => 'true', 'group' => 'notification', 'type' => 'boolean', 'description' => 'Notificaciones por email', 'is_encrypted' => false],
            ['key' => 'sms_notifications', 'value' => 'false', 'group' => 'notification', 'type' => 'boolean', 'description' => 'Notificaciones por SMS', 'is_encrypted' => false],
            ['key' => 'push_notifications', 'value' => 'true', 'group' => 'notification', 'type' => 'boolean', 'description' => 'Notificaciones push', 'is_encrypted' => false],
            ['key' => 'new_user_notification', 'value' => 'true', 'group' => 'notification', 'type' => 'boolean', 'description' => 'Notificar nuevos usuarios', 'is_encrypted' => false],
            ['key' => 'new_event_notification', 'value' => 'true', 'group' => 'notification', 'type' => 'boolean', 'description' => 'Notificar nuevos eventos', 'is_encrypted' => false],
            ['key' => 'payment_notification', 'value' => 'true', 'group' => 'notification', 'type' => 'boolean', 'description' => 'Notificar pagos', 'is_encrypted' => false],
            ['key' => 'security_alerts', 'value' => 'true', 'group' => 'notification', 'type' => 'boolean', 'description' => 'Alertas de seguridad', 'is_encrypted' => false],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
