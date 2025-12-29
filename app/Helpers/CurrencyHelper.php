<?php

namespace App\Helpers;

class CurrencyHelper
{
    /**
     * Formatea un valor como moneda argentina (equivalente al formatCurrency de TypeScript)
     */
    public static function format(float $amount, bool $showCurrency = true): string
    {
        // Verificar si tiene decimales distintos de 0
        $hasDecimals = $amount != floor($amount);
        
        $decimals = $hasDecimals ? 2 : 0;
        $formatted = number_format($amount, $decimals, ',', '.');
        
        return $showCurrency ? '$' . $formatted . ' ARS' : '$' . $formatted;
    }

    /**
     * Formatea un número entero
     */
    public static function formatNumber(int $number): string
    {
        return number_format($number, 0, ',', '.');
    }
}