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
                $settingKey = $validated['group'] === 'general' 
                    ? $key 
                    : $validated['group'] . '_' . $key;

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
            'smtpHost' => Setting::get('smtp_host', 'smtp.gmail.com'),
            'smtpPort' => Setting::get('smtp_port', '587'),
            'smtpUsername' => Setting::get('smtp_username', ''),
            'smtpPassword' => Setting::get('smtp_password', ''),
            'smtpEncryption' => Setting::get('smtp_encryption', 'tls'),
            'fromEmail' => Setting::get('from_email', 'noreply@rgentradas.com'),
            'fromName' => Setting::get('from_name', 'RG Entradas'),
        ];
    }

    private function getPaymentSettings(): array
    {
        return [
            'stripeEnabled' => Setting::get('stripe_enabled', true),
            'stripePublicKey' => Setting::get('stripe_public_key', ''),
            'stripeSecretKey' => Setting::get('stripe_secret_key', ''),
            'mercadopagoEnabled' => Setting::get('mercadopago_enabled', true),
            'mercadopagoAccessToken' => Setting::get('mercadopago_access_token', ''),
            'commissionRate' => Setting::get('commission_rate', '5.0'),
        ];
    }

    private function getSecuritySettings(): array
    {
        return [
            'twoFactorRequired' => Setting::get('two_factor_required', false),
            'passwordMinLength' => Setting::get('password_min_length', 8),
            'sessionTimeout' => Setting::get('session_timeout', 60),
            'maxLoginAttempts' => Setting::get('max_login_attempts', 5),
            'ipWhitelistEnabled' => Setting::get('ip_whitelist_enabled', false),
            'maintenanceMode' => Setting::get('maintenance_mode', false),
        ];
    }

    private function getNotificationSettings(): array
    {
        return [
            'emailNotifications' => Setting::get('email_notifications', true),
            'smsNotifications' => Setting::get('sms_notifications', false),
            'pushNotifications' => Setting::get('push_notifications', true),
            'newUserNotification' => Setting::get('new_user_notification', true),
            'newEventNotification' => Setting::get('new_event_notification', true),
            'paymentNotification' => Setting::get('payment_notification', true),
            'securityAlerts' => Setting::get('security_alerts', true),
        ];
    }
}