<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/settings', [
            'generalSettings' => $this->getGeneralSettings(),
            'emailSettings' => $this->getEmailSettings(),
            'paymentSettings' => $this->getPaymentSettings(),
            'securitySettings' => $this->getSecuritySettings(),
            'notificationSettings' => $this->getNotificationSettings(),
        ]);
    }

    public function update(Request $request)
{
    $validated = $request->validate([
        'group' => 'required|string|in:general,email,payment,security,notification',
        'settings' => 'required|array',
    ]);

    try {
        DB::beginTransaction();

        foreach ($validated['settings'] as $key => $value) {
            // Mapear las claves camelCase a snake_case para la base de datos
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

/**
 * Mapear claves camelCase a snake_case para la base de datos
 */
private function mapSettingKey(string $group, string $key): string
{
    $keyMappings = [
        'general' => [
            'siteName' => 'site_name',
            'siteDescription' => 'site_description',
            'contactEmail' => 'contact_email',
            'supportEmail' => 'support_email',
            'timezone' => 'timezone',
            'currency' => 'currency',
            'language' => 'language',
        ],
        'email' => [
            'smtpHost' => 'email_smtp_host',
            'smtpPort' => 'email_smtp_port',
            'smtpUsername' => 'email_smtp_username',
            'smtpPassword' => 'email_smtp_password',
            'smtpEncryption' => 'email_smtp_encryption',
            'fromEmail' => 'email_from_email',
            'fromName' => 'email_from_name',
        ],
        'payment' => [
            'stripeEnabled' => 'payment_stripe_enabled',
            'stripePublicKey' => 'payment_stripe_public_key',
            'stripeSecretKey' => 'payment_stripe_secret_key',
            'mercadopagoEnabled' => 'payment_mercadopago_enabled',
            'mercadopagoAccessToken' => 'payment_mercadopago_access_token',
            'commissionRate' => 'payment_commission_rate',
        ],
        'security' => [
            'twoFactorRequired' => 'security_two_factor_required',
            'passwordMinLength' => 'security_password_min_length',
            'sessionTimeout' => 'security_session_timeout',
            'maxLoginAttempts' => 'security_max_login_attempts',
            'ipWhitelistEnabled' => 'security_ip_whitelist_enabled',
            'maintenanceMode' => 'security_maintenance_mode',
        ],
        'notification' => [
            'emailNotifications' => 'notification_email_notifications',
            'smsNotifications' => 'notification_sms_notifications',
            'pushNotifications' => 'notification_push_notifications',
            'newUserNotification' => 'notification_new_user_notification',
            'newEventNotification' => 'notification_new_event_notification',
            'paymentNotification' => 'notification_payment_notification',
            'securityAlerts' => 'notification_security_alerts',
        ]
    ];

    return $keyMappings[$group][$key] ?? $group . '_' . $key;
}

    public function testEmail(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        try {
            Mail::raw('Este es un email de prueba desde RG Entradas', function ($message) use ($validated) {
                $message->to($validated['email'])
                    ->subject('Email de Prueba - RG Entradas');
            });

            return response()->json([
                'message' => 'Email de prueba enviado correctamente',
                'success' => true,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al enviar el email: ' . $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }

    public function backupDatabase()
    {
        try {
            Artisan::call('backup:run');

            return response()->json([
                'message' => 'Backup de base de datos iniciado correctamente',
                'success' => true,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al iniciar el backup: ' . $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }

    private function getGeneralSettings(): array
{
    return [
        'siteName' => Setting::get('site_name', 'RG Entradas'),
        'siteDescription' => Setting::get('site_description', 'La mejor plataforma de venta de tickets'),
        'contactEmail' => Setting::get('contact_email', 'contact@rgentradas.com'),
        'supportEmail' => Setting::get('support_email', 'support@rgentradas.com'),
        'timezone' => Setting::get('timezone', 'America/Argentina/Buenos_Aires'),
        'currency' => Setting::get('currency', 'ARS'),
        'language' => Setting::get('language', 'es'),
    ];
}

private function getEmailSettings(): array
{
    return [
        'smtpHost' => Setting::get('email_smtp_host', 'smtp.gmail.com'),
        'smtpPort' => Setting::get('email_smtp_port', '587'),
        'smtpUsername' => Setting::get('email_smtp_username', ''),
        'smtpPassword' => Setting::get('email_smtp_password', ''),
        'smtpEncryption' => Setting::get('email_smtp_encryption', 'tls'),
        'fromEmail' => Setting::get('email_from_email', 'noreply@rgentradas.com'),
        'fromName' => Setting::get('email_from_name', 'RG Entradas'),
    ];
}

private function getPaymentSettings(): array
{
    return [
        'stripeEnabled' => Setting::get('payment_stripe_enabled', true),
        'stripePublicKey' => Setting::get('payment_stripe_public_key', ''),
        'stripeSecretKey' => Setting::get('payment_stripe_secret_key', ''),
        'mercadopagoEnabled' => Setting::get('payment_mercadopago_enabled', true),
        'mercadopagoAccessToken' => Setting::get('payment_mercadopago_access_token', ''),
        'commissionRate' => Setting::get('payment_commission_rate', '5.0'),
    ];
}

private function getSecuritySettings(): array
{
    return [
        'twoFactorRequired' => Setting::get('security_two_factor_required', false),
        'passwordMinLength' => Setting::get('security_password_min_length', 8),
        'sessionTimeout' => Setting::get('security_session_timeout', 60),
        'maxLoginAttempts' => Setting::get('security_max_login_attempts', 5),
        'ipWhitelistEnabled' => Setting::get('security_ip_whitelist_enabled', false),
        'maintenanceMode' => Setting::get('security_maintenance_mode', false),
    ];
}

private function getNotificationSettings(): array
{
    return [
        'emailNotifications' => Setting::get('notification_email_notifications', true),
        'smsNotifications' => Setting::get('notification_sms_notifications', false),
        'pushNotifications' => Setting::get('notification_push_notifications', true),
        'newUserNotification' => Setting::get('notification_new_user_notification', true),
        'newEventNotification' => Setting::get('notification_new_event_notification', true),
        'paymentNotification' => Setting::get('notification_payment_notification', true),
        'securityAlerts' => Setting::get('notification_security_alerts', true),
    ];
}
}