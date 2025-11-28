<?php

namespace App\DTO;

class PaymentResult
{
    public function __construct(
        public readonly bool $success,
        public readonly ?string $transactionId,
        public readonly ?string $status,
        public readonly ?string $errorMessage,
        public readonly ?array $rawResponse = []
    ) {}

    public static function success(string $transactionId, string $status, array $rawResponse): self
    {
        return new self(true, $transactionId, $status, null, $rawResponse);
    }

    public static function failure(string $errorMessage, ?array $rawResponse = []): self
    {
        return new self(false, null, null, $errorMessage, $rawResponse);
    }
}
