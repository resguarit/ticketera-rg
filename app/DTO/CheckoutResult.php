<?php

namespace App\DTO;

use App\Models\Order;

class CheckoutResult
{
    public function __construct(
        public readonly bool $success,
        public readonly ?Order $order,
        public readonly PaymentResult $paymentResult,
        public readonly ?string $message = null,
    ) {}
}
