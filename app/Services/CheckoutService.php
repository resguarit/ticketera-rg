<?php

namespace App\Services;

use App\DTO\CheckoutData;
use App\DTO\CheckoutResult;
use App\DTO\PaymentContext;
use App\DTO\PaymentResult;
use App\Models\Cuota;
use App\Models\Event;
use App\Services\Interface\PaymentGatewayInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutService
{
    public function __construct(
        private OrderService $orderService,
        private PaymentGatewayInterface $paymentGateway,
        private EmailDispatcherService $emailDispatcher,
        private StageTicketService $stageTicketService,
    ) {}

    public function processOrderPayment(CheckoutData $checkoutData): CheckoutResult
    {
        try {
            $event = Event::findOrFail($checkoutData->eventId);
            $eventTax = $event->tax ? ($event->tax / 100) : 0;
            $paymentMethodId = DB::table('payment_method')
                ->where('name', $checkoutData->paymentMethod)
                ->value('payway_id');

            $requestedInstallments = $checkoutData->installments;
            $validInstallments = null;

            if ($requestedInstallments > 1) {
                $validInstallments = Cuota::where('event_id', $checkoutData->eventId)
                    ->where('bin', $checkoutData->bin)
                    ->where('cantidad_cuotas', $requestedInstallments)
                    ->where('habilitada', true)
                    ->first();

                if (! $validInstallments) {
                    Log::warning('Cuotas no válidas o no habilitadas', [
                        'event_id' => $checkoutData->eventId,
                        'bin' => $checkoutData->bin,
                        'requested_installments' => $requestedInstallments,
                    ]);

                    return new CheckoutResult(
                        success: false,
                        order: null,
                        paymentResult: PaymentResult::failure('Cuotas no válidas o no habilitadas.'),
                        message: 'Cuotas no válidas o no habilitadas.'
                    );
                }
            }

            $orderData = [
                'event_id' => $checkoutData->eventId,
                'function_id' => $checkoutData->functionId,
                'selected_tickets' => $checkoutData->selected_tickets,
                'payment_method' => $paymentMethodId,
                'cuotas' => $requestedInstallments,
                'cuota_id' => $validInstallments ? $validInstallments->id : null,
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
                installments: $requestedInstallments,
                customerEmail: $order->client->email,
                customerId: $order->client->id,
                customerName: $checkoutData->billingInfo['firstName'].' '.$checkoutData->billingInfo['lastName'],
                customerDocument: $checkoutData->billingInfo['documentNumber'] ?? '',
                customerIp: request()->ip(),
                deviceFingerprint: null,
            );

            $paymentResult = $this->paymentGateway->charge($paymentData);

            $this->orderService->finalizeOrderPayment($order, $paymentResult, $orderResult['processed_ticket_types']);

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
