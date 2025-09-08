<?php
// filepath: app/Services/OrderService.php

namespace App\Services;

use App\Models\Order;
use App\Models\IssuedTicket;
use App\Models\TicketType;
use App\Models\User;
use App\Models\Person;
use App\Enums\OrderStatus;
use App\Enums\IssuedTicketStatus;
use App\Enums\UserRole;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class OrderService
{
    public function createOrder(array $orderData): array
    {
        Log::info('=== INICIANDO CREACIÓN DE ORDEN ===', [
            'orderData' => $orderData,
            'auth_check' => Auth::check(),
            'auth_user_id' => Auth::id()
        ]);

        return DB::transaction(function () use ($orderData) {
            $userId = null;
            $accountCreated = false;
    
            // Si no hay usuario autenticado, crear uno nuevo
            if (!Auth::check()) {
                Log::info('Usuario no autenticado, procesando creación/verificación de usuario');
                
                // Verificar si el usuario ya existe
                $existingUser = User::where('email', $orderData['billing_info']['email'])->first();
                
                if (!$existingUser) {
                    Log::info('Usuario no existe, creando nuevo usuario', ['email' => $orderData['billing_info']['email']]);
                    // Crear nuevo usuario
                    $userId = $this->createUserFromBillingInfo($orderData['billing_info']);
                    $accountCreated = true;
                    Log::info('Usuario creado exitosamente', ['user_id' => $userId, 'account_created' => true]);
                } else {
                    Log::info('Usuario existente encontrado', ['user_id' => $existingUser->id, 'email' => $existingUser->email]);
                    $userId = $existingUser->id;
                    // Si el usuario existe, nos aseguramos de que los datos de la persona estén actualizados si es necesario.
                    $user = User::with('person')->find($userId);
                    if ($user->person) {
                        $user->person->update([
                            'name' => $orderData['billing_info']['firstName'],
                            'last_name' => $orderData['billing_info']['lastName'],
                            'phone' => $orderData['billing_info']['phone'],
                            'dni' => $orderData['billing_info']['documentNumber'],
                        ]);
                        Log::info('Datos de persona actualizados para usuario existente', ['user_id' => $userId]);
                    }
                }
            } else {
                $userId = Auth::id();
                Log::info('Usuario autenticado encontrado', ['user_id' => $userId]);
            }
    
            // Calcular totales
            Log::info('Calculando totales de la orden', [
                'selected_tickets' => $orderData['selected_tickets'],
                'discount' => $orderData['discount'] ?? 0,
                'tax' => $orderData['tax'] ?? 0
            ]);

            $totals = $this->calculateOrderTotals(
                $orderData['selected_tickets'],
                $orderData['discount'] ?? 0,
                $orderData['tax'] ?? 0
            );

            Log::info('Totales calculados', ['totals' => $totals]);

            // Crear la orden principal
            $orderCreateData = [
                'client_id' => $userId,
                'order_date' => now(),
                'status' => OrderStatus::PENDING,
                'payment_method' => $orderData['payment_method'],
                'transaction_id' => null,
                'subtotal' => $totals['subtotal'],
                'discount' => $totals['discount'],
                'tax' => $totals['tax'],
                'service_fee' => $totals['service_fee'],
                'total_amount' => $totals['total_amount'],
                'order_details' => $totals['order_details'],
            ];

            Log::info('Creando orden con datos', ['order_create_data' => $orderCreateData]);

            $order = Order::create($orderCreateData);

            Log::info('Orden creada exitosamente', ['order_id' => $order->id]);
    
            // Crear los tickets individuales y verificar disponibilidad
            Log::info('Iniciando creación de tickets individuales');
            foreach ($orderData['selected_tickets'] as $index => $ticketData) {
                Log::info("Procesando ticket {$index}", ['ticket_data' => $ticketData]);

                $ticketType = TicketType::findOrFail($ticketData['id']);
                Log::info('TicketType encontrado', [
                    'ticket_type_id' => $ticketType->id,
                    'name' => $ticketType->name,
                    'is_bundle' => $ticketType->isBundle(),
                    'bundle_quantity' => $ticketType->bundle_quantity,
                    'quantity' => $ticketType->quantity,
                    'quantity_sold' => $ticketType->quantity_sold
                ]);
    
                // Verificar disponibilidad
                $availableQuantity = $ticketType->quantity - $ticketType->quantity_sold;
                Log::info('Verificando disponibilidad', [
                    'available_quantity' => $availableQuantity,
                    'requested_quantity' => $ticketData['quantity']
                ]);

                if ($availableQuantity < $ticketData['quantity']) {
                    $errorMsg = "No hay suficientes tickets disponibles para {$ticketType->name}. Disponibles: {$availableQuantity}";
                    Log::error('Error de disponibilidad', ['error' => $errorMsg]);
                    throw new \Exception($errorMsg);
                }
    
                // Crear tickets individuales considerando si es un bundle
                Log::info('Creando tickets individuales', [
                    'ticket_type_id' => $ticketType->id,
                    'quantity' => $ticketData['quantity'],
                    'is_bundle' => $ticketType->isBundle()
                ]);

                $this->createTicketsForType($order, $ticketType, $ticketData['quantity'], $userId);
    
                // Actualizar cantidad vendida
                $ticketType->increment('quantity_sold', $ticketData['quantity']);
                Log::info('Cantidad vendida actualizada', [
                    'ticket_type_id' => $ticketType->id,
                    'increment_by' => $ticketData['quantity'],
                    'new_quantity_sold' => $ticketType->fresh()->quantity_sold
                ]);
            }
    
            Log::info('Orden creada exitosamente - FINAL', [
                'order_id' => $order->id,
                'user_id' => $userId,
                'total_amount' => $totals['total_amount'],
                'user_created' => $accountCreated
            ]);
    
            return [
                'order' => $order,
                'account_created' => $accountCreated
            ];
        });
    }

    private function createTicketsForType(Order $order, TicketType $ticketType, int $quantity, int $userId): void
    {
        Log::info('=== CREANDO TICKETS PARA TIPO ===', [
            'order_id' => $order->id,
            'ticket_type_id' => $ticketType->id,
            'ticket_type_name' => $ticketType->name,
            'quantity' => $quantity,
            'user_id' => $userId,
            'is_bundle' => $ticketType->isBundle(),
            'bundle_quantity' => $ticketType->bundle_quantity
        ]);

        if ($ticketType->isBundle()) {
            Log::info('Procesando como bundle');
            // Para bundles, crear múltiples tickets por cada bundle comprado
            for ($i = 0; $i < $quantity; $i++) {
                $bundleReference = Str::uuid()->toString();
                Log::info('Creando bundle ' . ($i + 1) . '/' . $quantity, ['bundle_reference' => $bundleReference]);
                
                // Crear la cantidad de tickets definida en bundle_quantity
                for ($j = 0; $j < $ticketType->bundle_quantity; $j++) {
                    $ticketData = [
                        'order_id' => $order->id,
                        'ticket_type_id' => $ticketType->id,
                        'client_id' => $userId,
                        'bundle_reference' => $bundleReference,
                        'unique_code' => $this->generateUniqueCode($order, $ticketType, $bundleReference . '-' . ($j + 1)),
                        'status' => IssuedTicketStatus::AVAILABLE,
                        'issued_at' => now(),
                    ];

                    $ticketNumber = $j + 1;
                    Log::info("Creando ticket individual {$ticketNumber}/{$ticketType->bundle_quantity} del bundle", $ticketData);

                    $ticket = IssuedTicket::create($ticketData);
                    Log::info('Ticket individual creado', ['ticket_id' => $ticket->id]);
                }
            }
        } else {
            Log::info('Procesando como tickets individuales');
            // Para tickets individuales, crear uno por cada cantidad
            for ($i = 0; $i < $quantity; $i++) {
                $ticketData = [
                    'order_id' => $order->id,
                    'ticket_type_id' => $ticketType->id,
                    'client_id' => $userId,
                    'bundle_reference' => null,
                    'unique_code' => $this->generateUniqueCode($order, $ticketType),
                    'status' => IssuedTicketStatus::AVAILABLE,
                    'issued_at' => now(),
                ];

                Log::info("Creando ticket individual " . ($i + 1) . "/{$quantity}", $ticketData);

                $ticket = IssuedTicket::create($ticketData);
                Log::info('Ticket individual creado', ['ticket_id' => $ticket->id]);
            }
        }
        
        Log::info('=== FIN CREACIÓN TICKETS PARA TIPO ===');
    }

    private function createUserFromBillingInfo(array $billingInfo): int
    {
        // Verificar si ya existe un usuario con ese email
        $existingUser = User::where('email', $billingInfo['email'])->first();
        
        if ($existingUser) {
            // Si el usuario existe, usarlo
            return $existingUser->id;
        }

        // Contraseña por defecto
        $defaultPassword = $billingInfo['documentNumber'] ?? '12345678';
        
        // Crear el registro de persona
        $person = Person::create([
            'name' => $billingInfo['firstName'],
            'last_name' => $billingInfo['lastName'],
            'phone' => $billingInfo['phone'],
            'dni' => $billingInfo['documentNumber'],
        ]);

        // Crear el usuario
        $user = User::create([
            'email' => $billingInfo['email'],
            'password' => Hash::make($defaultPassword),
            'role' => UserRole::CLIENT,
            'person_id' => $person->id,
            'email_verified_at' => now(),
        ]);

        Log::info('Usuario creado automáticamente durante compra', [
            'user_id' => $user->id,
            'email' => $user->email,
            'default_password' => $defaultPassword
        ]);

        return $user->id;
    }

    public function processPayment(Order $order, array $paymentData): bool
    {
        Log::info('=== INICIANDO PROCESAMIENTO DE PAGO ===', [
            'order_id' => $order->id,
            'payment_data' => $paymentData
        ]);

        try {
            $transactionId = 'TXN-' . time() . '-' . rand(1000, 9999);
            Log::info('Transaction ID generado', ['transaction_id' => $transactionId]);
            
            $paymentSuccessful = $this->simulatePaymentProcess($order, $paymentData);
            Log::info('Resultado de simulación de pago', ['payment_successful' => $paymentSuccessful]);
            
            if ($paymentSuccessful) {
                Log::info('Pago exitoso, actualizando orden');
                
                $order->update([
                    'status' => OrderStatus::PAID,
                    'transaction_id' => $transactionId,
                ]);

                $order->items()->update([
                    'status' => IssuedTicketStatus::AVAILABLE
                ]);

                Log::info('Pago procesado exitosamente', [
                    'order_id' => $order->id,
                    'transaction_id' => $transactionId,
                    'new_status' => $order->fresh()->status
                ]);

                return true;
            } else {
                Log::warning('Pago falló, cancelando orden');
                $this->cancelOrder($order);
                return false;
            }

        } catch (\Exception $e) {
            Log::error('Error procesando pago', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->cancelOrder($order);
            return false;
        }
    }

    public function cancelOrder(Order $order): bool
    {
        return DB::transaction(function () use ($order) {
            $order->update(['status' => OrderStatus::CANCELLED]);
            $this->releaseTickets($order);
            $order->items()->update([
                'status' => IssuedTicketStatus::CANCELLED
            ]);

            Log::info('Orden cancelada', ['order_id' => $order->id]);
            return true;
        });
    }

    public function getOrderSummary(Order $order): array
    {
        $order->load(['items.ticketType', 'client.person']);

        $groupedTickets = $order->items
            ->groupBy('ticket_type_id')
            ->map(function ($tickets) {
                $firstTicket = $tickets->first();
                $ticketType = $firstTicket->ticketType;
                
                if ($ticketType->isBundle()) {
                    // Para bundles, contar por bundle_reference
                    $bundleCount = $tickets->whereNotNull('bundle_reference')
                        ->groupBy('bundle_reference')
                        ->count();
                    
                    return [
                        'ticket_type_id' => $firstTicket->ticket_type_id,
                        'ticket_type_name' => $ticketType->name,
                        'quantity' => $bundleCount,
                        'unit_price' => $ticketType->price,
                        'total_price' => $bundleCount * $ticketType->price,
                        'is_bundle' => true,
                        'bundle_quantity' => $ticketType->bundle_quantity,
                    ];
                } else {
                    return [
                        'ticket_type_id' => $firstTicket->ticket_type_id,
                        'ticket_type_name' => $ticketType->name,
                        'quantity' => $tickets->count(),
                        'unit_price' => $ticketType->price,
                        'total_price' => $tickets->count() * $ticketType->price,
                        'is_bundle' => false,
                    ];
                }
            })->values();

        return [
            'order_id' => $order->id,
            'order_number' => $this->generateOrderNumber($order),
            'status' => $order->status,
            'total_amount' => $order->total_amount,
            'order_date' => $order->order_date,
            'client_name' => $order->client->person->first_name . ' ' . $order->client->person->last_name,
            'client_email' => $order->client->email,
            'grouped_tickets' => $groupedTickets,
            'total_tickets' => $order->items->count(),
        ];
    }

    private function simulatePaymentProcess(Order $order, array $paymentData): bool
    {
        // Simular éxito del 95% de las veces (para testing)
        $success = rand(1, 100) <= 95;
        
        // Simular tiempo de procesamiento
        usleep(500000); // 0.5 segundos
        
        return $success;
    }

    private function generateUniqueCode(Order $order, TicketType $ticketType, string $suffix = null): string
    {
        // Generar un código más corto pero único
        $baseCode = 'TK-' . $order->id . '-' . $ticketType->id . '-' . substr(time(), -6) . '-' . rand(100, 999);
        
        if ($suffix) {
            // Para bundles, usar solo los primeros 8 caracteres del UUID + número
            $bundleParts = explode('-', $suffix);
            $shortSuffix = substr($bundleParts[0], 0, 8) . '-' . end($bundleParts);
            return $baseCode . '-' . $shortSuffix;
        }
        
        return $baseCode;
    }

    private function generateOrderNumber(Order $order): string
    {
        return 'TM-' . date('Y') . '-' . str_pad($order->id, 6, '0', STR_PAD_LEFT);
    }

    private function releaseTickets(Order $order): void
    {
        $ticketCounts = $order->items->groupBy('ticket_type_id')->map(function ($tickets) {
            $ticketType = $tickets->first()->ticketType;
            
            if ($ticketType->isBundle()) {
                // Para bundles, contar por bundle_reference
                return $tickets->whereNotNull('bundle_reference')
                    ->groupBy('bundle_reference')
                    ->count();
            } else {
                return $tickets->count();
            }
        });
        
        foreach ($ticketCounts as $ticketTypeId => $count) {
            TicketType::where('id', $ticketTypeId)->decrement('quantity_sold', $count);
        }
    }

    public function calculateOrderTotals(array $selectedTickets, float $discount = 0, float $tax = 0): array
    {
        Log::info('=== CALCULANDO TOTALES DE ORDEN ===', [
            'selected_tickets' => $selectedTickets,
            'discount' => $discount,
            'tax' => $tax
        ]);

        $subtotal = 0;
        $orderDetails = [];
        
        foreach ($selectedTickets as $index => $ticket) {
            Log::info("Procesando ticket {$index} para cálculo", ['ticket' => $ticket]);

            $ticketType = TicketType::find($ticket['id']);
            if ($ticketType) {
                $ticketSubtotal = $ticketType->price * (int)$ticket['quantity'];
                $subtotal += $ticketSubtotal;

                $ticketDetail = [
                    'ticket_type_id' => $ticketType->id,
                    'price' => $ticketType->price,
                    'quantity' => (int)$ticket['quantity'],
                    'subtotal' => $ticketSubtotal,
                    'is_bundle' => $ticketType->isBundle(),
                    'bundle_quantity' => $ticketType->bundle_quantity,
                ];

                $orderDetails[] = $ticketDetail;

                Log::info("Ticket procesado para cálculo", [
                    'ticket_type_id' => $ticketType->id,
                    'price' => $ticketType->price,
                    'quantity' => $ticket['quantity'],
                    'subtotal' => $ticketSubtotal,
                    'is_bundle' => $ticketType->isBundle()
                ]);
            } else {
                Log::error("TicketType no encontrado", ['ticket_id' => $ticket['id']]);
            }
        }
        
        $subtotalAfterDiscount = $subtotal * (1 - $discount);
        $serviceFee = $subtotalAfterDiscount * $tax;
        $totalAmount = $subtotalAfterDiscount + $serviceFee;

        $result = [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax' => $tax,
            'service_fee' => $serviceFee,
            'total_amount' => $totalAmount,
            'order_details' => $orderDetails,
        ];

        Log::info('Totales calculados', $result);
        
        return $result;
    }
}