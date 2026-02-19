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
        public readonly ?string $deviceFingerprint,
        public readonly ?string $billingAddress = null,
        public readonly ?string $billingCity = null,
        public readonly ?string $billingPostalCode = null,
        public readonly ?string $billingState = null,
        public readonly ?string $billingPhone = null,
        public readonly ?string $billingFirstName = null,
        public readonly ?string $billingLastName = null,
        public readonly ?array $items = [],
    ) {}
}
