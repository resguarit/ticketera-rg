<?php

namespace App\Http\Controllers\Checkout;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Decidir\Connector;
use Illuminate\Support\Facades\Log;
use Decidir\Exception\SdkException;

class PaywayDebugController extends Controller
{
    /**
     * Obtener el connector configurado con las credenciales
     */
    private function getConnector(Request $request)
    {
        $environment = $request->input('environment', 'test'); // 'test' o 'prod'
        
        $keys_data = [
            'public_key' => $environment === 'prod' 
                ? env('PAYWAY_PUBLIC_KEY_PROD', '9960377671874d4fb71d0a8448642730')
                : env('PAYWAY_PUBLIC_KEY', '2GdQYEHoXH5NXn8nbtniE1Jqo0F3fC8y'),
            'private_key' => $environment === 'prod' 
                ? env('PAYWAY_PRIVATE_KEY_PROD')
                : env('PAYWAY_PRIVATE_KEY')
        ];

        Log::info("PaywayDebug: Creating connector for environment: {$environment}", [
            'public_key' => $keys_data['public_key'],
            'private_key_length' => strlen($keys_data['private_key'])
        ]);

        return new Connector($keys_data, $environment);
    }

    /**
     * 1. Test de Health Check - Verifica que las credenciales sean válidas
     */
    public function testHealthCheck(Request $request)
    {
        try {
            $connector = $this->getConnector($request);
            $status = $connector->healthcheck()->getStatus();

            $response = [
                'success' => true,
                'name' => $status->getName(),
                'version' => $status->getVersion(),
                'build_time' => $status->getBuildTime(),
            ];

            Log::info('PaywayDebug: HealthCheck successful', $response);
            return response()->json($response);

        } catch (SdkException $e) {
            Log::error('PaywayDebug: HealthCheck failed', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'data' => $e->getData()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'HealthCheck failed',
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'details' => $e->getData()
            ], 500);
        } catch (\Exception $e) {
            Log::error('PaywayDebug: HealthCheck exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Unexpected error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 2. Test de Tokenización - Crea un token de tarjeta
     */
    public function testTokenization(Request $request)
    {
        $request->validate([
            'card_number' => 'required|string',
            'card_holder_name' => 'required|string',
            'card_expiration_month' => 'required|string',
            'card_expiration_year' => 'required|string',
            'security_code' => 'required|string',
            'card_holder_identification.type' => 'required|string',
            'card_holder_identification.number' => 'required|string',
        ]);

        try {
            $connector = $this->getConnector($request);

            $tokenData = [
                'card_number' => $request->input('card_number'),
                'card_holder_name' => $request->input('card_holder_name'),
                'card_expiration_month' => $request->input('card_expiration_month'),
                'card_expiration_year' => $request->input('card_expiration_year'),
                'security_code' => $request->input('security_code'),
                'card_holder_identification' => [
                    'type' => $request->input('card_holder_identification.type'),
                    'number' => $request->input('card_holder_identification.number')
                ]
            ];

            Log::info('PaywayDebug: Creating token', [
                'card_last_4' => substr($tokenData['card_number'], -4)
            ]);

            try {
                $response = $connector->token()->token($tokenData);
                $responseData = $response->getData();
            } catch (\Throwable $e) {
                // El SDK puede lanzar excepción por propiedades inexistentes
                // pero la respuesta está en getData() de la excepción
                if ($e instanceof SdkException && strpos($e->getMessage(), 'Property') !== false) {
                    $responseData = $e->getData();
                    Log::warning('PaywayDebug: SDK property error, extracting data from exception', [
                        'message' => $e->getMessage()
                    ]);
                } else {
                    throw $e; // Re-lanzar si es otro tipo de error
                }
            }
            
            $result = [
                'success' => true,
                'token' => $responseData['id'] ?? null,
                'bin' => $responseData['bin'] ?? null,
                'last_four_digits' => $responseData['last_four_digits'] ?? null,
                'card_number_length' => $responseData['card_number_length'] ?? null,
                'security_code_length' => $responseData['security_code_length'] ?? null,
                'expiration_month' => $responseData['expiration_month'] ?? null,
                'expiration_year' => $responseData['expiration_year'] ?? null,
                'status' => $responseData['status'] ?? null,
                'date_created' => $responseData['date_created'] ?? null,
                'date_due' => $responseData['date_due'] ?? null,
                'cardholder' => $responseData['cardholder'] ?? null,
                'raw_response' => $responseData
            ];

            Log::info('PaywayDebug: Token created successfully', $result);
            return response()->json($result);

        } catch (SdkException $e) {
            Log::error('PaywayDebug: Tokenization failed', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'data' => $e->getData()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Tokenization failed',
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'details' => $e->getData()
            ], 500);
        } catch (\Throwable $e) {
            // Capturar cualquier otro error, incluyendo errores del SDK
            Log::error('PaywayDebug: Tokenization exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Si el error es por una propiedad inexistente pero tenemos datos, intentar extraerlos
            if (strpos($e->getMessage(), 'Property') !== false || strpos($e->getMessage(), 'not exists') !== false) {
                Log::warning('PaywayDebug: SDK property error, but response may be valid');
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Unexpected error',
                'message' => $e->getMessage(),
                'type' => get_class($e)
            ], 500);
        }
    }

    /**
     * 3. Test de Pago Simple
     */
    public function testPayment(Request $request)
    {
        $request->validate([
            'payment_token' => 'required|string',
            'bin' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'installments' => 'required|integer|min:1',
            'customer_email' => 'required|email',
        ]);

        try {
            $connector = $this->getConnector($request);
            $siteTransactionId = "DEBUG-" . time() . "-" . rand(1000, 9999);

            $paymentData = [
                "site_transaction_id" => $siteTransactionId,
                "token" => $request->input('payment_token'),
                "bin" => $request->input('bin'),
                "amount" => (int) ($request->input('amount') * 100), // Convertir a centavos
                "currency" => "ARS",
                "installments" => (int) $request->input('installments'),
                "payment_method_id" => 1, // Visa por defecto
                "payment_type" => "single",
                "sub_payments" => [], // Campo obligatorio (array vacío si no hay sub-pagos)
                "fraud_detection" => [ // Datos de prevención de fraude
                    "send_to_cs" => false, // No enviar a Cybersource en testing
                    "channel" => "Web",
                    "device_unique_identifier" => "12345"
                ],
                "customer" => [
                    "id" => "DEBUG-CUSTOMER-" . time(),
                    "email" => $request->input('customer_email')
                ]
            ];

            Log::info('PaywayDebug: Processing payment', [
                'site_transaction_id' => $siteTransactionId,
                'amount' => $paymentData['amount'],
                'bin' => $paymentData['bin']
            ]);

            try {
                $response = $connector->payment()->ExecutePayment($paymentData);
                $responseData = $response->getData();
            } catch (\Throwable $e) {
                // El SDK puede lanzar excepción por propiedades inexistentes (ej: ticket)
                if ($e instanceof SdkException && strpos($e->getMessage(), 'Property') !== false) {
                    $responseData = $e->getData();
                    Log::warning('PaywayDebug: SDK property error in payment, extracting data from exception', [
                        'message' => $e->getMessage()
                    ]);
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
                'site_transaction_id' => $siteTransactionId,
                'installments' => $responseData['installments'] ?? null,
                'fraud_detection' => $responseData['fraud_detection'] ?? null,
                'raw_response' => $responseData
            ];

            Log::info('PaywayDebug: Payment processed', $result);
            return response()->json($result);

        } catch (SdkException $e) {
            Log::error('PaywayDebug: Payment failed', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'data' => $e->getData()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Payment failed',
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'details' => $e->getData()
            ], 500);
        } catch (\Exception $e) {
            Log::error('PaywayDebug: Payment exception', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Unexpected error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 4. Consultar información de un pago
     */
    public function testPaymentInfo(Request $request)
    {
        $request->validate([
            'payment_id' => 'required', // Puede ser string o número
        ]);

        try {
            $connector = $this->getConnector($request);
            $paymentId = (string) $request->input('payment_id'); // Convertir a string

            Log::info('PaywayDebug: Getting payment info', ['payment_id' => $paymentId]);

            $response = $connector->payment()->PaymentInfo([], $paymentId);

            // ⚠️ USAR getData() - Los getters del SDK fallan
            $data = $response->getData();

            $result = [
                'success' => true,
                'payment_id' => $data['id'] ?? null,
                'status' => $data['status'] ?? null,
                'status_details' => $data['status_details'] ?? null,
                'amount' => $data['amount'] ?? null,
                'currency' => $data['currency'] ?? null,
                'card_brand' => $data['card_brand'] ?? null,
                'site_transaction_id' => $data['site_transaction_id'] ?? null,
                'installments' => $data['installments'] ?? null,
                'fraud_detection' => $data['fraud_detection'] ?? null,
                'raw_response' => $data
            ];

            Log::info('PaywayDebug: Payment info retrieved', $result);
            return response()->json($result);

        } catch (SdkException $e) {
            // ⚠️ El SDK puede lanzar excepción pero tener los datos
            $errorData = $e->getData();
            
            // Si tiene ID, la consulta fue exitosa
            if (isset($errorData['id'])) {
                Log::info('PaywayDebug: Payment info retrieved (from exception)', ['data' => $errorData]);
                
                return response()->json([
                    'success' => true,
                    'payment_id' => $errorData['id'],
                    'status' => $errorData['status'] ?? null,
                    'status_details' => $errorData['status_details'] ?? null,
                    'amount' => $errorData['amount'] ?? null,
                    'currency' => $errorData['currency'] ?? null,
                    'card_brand' => $errorData['card_brand'] ?? null,
                    'site_transaction_id' => $errorData['site_transaction_id'] ?? null,
                    'installments' => $errorData['installments'] ?? null,
                    'fraud_detection' => $errorData['fraud_detection'] ?? null,
                    'raw_response' => $errorData
                ]);
            }
            
            // Error real
            Log::error('PaywayDebug: Payment info failed', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'data' => $errorData
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Payment info failed',
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'details' => $errorData
            ], 500);
        } catch (\Exception $e) {
            Log::error('PaywayDebug: Payment info exception', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Unexpected error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 5. Test de conexión RAW - Para debuggear la comunicación directa
     */
    public function testRawConnection(Request $request)
    {
        try {
            $environment = $request->input('environment', 'test');
            
            $keys_data = [
                'public_key' => $environment === 'prod' 
                    ? env('PAYWAY_PUBLIC_KEY_PROD', '9960377671874d4fb71d0a8448642730')
                    : env('PAYWAY_PUBLIC_KEY', '2GdQYEHoXH5NXn8nbtniE1Jqo0F3fC8y'),
                'private_key' => $environment === 'prod' 
                    ? env('PAYWAY_PRIVATE_KEY_PROD')
                    : env('PAYWAY_PRIVATE_KEY')
            ];

            $result = [
                'success' => true,
                'environment' => $environment,
                'public_key' => $keys_data['public_key'],
                'private_key_length' => strlen($keys_data['private_key']),
                'private_key_starts_with' => substr($keys_data['private_key'], 0, 4) . '...',
                'env_vars' => [
                    'PAYWAY_PUBLIC_KEY' => env('PAYWAY_PUBLIC_KEY'),
                    'PAYWAY_PRIVATE_KEY' => env('PAYWAY_PRIVATE_KEY') ? 'SET' : 'NOT SET',
                    'PAYWAY_PUBLIC_KEY_PROD' => env('PAYWAY_PUBLIC_KEY_PROD'),
                    'PAYWAY_PRIVATE_KEY_PROD' => env('PAYWAY_PRIVATE_KEY_PROD') ? 'SET' : 'NOT SET',
                ]
            ];

            Log::info('PaywayDebug: Raw connection test', $result);
            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('PaywayDebug: Raw connection exception', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Unexpected error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 6. Listar todos los logs recientes de Payway
     */
    public function getRecentLogs()
    {
        try {
            $logFile = storage_path('logs/laravel.log');
            
            if (!file_exists($logFile)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Log file not found'
                ], 404);
            }

            // Leer las últimas 200 líneas del log
            $lines = [];
            $file = new \SplFileObject($logFile, 'r');
            $file->seek(PHP_INT_MAX);
            $lastLine = $file->key();
            $start = max(0, $lastLine - 200);
            
            $file->seek($start);
            while (!$file->eof()) {
                $line = $file->current();
                if (stripos($line, 'payway') !== false || stripos($line, 'decidir') !== false) {
                    $lines[] = trim($line);
                }
                $file->next();
            }

            return response()->json([
                'success' => true,
                'logs' => $lines,
                'count' => count($lines)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error reading logs',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
