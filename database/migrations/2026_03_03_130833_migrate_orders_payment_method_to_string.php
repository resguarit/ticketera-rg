<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Convierte el campo payment_method en la tabla orders de enteros (payway_id)
     * a strings (nombres del enum PaymentMethod).
     *
     * Las órdenes de Box Office (cash, pos, qr) ya tienen strings correctos y
     * no se tocan. Solo se migran las órdenes online que guardaban el payway_id
     * numérico como string.
     */
    public function up(): void
    {
        $mapping = [
            '1'   => 'visa_credito',
            '31'  => 'visa_debito',
            '104' => 'mastercard_credito',
            '105' => 'mastercard_debito',
            '111' => 'amex',
        ];

        foreach ($mapping as $paywayId => $methodName) {
            DB::statement(
                "UPDATE orders SET payment_method = ? WHERE payment_method REGEXP '^[0-9]+$' AND payment_method = ?",
                [$methodName, strval($paywayId)]
            );
        }
    }

    /**
     * Revierte la migración: convierte los strings de vuelta a enteros.
     */
    public function down(): void
    {
        $mapping = [
            'visa_credito'       => '1',
            'visa_debito'        => '31',
            'mastercard_credito' => '104',
            'mastercard_debito'  => '105',
            'amex'               => '111',
        ];

        foreach ($mapping as $methodName => $paywayId) {
            DB::table('orders')
                ->where('payment_method', $methodName)
                ->update(['payment_method' => $paywayId]);
        }
    }
};
