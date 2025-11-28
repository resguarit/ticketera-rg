<?php

namespace App\DTO;

class CheckoutData
{
    public function __construct(
        public readonly int $eventId,
        public readonly int $functionId,
        public readonly string $paymentToken,
        public readonly ?string $bin,
        public readonly array $selected_tickets,
        public readonly string $paymentMethod,
        public readonly int $installments = 1,
        public readonly ?array $billingInfo = null,
    ) {}
}
