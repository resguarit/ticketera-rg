<?php

namespace App\Services;

use App\Services\Interface\PaymentGatewayInterface;
use Illuminate\Support\Facades\Log;
use App\DTO\CheckoutData;
use App\DTO\CheckoutResult;
use App\DTO\PaymentContext;
use App\DTO\PaymentResult;
use App\Models\Event;
use Illuminate\Support\Facades\DB;

class CheckoutService
{
    public function __construct(
        private OrderService $orderService,
        private PaymentGatewayInterface $paymentGateway,
        private EmailDispatcherService $emailDispatcher,
    ) {}

    public function processOrderPayment(CheckoutData $checkoutData): CheckoutResult
    {
        try {
            $event = Event::findOrFail($checkoutData->eventId);
            $eventTax = $event->tax ? ($event->tax / 100) : 0;
            $paymentMethodId = DB::table('payment_method')
                ->where('name', $checkoutData->paymentMethod)
                ->value('payway_id');

            $orderData = [
                    'event_id' => $checkoutData->eventId,
                    'function_id' => $checkoutData->functionId,
                    'selected_tickets' => $checkoutData->selected_tickets,
                    'payment_method' => $paymentMethodId,
                    'billing_info' => $checkoutData->billingInfo,
                    'tax' => $eventTax,
                ];

            $orderResult = $this->orderService->createOrder($orderData);
            $order = $orderResult['order'];

            
            $paymentData = new PaymentContext(
                amount: $order->total_amount,
                currency: 'ARS',
                paymentToken: $checkoutData->paymentToken,
                bin: $checkoutData->bin,
                siteTransactionId: $order->transaction_id,
                paymentMethodId: $paymentMethodId,
                installments: 1,
                customerEmail: $order->client->email,
                customerId: $order->client->id,
                customerName: $checkoutData->billingInfo['firstName'] . ' ' . $checkoutData->billingInfo['lastName'],
                customerDocument: $checkoutData->billingInfo['documentNumber'] ?? '',
                customerIp: request()->ip(),
                deviceFingerprint: null,
            );

            $paymentResult = $this->paymentGateway->charge($paymentData);

            $this->orderService->finalizeOrderPayment($order, $paymentResult);

            if ($paymentResult->success) {
                $this->emailDispatcher->sendTicketPurchaseConfirmation($order);
            }

            return new CheckoutResult(
                success: $paymentResult->success,
                order: $order,
                paymentResult: $paymentResult
            );

        } catch (\Exception $e) {
            throw $e;
        }
    }
}