<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
        'description',
        'is_encrypted',
    ];

    protected $casts = [
        'is_encrypted' => 'boolean',
    ];

    /**
     * Obtener un valor de configuración
     */
    public static function get(string $key, $default = null)
    {
        $cacheKey = "setting_{$key}";

        return Cache::remember($cacheKey, 3600, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();

            if (! $setting) {
                return $default;
            }

            // Solo desencriptar si el campo está marcado como encriptado Y tiene un valor
            if ($setting->is_encrypted && ! empty($setting->value)) {
                try {
                    $value = Crypt::decryptString($setting->value);
                } catch (\Exception $e) {
                    // Si falla la desencriptación, retornar el valor sin encriptar
                    $value = $setting->value;
                }
            } else {
                $value = $setting->value;
            }

            return self::castValue($value, $setting->type);
        });
    }

    /**
     * Establecer un valor de configuración
     */
    public static function set(string $key, $value): void
    {
        $setting = self::where('key', $key)->first();

        if (! $setting) {
            // Si no existe, crear con valores por defecto
            $setting = self::create([
                'key' => $key,
                'value' => $value,
                'group' => self::getGroupFromKey($key),
                'type' => self::getTypeFromValue($value),
                'is_encrypted' => false,
            ]);
        } else {
            // Si existe, actualizar el valor
            $valueToSave = $value;

            // Solo encriptar si el campo está marcado como encriptado Y tiene un valor
            if ($setting->is_encrypted && ! empty($value)) {
                $valueToSave = Crypt::encryptString($value);
            }

            $setting->update(['value' => $valueToSave]);
        }

        Cache::forget("setting_{$key}");
    }

    /**
     * Obtener el grupo desde la clave
     */
    private static function getGroupFromKey(string $key): string
    {
        $parts = explode('_', $key);

        // Si la clave tiene guiones bajos, el primer segmento podría ser el grupo
        $possibleGroups = ['email', 'payment', 'security', 'notification', 'general'];

        if (in_array($parts[0], $possibleGroups)) {
            return $parts[0];
        }

        return 'general';
    }

    /**
     * Determinar el tipo desde el valor
     */
    private static function getTypeFromValue($value): string
    {
        if (is_bool($value)) {
            return 'boolean';
        }

        if (is_int($value)) {
            return 'integer';
        }

        if (is_float($value)) {
            return 'float';
        }

        if (is_array($value)) {
            return 'json';
        }

        return 'string';
    }

    /**
     * Obtener todas las configuraciones de un grupo
     */
    public static function getGroup(string $group): array
    {
        $settings = self::where('group', $group)->get();

        $result = [];
        foreach ($settings as $setting) {
            // Solo desencriptar si el campo está marcado como encriptado Y tiene un valor
            if ($setting->is_encrypted && ! empty($setting->value)) {
                try {
                    $value = Crypt::decryptString($setting->value);
                } catch (\Exception $e) {
                    $value = $setting->value;
                }
            } else {
                $value = $setting->value;
            }

            $key = str_replace($group.'_', '', $setting->key);
            $result[$key] = self::castValue($value, $setting->type);
        }

        return $result;
    }

    /**
     * Actualizar múltiples configuraciones
     */
    public static function setMany(array $settings): void
    {
        foreach ($settings as $key => $value) {
            self::set($key, $value);
        }
    }

    /**
     * Convertir valor según su tipo
     */
    private static function castValue($value, string $type)
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Limpiar toda la caché de configuraciones
     */
    public static function clearCache(): void
    {
        // Obtener todas las configuraciones y limpiar su caché individual
        $settings = self::all();
        foreach ($settings as $setting) {
            Cache::forget("setting_{$setting->key}");
        }

        // También limpiar algunas claves comunes de grupos
        Cache::forget('settings_general');
        Cache::forget('settings_email');
        Cache::forget('settings_payment');
        Cache::forget('settings_security');
        Cache::forget('settings_notification');
    }
}
