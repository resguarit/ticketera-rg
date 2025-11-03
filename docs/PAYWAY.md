# 💳 Integración Payway - Guía Definitiva

**Estado:** ✅ **FUNCIONANDO** - Último pago aprobado: 7 Oct 2025  
**Tiempo de lectura:** 15 minutos

---

## 📋 Índice

1. [Qué Funciona y Qué No](#qué-funciona-y-qué-no)
2. [Configuración Inicial](#configuración-inicial)
3. [Implementación Completa](#implementación-completa)
4. [Campos Obligatorios](#campos-obligatorios)
5. [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)
6. [Herramienta de Testing](#herramienta-de-testing)

---

## ✅ Qué Funciona y Qué No

### ✅ FUNCIONA
- **Tokenización de tarjetas** (Visa, Mastercard, Amex)
- **Procesamiento de pagos** (aprobados en Sandbox)
- **Consulta de estado de pagos**
- **Pagos en cuotas**
- **Sandbox (ambiente de pruebas)**

### ❌ NO FUNCIONA / TIENE PROBLEMAS
- **SDK de Decidir2** - Tiene bugs, hay que usar workarounds
- **Algunos getters del SDK** - Lanzan excepciones aunque la operación sea exitosa
- **Documentación oficial** - Campos obligatorios no documentados

### ⚠️ IMPORTANTE SABER
- El campo `card_holder_identification` (DNI) es **OBLIGATORIO** aunque la doc no lo diga
- El campo `sub_payments` es **OBLIGATORIO** (puede ser array vacío)
- El campo `fraud_detection` es **OBLIGATORIO** (Payway rechaza sin él)
- El SDK lanza excepciones por propiedades faltantes aunque el pago haya sido exitoso

---

## 🔧 Configuración Inicial

### 1. Variables de Entorno (.env)

```env
# SANDBOX (Pruebas)
PAYWAY_TEST_PUBLIC_KEY=2GdQYEHoXH5NXn8nbtniE1Jqo0FXXXXX
PAYWAY_TEST_PRIVATE_KEY=2VEB1VlR6Segjj1I0tlQzBLvWIxXXXXX
PAYWAY_TEST_SITE_ID=93012XXX

# PRODUCCIÓN
PAYWAY_PROD_PUBLIC_KEY=9960377671874d4fb71d0a84486XXXXX
PAYWAY_PROD_PRIVATE_KEY=d015f95e3c06401da2042d91f9eXXXXX
PAYWAY_PROD_SITE_ID=93008XXX
```

### 2. Configuración en config/services.php

```php
'payway' => [
    'test_public_key' => env('PAYWAY_TEST_PUBLIC_KEY'),
    'test_private_key' => env('PAYWAY_TEST_PRIVATE_KEY'),
    'test_site_id' => env('PAYWAY_TEST_SITE_ID'),
    'prod_public_key' => env('PAYWAY_PROD_PUBLIC_KEY'),
    'prod_private_key' => env('PAYWAY_PROD_PRIVATE_KEY'),
    'prod_site_id' => env('PAYWAY_PROD_SITE_ID'),
],
```

### 3. Limpiar Caché

```bash
php artisan config:clear
```

---

## 💻 Implementación Completa

### Controlador Backend

```php
<?php

namespace App\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Decidir\Connector;
use Decidir\Exception\SdkException;

class PaywayController extends Controller
{
    /**
     * Obtener conector según ambiente
     */
    private function getConnector($environment = 'test')
    {
        if ($environment === 'prod') {
            $publicKey = config('services.payway.prod_public_key');
            $privateKey = config('services.payway.prod_private_key');
        } else {
            $publicKey = config('services.payway.test_public_key');
            $privateKey = config('services.payway.test_private_key');
        }

        return new Connector([
            'public_key' => $publicKey,
            'private_key' => $privateKey
        ], $environment);
    }

    /**
     * PASO 1: Tokenizar tarjeta
     */
    public function tokenizeCard(Request $request)
    {
        $request->validate([
            'card_number' => 'required|string',
            'card_holder_name' => 'required|string',
            'card_expiration_month' => 'required|string',
            'card_expiration_year' => 'required|string',
            'security_code' => 'required|string',
            'card_holder_dni' => 'required|string', // ⚠️ OBLIGATORIO
        ]);

        try {
            $connector = $this->getConnector($request->input('environment', 'test'));

            $tokenData = [
                "card_number" => $request->input('card_number'),
                "card_expiration_month" => $request->input('card_expiration_month'),
                "card_expiration_year" => $request->input('card_expiration_year'),
                "security_code" => $request->input('security_code'),
                "card_holder_name" => strtoupper($request->input('card_holder_name')),
                "card_holder_identification" => [ // ⚠️ OBLIGATORIO
                    "type" => "dni",
                    "number" => $request->input('card_holder_dni')
                ]
            ];

            $response = $connector->token()->create($tokenData);
            
            // ⚠️ USAR getData() SIEMPRE - Los getters del SDK fallan
            $data = $response->getData();

            return response()->json([
                'success' => true,
                'token' => $data['id'],
                'bin' => $data['bin'],
                'last_four_digits' => $data['last_four_digits']
            ]);

        } catch (SdkException $e) {
            // ⚠️ A veces el token se crea pero el SDK lanza excepción
            try {
                $errorData = $e->getData();
                if (isset($errorData['id'])) {
                    return response()->json([
                        'success' => true,
                        'token' => $errorData['id'],
                        'bin' => $errorData['bin'],
                        'last_four_digits' => $errorData['last_four_digits']
                    ]);
                }
            } catch (\Exception $inner) {
                // Ignorar
            }

            Log::error('Payway Tokenization Failed', [
                'message' => $e->getMessage(),
                'data' => $e->getData()
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * PASO 2: Procesar pago
     */
    public function processPayment(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'bin' => 'required|string',
            'amount' => 'required|numeric',
            'customer_email' => 'required|email',
            'order_id' => 'required|string',
        ]);

        try {
            $connector = $this->getConnector($request->input('environment', 'test'));

            $amount = (int) ($request->input('amount') * 100); // Convertir a centavos

            $paymentData = [
                "site_transaction_id" => $request->input('order_id'),
                "token" => $request->input('token'),
                "bin" => $request->input('bin'),
                "amount" => $amount,
                "currency" => "ARS",
                "installments" => (int) $request->input('installments', 1),
                "payment_method_id" => 1,
                "payment_type" => "single",
                "sub_payments" => [], // ⚠️ OBLIGATORIO (array vacío)
                "fraud_detection" => [ // ⚠️ OBLIGATORIO
                    "send_to_cs" => false,
                    "channel" => "Web",
                    "device_unique_identifier" => "fingerprint-" . time()
                ],
                "customer" => [
                    "id" => "CUSTOMER-" . time(),
                    "email" => $request->input('customer_email')
                ]
            ];

            // ⚠️ ExecutePayment puede lanzar excepción aunque funcione
            try {
                $response = $connector->payment()->ExecutePayment($paymentData);
                $responseData = $response->getData();
            } catch (SdkException $sdkEx) {
                $responseData = $sdkEx->getData();
                
                // Si no hay ID, es error real
                if (!isset($responseData['id'])) {
                    throw $sdkEx;
                }
            }

            $paymentId = $responseData['id'];
            $status = $responseData['status'];

            Log::info('Payway Payment Processed', [
                'payment_id' => $paymentId,
                'status' => $status
            ]);

            return response()->json([
                'success' => true,
                'payment_id' => $paymentId,
                'status' => $status,
                'status_details' => $responseData['status_details'] ?? null,
                'approved' => $status === 'approved',
                'raw_response' => $responseData
            ]);

        } catch (SdkException $e) {
            Log::error('Payway Payment Failed', [
                'message' => $e->getMessage(),
                'data' => $e->getData()
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'details' => $e->getData()
            ], 400);
        }
    }

    /**
     * PASO 3: Consultar estado del pago
     */
    public function getPaymentInfo($paymentId, $environment = 'test')
    {
        try {
            $connector = $this->getConnector($environment);
            
            $response = $connector->payment()->PaymentInfo([], (string) $paymentId);
            $data = $response->getData();

            return response()->json([
                'success' => true,
                'payment_id' => $data['id'],
                'status' => $data['status'],
                'status_details' => $data['status_details'] ?? null,
                'amount' => $data['amount'],
                'approved' => $data['status'] === 'approved',
                'raw_response' => $data
            ]);

        } catch (SdkException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
```

---

## 📋 Campos Obligatorios

### Para TOKENIZACIÓN

| Campo | Tipo | Obligatorio | Ejemplo |
|-------|------|-------------|---------|
| `card_number` | string | ✅ | "4507990000004905" |
| `card_holder_name` | string | ✅ | "JUAN PEREZ" |
| `card_expiration_month` | string | ✅ | "12" |
| `card_expiration_year` | string | ✅ | "25" |
| `security_code` | string | ✅ | "123" |
| `card_holder_identification` | object | ✅ | Ver abajo |

**card_holder_identification:**
```php
[
    "type" => "dni",      // dni, cuil, cuit, passport
    "number" => "12345678"
]
```

### Para PAGO

| Campo | Tipo | Obligatorio | Ejemplo |
|-------|------|-------------|---------|
| `site_transaction_id` | string | ✅ | "ORDER-123456" |
| `token` | string | ✅ | Token de tokenización |
| `bin` | string | ✅ | "450799" |
| `amount` | integer | ✅ | 10000 (en centavos) |
| `currency` | string | ✅ | "ARS" |
| `installments` | integer | ✅ | 1 |
| `payment_method_id` | integer | ✅ | 1 |
| `payment_type` | string | ✅ | "single" |
| `sub_payments` | array | ✅ | [] (vacío) |
| `fraud_detection` | object | ✅ | Ver abajo |
| `customer` | object | ✅ | Ver abajo |

**fraud_detection:**
```php
[
    "send_to_cs" => false,  // false para testing
    "channel" => "Web",
    "device_unique_identifier" => "fingerprint-123"
]
```

**customer:**
```php
[
    "id" => "CUSTOMER-123",
    "email" => "cliente@ejemplo.com"
]
```

---

## 🐛 Errores Comunes y Soluciones

### 1. "card_holder_identification is required"

**Causa:** Falta el DNI del titular  
**Solución:**
```php
"card_holder_identification" => [
    "type" => "dni",
    "number" => "12345678"
]
```

### 2. "sub_payments is required"

**Causa:** Falta el array de sub_payments  
**Solución:**
```php
"sub_payments" => []  // Array vacío
```

### 3. "Fraud Detection Data is required"

**Causa:** Falta fraud_detection  
**Solución:**
```php
"fraud_detection" => [
    "send_to_cs" => false,
    "channel" => "Web",
    "device_unique_identifier" => "fingerprint-123"
]
```

### 4. "Property cardType not exists"

**Causa:** Bug del SDK - Los getters fallan  
**Solución:**
```php
// ❌ NO HACER
$cardType = $response->getCardType();

// ✅ HACER
$data = $response->getData();
$cardType = $data['card_type'];
```

### 5. "Invalid Credential"

**Causa:** Credenciales mal configuradas  
**Solución:**
1. Verificar `.env` tiene las keys correctas
2. Ejecutar `php artisan config:clear`
3. Verificar que estás usando el ambiente correcto (test/prod)

### 6. Pago rechazado con "decision: black"

**Causa:** Falta fraud_detection o datos incorrectos  
**Solución:** Agregar fraud_detection completo (ver arriba)

---

## 🧪 Herramienta de Testing

### Acceder
```
http://localhost/payway-debug
```

### Tests Disponibles

1. **Test 0: RAW Connection** - Verifica credenciales en .env
2. **Test 1: Health Check** - Verifica conectividad con Payway
3. **Test 2: Tokenización** - Crea token de tarjeta
4. **Test 3: Pago** - Procesa un pago de prueba
5. **Test 4: Consulta** - Obtiene info de un pago
6. **Test 5: Logs** - Muestra logs recientes

### Tarjetas de Prueba (Sandbox)

| Marca | Número | CVV | Vencimiento |
|-------|--------|-----|-------------|
| Visa | 4507990000004905 | 123 | 12/25 |
| Mastercard | 5299910010000015 | 123 | 12/25 |
| Amex | 373953192351004 | 1234 | 12/25 |

---

## 📊 Estados de Pago

### Estados Posibles

| Status | Significado | Qué Hacer |
|--------|-------------|-----------|
| `approved` | ✅ Aprobado | Confirmar orden |
| `rejected` | ❌ Rechazado | Mostrar error al usuario |
| `pending` | ⏳ Pendiente | Esperar confirmación |
| `cancelled` | 🚫 Cancelado | Reintentar o cancelar orden |

### Verificar Estado

```php
$response = $this->getPaymentInfo($paymentId);

if ($response['status'] === 'approved') {
    // ✅ Pago aprobado
    // Confirmar orden, enviar tickets, etc.
} else {
    // ❌ Pago no aprobado
    // Mostrar error o pedir reintentar
}
```

### Status Details

```php
$statusDetails = $response['status_details'];

// Para pagos aprobados:
$authCode = $statusDetails['card_authorization_code']; // Código de autorización
$ticket = $statusDetails['ticket']; // Número de ticket

// Para pagos rechazados:
$error = $statusDetails['error']['reason']['description']; // Motivo del rechazo
```

---

## 🎯 Flujo Completo de Implementación

### 1. Frontend (React/TypeScript ejemplo)

```typescript
const handlePayment = async (cardData, amount, orderId) => {
    try {
        // Paso 1: Tokenizar
        const tokenRes = await axios.post('/payway/tokenize', {
            card_number: cardData.number,
            card_holder_name: cardData.name,
            card_expiration_month: cardData.expMonth,
            card_expiration_year: cardData.expYear,
            security_code: cardData.cvv,
            card_holder_dni: cardData.dni,
            environment: 'test'
        });

        if (!tokenRes.data.success) {
            throw new Error('Tokenización falló');
        }

        const { token, bin } = tokenRes.data;

        // Paso 2: Procesar pago
        const paymentRes = await axios.post('/payway/process', {
            token,
            bin,
            amount,
            order_id: orderId,
            customer_email: customerEmail,
            installments: 1,
            environment: 'test'
        });

        if (!paymentRes.data.success) {
            throw new Error('Pago falló');
        }

        // Paso 3: Verificar estado
        if (paymentRes.data.status === 'approved') {
            // ✅ Pago aprobado
            window.location.href = `/checkout/success?payment_id=${paymentRes.data.payment_id}`;
        } else {
            // ❌ Pago rechazado
            alert('Pago rechazado: ' + paymentRes.data.status_details?.error?.reason?.description);
        }

    } catch (error) {
        console.error('Error en pago:', error);
        alert('Error procesando el pago');
    }
};
```

### 2. Rutas (routes/checkout.php)

```php
Route::prefix('payway')->name('payway.')->group(function () {
    Route::post('/tokenize', [PaywayController::class, 'tokenizeCard'])->name('tokenize');
    Route::post('/process', [PaywayController::class, 'processPayment'])->name('process');
    Route::get('/payment/{id}', [PaywayController::class, 'getPaymentInfo'])->name('payment-info');
});
```

---

## ⚠️ WORKAROUNDS DEL SDK

### Problema: Getters lanzan excepciones

```php
// ❌ ESTO FALLA
$cardType = $response->getCardType();

// ✅ ESTO FUNCIONA
$data = $response->getData();
$cardType = $data['card_type'] ?? null;
```

### Problema: ExecutePayment lanza excepción aunque funcione

```php
try {
    $response = $connector->payment()->ExecutePayment($data);
    $responseData = $response->getData();
} catch (SdkException $e) {
    // Puede contener datos exitosos
    $responseData = $e->getData();
    
    if (!isset($responseData['id'])) {
        throw $e; // Error real
    }
    // Continuar - la operación fue exitosa
}
```

---

## 🚀 Checklist Antes de Producción

- [ ] Credenciales de producción en `.env`
- [ ] Cambiar `environment` de 'test' a 'prod'
- [ ] `fraud_detection.send_to_cs` en `true`
- [ ] Implementar device fingerprinting real
- [ ] Agregar datos completos de `bill_to` y `ship_to` en fraud_detection
- [ ] Testing exhaustivo en Sandbox
- [ ] Manejo de errores completo
- [ ] Logging de todas las transacciones
- [ ] Webhook de notificaciones (opcional)

---

## 💡 Tips Finales

1. **Siempre usar `getData()`** en lugar de getters del SDK
2. **Loggear todo** - Los logs te salvan cuando el SDK falla
3. **Sandbox primero** - No tocar producción hasta estar seguro
4. **fraud_detection es obligatorio** - Sin él, todos los pagos se rechazan
5. **DNI es obligatorio** - Aunque la doc no lo diga
6. **Try-catch en ExecutePayment** - Puede lanzar excepción aunque funcione
7. **Convertir montos a centavos** - 100 pesos = 10000 centavos

---

## 📞 Recursos

- **Herramienta de testing:** `http://localhost/payway-debug`
- **Documentación oficial:** https://developers.decidir.com/
- **Controlador de ejemplo:** `app/Http/Controllers/Checkout/PaywayDebugController.php`

---

**Última actualización:** 7 de Octubre, 2025  
**Estado:** ✅ Funcionando - Payment ID 15078625 aprobado  
**Ambiente:** Sandbox (Pruebas)
