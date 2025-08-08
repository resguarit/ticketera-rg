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

class OrderService
{
    public function createOrder(array $orderData): Order
    {
        return DB::transaction(function () use ($orderData) {
            $userId = null;

            // Si no hay usuario autenticado, crear uno nuevo
            if (!Auth::check()) {
                $userId = $this->createUserFromBillingInfo($orderData['billing_info']);
                
                // Autenticar automáticamente al usuario recién creado
                Auth::loginUsingId($userId);
            } else {
                $userId = Auth::id();
            }

            // Crear la orden principal
            $order = Order::create([
                'client_id' => $userId,
                'order_date' => now(),
                'total_amount' => $orderData['total_amount'],
                'status' => OrderStatus::PENDING,
                'payment_method' => $orderData['payment_method'],
                'transaction_id' => null,
            ]);

            // Crear los tickets individuales y verificar disponibilidad
            foreach ($orderData['selected_tickets'] as $ticketData) {
                $ticketType = TicketType::findOrFail($ticketData['id']);

                // Verificar disponibilidad
                $availableQuantity = $ticketType->quantity - $ticketType->quantity_sold;
                if ($availableQuantity < $ticketData['quantity']) {
                    throw new \Exception("No hay suficientes tickets disponibles para {$ticketType->name}. Disponibles: {$availableQuantity}");
                }

                // Crear tickets individuales
                for ($i = 0; $i < $ticketData['quantity']; $i++) {
                    IssuedTicket::create([
                        'order_id' => $order->id,
                        'ticket_type_id' => $ticketType->id,
                        'client_id' => $userId,
                        'unique_code' => $this->generateUniqueCode($order, $ticketType),
                        'status' => IssuedTicketStatus::AVAILABLE,
                        'issued_at' => now(),
                    ]);
                }

                // Actualizar cantidad vendida
                $ticketType->increment('quantity_sold', $ticketData['quantity']);
            }

            Log::info('Orden creada exitosamente', [
                'order_id' => $order->id,
                'user_id' => $userId,
                'total_amount' => $orderData['total_amount'],
                'user_created' => !Auth::check()
            ]);

            return $order;
        });
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
        $defaultPassword = '12345678';
        
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
        try {
            $transactionId = 'TXN-' . time() . '-' . rand(1000, 9999);
            
            $paymentSuccessful = $this->simulatePaymentProcess($order, $paymentData);
            
            if ($paymentSuccessful) {
                $order->update([
                    'status' => OrderStatus::PAID,
                    'transaction_id' => $transactionId,
                ]);

                $order->items()->update([
                    'status' => IssuedTicketStatus::AVAILABLE
                ]);

                Log::info('Pago procesado exitosamente', [
                    'order_id' => $order->id,
                    'transaction_id' => $transactionId
                ]);

                return true;
            } else {
                $this->cancelOrder($order);
                return false;
            }

        } catch (\Exception $e) {
            Log::error('Error procesando pago', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
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
                return [
                    'ticket_type_id' => $firstTicket->ticket_type_id,
                    'ticket_type_name' => $firstTicket->ticketType->name,
                    'quantity' => $tickets->count(),
                    'unit_price' => $firstTicket->ticketType->price,
                    'total_price' => $tickets->count() * $firstTicket->ticketType->price,
                ];
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

    private function generateUniqueCode(Order $order, TicketType $ticketType): string
    {
        return 'TK-' . $order->id . '-' . $ticketType->id . '-' . time() . '-' . rand(1000, 9999);
    }

    private function generateOrderNumber(Order $order): string
    {
        return 'TM-' . date('Y') . '-' . str_pad($order->id, 6, '0', STR_PAD_LEFT);
    }

    private function releaseTickets(Order $order): void
    {
        $ticketCounts = $order->items->groupBy('ticket_type_id')->map->count();
        
        foreach ($ticketCounts as $ticketTypeId => $count) {
            TicketType::where('id', $ticketTypeId)->decrement('quantity_sold', $count);
        }
    }

    // FIX: Corregir el método calculateOrderTotals para manejar strings
    public function calculateOrderTotals(array $selectedTickets): array
    {
        $subtotal = 0;
        
        foreach ($selectedTickets as $ticket) {
            // Convertir price a float si viene como string
            $price = is_string($ticket['price']) ? (float)$ticket['price'] : $ticket['price'];
            $quantity = (int)$ticket['quantity'];
            
            $subtotal += $price * $quantity;
        }
        
        $serviceFee = round($subtotal * 0.05); // 5% de cargo por servicio
        $total = $subtotal + $serviceFee;
        
        return [
            'subtotal' => $subtotal,
            'service_fee' => $serviceFee,
            'total_amount' => $total,
        ];
    }
}