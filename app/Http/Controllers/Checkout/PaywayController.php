<?php

namespace App\Http\Controllers\Checkout;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use Decidir\Connector;
use Illuminate\Support\Facades\Log;
use Decidir\Exception\SdkException;

class PaywayController extends Controller
{
    public function paywayProcess(Request $request)
    {
        $request->validate([
            'payment_token' => 'required|string',
            'bin' => 'required|string'
        ]);
        $keys_data = [
            'public_key' => env('PAYWAY_PUBLIC_KEY'),
            'private_key' => env('PAYWAY_PRIVATE_KEY')
        ];
        Log::info('Using Payway keys: ' . json_encode($keys_data));
        $connector = new Connector($keys_data, 'test');
        $id = rand(1, 1000000);
        $usuario = User::find(1);
        $paymentData = [
            "site_transaction_id" => "ORDEN-" . $id,
            "token" => $request->input('payment_token'),
            "bin" => $request->input('bin'),
            "amount" => (int) (100 * 100),
            "currency" => "ARS",
            "installments" => 1,
            "payment_method_id" => 1, // Esto debería ser dinámico según el BIN, pero 1 (Visa) es un buen default.
            "payment_type" => "single",
            "sub_payments" => [], // Campo obligatorio
            "fraud_detection" => [
                "send_to_cs" => false,
                "channel" => "Web",
                "device_unique_identifier" => "fingerprint-" . time()
            ],
            "customer" => [
                "id" => (string) $usuario->id,
                "email" => $usuario->email
            ]
        ];
        Log::info('Processing Payway payment with data: ' . json_encode($paymentData));
        try {
            $response = $connector->payment()->ExecutePayment($paymentData);

            // Si llegamos aquí, la llamada a la API no devolvió un error inicial.
            // Ahora podemos verificar el estado del pago.
            Log::info('Payway response received: ', $response->getData());

            if ($response->getStatus() === 'approved') {
                $responseData = [
                    'gateway_id' => $response->getId(),
                    'status' => $response->getStatus(),
                    'amount' => $response->getAmount(),
                    'status_details' => $response->getStatusDetails(),
                ];
                Log::info('Payment approved: ' . json_encode($responseData));
                return response()->json($responseData);
            } else {
                Log::warning('Payment not approved: ', $response->getData());
                return response()->json([
                    'error' => 'Payment not approved',
                    'status' => $response->getStatus(),
                    'status_details' => $response->getStatusDetails(),
                ], 400);
            }

        } catch (SdkException $e) {
            Log::error('Payway SDK Exception: ' . $e->getMessage(), ['code' => $e->getCode(), 'data' => $e->getData()]);
            return response()->json(['error' => 'Payment processing error', 'message' => $e->getMessage(), 'details' => $e->getData()], 500);
        }
    }

    public function CheckStatus()
    {   
        $keys_data = [
            'public_key' => env('PAYWAY_PUBLIC_KEY'),
            'private_key' => env('PAYWAY_PRIVATE_KEY')
        ];
        $connector = new Connector($keys_data, 'test');
        $status = $connector->healthcheck()->getStatus();

        $response = [
            'name' => $status->getName(),
            'version' => $status->getVersion(),
            'build_time' => $status->getBuildTime(),    
        ];

        return response()->json($response);
    }
}
