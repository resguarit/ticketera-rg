<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case VISA_CREDITO       = 'visa_credito';
    case VISA_DEBITO        = 'visa_debito';
    case MASTERCARD_CREDITO = 'mastercard_credito';
    case MASTERCARD_DEBITO  = 'mastercard_debito';
    case AMEX               = 'amex';
    case CASH               = 'cash';
    case POS                = 'pos';
    case QR                 = 'qr';

    /**
     * Devuelve el ID de Payway para los métodos de pago online.
     * Retorna null para métodos físicos (cash, pos, qr).
     */
    public function paywayId(): ?int
    {
        return match($this) {
            self::VISA_CREDITO       => 1,
            self::VISA_DEBITO        => 31,
            self::MASTERCARD_CREDITO => 104,
            self::MASTERCARD_DEBITO  => 105,
            self::AMEX               => 111,
            default                  => null,
        };
    }

    /**
     * Indica si este método de pago se procesa a través de Payway.
     */
    public function isPayway(): bool
    {
        return $this->paywayId() !== null;
    }

    /**
     * Devuelve el nombre legible del método de pago.
     */
    public function label(): string
    {
        return match($this) {
            self::VISA_CREDITO       => 'Visa Crédito',
            self::VISA_DEBITO        => 'Visa Débito',
            self::MASTERCARD_CREDITO => 'Mastercard Crédito',
            self::MASTERCARD_DEBITO  => 'Mastercard Débito',
            self::AMEX               => 'American Express',
            self::CASH               => 'Efectivo',
            self::POS                => 'POS',
            self::QR                 => 'QR',
        };
    }
}
