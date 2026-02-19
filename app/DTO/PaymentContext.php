<?php

namespace App\DTO;

class PaymentContext
{
    public function __construct(
        public readonly float $amount,
        public readonly string $currency,
        public readonly string $paymentToken,
        public readonly string $bin,
        public readonly string $siteTransactionId,
        public readonly int $paymentMethodId,
        public readonly int $installments,
        public readonly string $customerEmail,
        public readonly string $customerId,
        public readonly string $customerName,
        public readonly string $customerDocument,
        public readonly string $customerIp,
        public readonly ?string $deviceFingerprint
    ) {}
}
