<?php

namespace App\Services;

use App\DTO\PaymentContext;
use App\DTO\PaymentResult;
use App\Models\Order;
use App\Services\Interface\PaymentGatewayInterface;
use Decidir\Connector;
use Decidir\Exception\SdkException;
use Illuminate\Support\Facades\Log;

class PaywayService implements PaymentGatewayInterface
{
    private Connector $connector;

    public function __construct()
    {
        $config = config('services.payway');
        $env = $config['ambient'];
        $keys = $config['keys'][$env];
        $this->connector = new Connector($keys, $env);
    }

    public function charge(PaymentContext $context): PaymentResult
    {
        $paymentData = [
            "site_transaction_id" => $context->siteTransactionId,
            "token" => $context->paymentToken,
            "bin" => $context->bin,
            "amount" => (int) ($context->amount * 100),
            "currency" => $context->currency,
            "installments" => $context->installments,
            "payment_method_id" => $context->paymentMethodId,
            "payment_type" => "single",
            "sub_payments" => [],
            "fraud_detection" => [
                "send_to_cs" => false,
                "channel" => "Web",
                "device_unique_identifier" => "12346"
            ],
            "customer" => [
                "id" => $context->customerId,
                "email" => $context->customerEmail,
            ]
        ];

        try {

            try {
                $response = $this->connector->payment()->ExecutePayment($paymentData);
                $responseData = $response->getData();
            } catch (\Throwable $e) {
                // El SDK puede lanzar excepción por propiedades inexistentes (ej: ticket)
                if ($e instanceof SdkException && strpos($e->getMessage(), 'Property') !== false) {
                    $responseData = $e->getData();
                } else {
                    throw $e; // Re-lanzar si es otro tipo de error
                }
            }



            $result = [
                'success' => true,
                'payment_id' => $responseData['id'] ?? null,
                'status' => $responseData['status'] ?? null,
                'status_details' => $responseData['status_details'] ?? null,
                'amount' => $responseData['amount'] ?? null,
                'currency' => $responseData['currency'] ?? null,
                'card_brand' => $responseData['card_brand'] ?? null,
                'site_transaction_id' => $context->siteTransactionId,
                'installments' => $responseData['installments'] ?? null,
                'fraud_detection' => $responseData['fraud_detection'] ?? null,
                'raw_response' => $responseData
            ];

            if ($responseData['status'] === 'approved') {
                return PaymentResult::success($responseData['id'], $responseData['status'], $responseData);
            } else {
                $reason = $responseData['status_details']['error']['reason']['description'] ?? 'Pago rechazado';
                return PaymentResult::failure($reason, $responseData);
            }
        } catch (SdkException $e) {

            Log::error('PaywayDebug: Payment failed', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'data' => $e->getData()
            ]);

            return PaymentResult::failure($e->getMessage(), $e->getData());
        } catch (\Exception $e) {

            Log::error('PaywayDebug: Payment exception', [
                'message' => $e->getMessage()
            ]);

            return PaymentResult::failure($e->getMessage());
        }
    }
}
