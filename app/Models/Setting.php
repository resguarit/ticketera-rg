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
            
            if (!$setting) {
                return $default;
            }

            // Solo desencriptar si el campo está marcado como encriptado Y tiene un valor
            if ($setting->is_encrypted && !empty($setting->value)) {
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
        $setting = self::firstOrCreate(['key' => $key]);
        
        // Solo encriptar si el campo debe estar encriptado Y tiene un valor
        if ($setting->is_encrypted && !empty($value)) {
            $value = Crypt::encryptString($value);
        }

        $setting->update(['value' => $value]);
        
        Cache::forget("setting_{$key}");
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
            if ($setting->is_encrypted && !empty($setting->value)) {
                try {
                    $value = Crypt::decryptString($setting->value);
                } catch (\Exception $e) {
                    $value = $setting->value;
                }
            } else {
                $value = $setting->value;
            }
            
            $key = str_replace($group . '_', '', $setting->key);
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
        return match($type) {
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
        Cache::tags(['settings'])->flush();
    }
}