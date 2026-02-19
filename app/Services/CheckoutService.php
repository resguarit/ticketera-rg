<?php

namespace App\Services;

use App\Services\Interface\PaymentGatewayInterface;
use Illuminate\Support\Facades\Log;
use App\DTO\CheckoutData;
use App\DTO\CheckoutResult;
use App\DTO\PaymentContext;
use App\DTO\PaymentResult;
use App\Models\Cuota;
use App\Models\Event;
use Illuminate\Support\Facades\DB;

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
            Log::info('=== INICIO processOrderPayment ===', [
                'event_id' => $checkoutData->eventId,
                'installments' => $checkoutData->installments,
            ]);

            $event = Event::findOrFail($checkoutData->eventId);
            $eventTax = $event->tax ? ($event->tax / 100) : 0;

            Log::info('Buscando payment method', ['method_name' => $checkoutData->paymentMethod]);

            $paymentMethodId = DB::table('payment_method')
                ->where('name', $checkoutData->paymentMethod)
                ->value('payway_id');

            if (!$paymentMethodId) {
                Log::error('Payment method no encontrado', ['method' => $checkoutData->paymentMethod]);
                throw new \Exception('Método de pago no válido');
            }

            $requestedInstallments = $checkoutData->installments;
            $validInstallments = null;

            if ($requestedInstallments > 1) {
                $validInstallments = Cuota::where('event_id', $checkoutData->eventId)
                    ->where('bin', $checkoutData->bin)
                    ->where('cantidad_cuotas', $requestedInstallments)
                    ->where('habilitada', true)
                    ->first();

                if (!$validInstallments) {

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
                customerName: $checkoutData->billingInfo['firstName'] . ' ' . $checkoutData->billingInfo['lastName'],
                customerDocument: $checkoutData->billingInfo['documentNumber'] ?? '',
                customerIp: request()->ip(),
                deviceFingerprint: $checkoutData->deviceFingerprint,
                billingAddress: $checkoutData->billingInfo['address'] ?? null,
                billingCity: $checkoutData->billingInfo['city'] ?? null,
                billingPostalCode: $checkoutData->billingInfo['postalCode'] ?? null,
                billingState: $checkoutData->billingInfo['state'] ?? 'B', // Default to Buenos Aires (B) if missing or map appropriately
                billingPhone: $checkoutData->billingInfo['phone'] ?? null,
                billingFirstName: $checkoutData->billingInfo['firstName'] ?? null,
                billingLastName: $checkoutData->billingInfo['lastName'] ?? null,
                items: $order->items->map(function ($item) {
                    return [
                        'code' => $item->ticket_type_id,
                        'name' => $item->ticketType->name,
                        'description' => $item->ticketType->description ?? 'Ticket',
                        'quantity' => 1, // Order items are individual tickets usually
                        'unit_price' => $item->unit_price,
                        'total_amount' => $item->total_amount,
                    ];
                })->toArray(),
            );

            Log::info('Llamando al gateway de pagos');
            $paymentResult = $this->paymentGateway->charge($paymentData);
            Log::info('Respuesta del gateway', [
                'success' => $paymentResult->success,
                'error_message' => $paymentResult->errorMessage,
            ]);

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
            Log::error('Error en processOrderPayment', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            throw $e;
        }
    }
}
