<?php

namespace App\Services\Interface;

use App\DTO\PaymentContext;
use App\DTO\PaymentResult;

interface PaymentGatewayInterface
{
    public function charge(PaymentContext $context): PaymentResult;
}
