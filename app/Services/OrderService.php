<?php
// filepath: app/Services/OrderService.php

namespace App\Services;

use App\DTO\PaymentResult;
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
use App\Services\StageTicketService;

class OrderService
{
    public function createOrder(array $orderData): array
    {
        return DB::transaction(function () use ($orderData) {
            $userId = null;
            $accountCreated = false;
    
            if (!Auth::check()) {                
                $existingUser = User::where('email', $orderData['billing_info']['email'])->first();
                
                if (!$existingUser) {
                    $userId = $this->createUserFromBillingInfo($orderData['billing_info']);
                    $accountCreated = true;
                } else {
                    $userId = $existingUser->id;
                    $user = User::with('person')->find($userId);
                    if ($user->person) {
                        $user->person->update([
                            'name' => $orderData['billing_info']['firstName'],
                            'last_name' => $orderData['billing_info']['lastName'],
                            'phone' => $orderData['billing_info']['phone'],
                            'dni' => $orderData['billing_info']['documentNumber'],
                        ]);
                    }
                }
            } else {
                $userId = Auth::id();
            }

            $totals = $this->calculateOrderTotals(
                $orderData['selected_tickets'],
                $orderData['discount'] ?? 0,
                $orderData['tax'] ?? 0
            );

            $orderCreateData = [
                'client_id' => $userId,
                'order_date' => now(),
                'status' => OrderStatus::PENDING,
                'cuotas' => $orderData['cuotas'],
                'cuota_id' => $orderData['cuota_id'],
                'payment_method' => $orderData['payment_method'],
                'transaction_id' => $this->generateOrderTransactionId($orderData['event_id']),
                'subtotal' => $totals['subtotal'],
                'discount' => $totals['discount'],
                'tax' => $totals['tax'],
                'service_fee' => $totals['service_fee'],
                'total_amount' => $totals['total_amount'],
                'order_details' => $totals['order_details'],
            ];

            $order = Order::create($orderCreateData);
    
            // MODIFICACIÓN: Almacenar referencias a ticket types para verificar tandas después
            $processedTicketTypes = [];
            
            foreach ($orderData['selected_tickets'] as $index => $ticketData) {
                $ticketType = TicketType::findOrFail($ticketData['id']);

                $this->createTicketsForType($order, $ticketType, $ticketData['quantity'], $userId);
    
                $ticketType->increment('quantity_sold', $ticketData['quantity']);
                
                // Agregar a la lista para verificar tandas después
                $processedTicketTypes[] = $ticketType->fresh(); // Recargar con quantity_sold actualizada
            }
            
            // NUEVO: Verificar y activar tandas después de procesar todas las compras
            //$this->checkStagesAfterPurchase($processedTicketTypes);
    
            return [
                'order' => $order,
                'account_created' => $accountCreated,
                'processed_ticket_types' => $processedTicketTypes,
            ];
        });
    }
    
    /**
     * NUEVO MÉTODO: Verifica y activa tandas después de una compra
     */
    private function checkStagesAfterPurchase(array $ticketTypes): void
    {
        $stageService = app(StageTicketService::class);
        
        foreach ($ticketTypes as $ticketType) {
            // Solo verificar si es parte de un sistema de tandas y está visible
            if ($ticketType->stage_group && !$ticketType->is_hidden) {
                $activated = $stageService->checkAndActivateNextStage($ticketType);
                
                if ($activated) {
                    Log::info("Tanda activada automáticamente después de compra", [
                        'agotada' => $ticketType->name,
                        'function_id' => $ticketType->event_function_id
                    ]);
                }
            }
        }
    }

    private function generateOrderTransactionId(int $eventId): string
    {
        return 'ORD-' . $eventId . '-' . substr(Str::uuid()->toString(), 0, 23);
    }
 
    private function generateUniqueCode(Order $order, TicketType $ticketType, string $suffix = null): string
    {
        $uuid = Str::uuid()->toString();
        
        $baseCode = 'TK-' . $order->id . '-' . $ticketType->id . '-' . substr($uuid, 0, 8);
        
        if ($suffix) {
            $bundleParts = explode('-', $suffix);
            $shortSuffix = end($bundleParts);
            return $baseCode . '-' . $shortSuffix;
        }
        
        return $baseCode;
    }

    public function generateUniqueTicketCode(TicketType $ticketType, string $prefix = 'INV'): string
    {
        $uuid = Str::uuid()->toString();
        
        // Formato: {PREFIX}-{ticket_type_id}-{uuid_part}
        $baseCode = $prefix . '-' . $ticketType->id . '-' . substr($uuid, 0, 12);
        
        return $baseCode;
    }

    private function createTicketsForType(Order $order, TicketType $ticketType, int $quantity, int $userId): void
    {

        if ($ticketType->isBundle()) {
            for ($i = 0; $i < $quantity; $i++) {
                $bundleReference = Str::uuid()->toString();                
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

                    IssuedTicket::create($ticketData);
                }
            }
        } else {
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

                IssuedTicket::create($ticketData);
            }
        }
    }

    private function createUserFromBillingInfo(array $billingInfo): int
    {
        $existingUser = User::where('email', $billingInfo['email'])->first();
        
        if ($existingUser) {
            return $existingUser->id;
        }

        $defaultPassword = $billingInfo['documentNumber'] ?? '12345678';
        
        $person = Person::create([
            'name' => $billingInfo['firstName'],
            'last_name' => $billingInfo['lastName'],
            'phone' => $billingInfo['phone'],
            'dni' => $billingInfo['documentNumber'],
        ]);

        $user = User::create([
            'email' => $billingInfo['email'],
            'password' => Hash::make($defaultPassword),
            'role' => UserRole::CLIENT,
            'person_id' => $person->id,
            'email_verified_at' => now(),
        ]);

        return $user->id;
    }

    public function cancelOrder(Order $order): bool
    {
        return DB::transaction(function () use ($order) {
            $order->update(['status' => OrderStatus::CANCELLED]);
            $this->releaseTickets($order);
            $order->items()->update([
                'status' => IssuedTicketStatus::CANCELLED
            ]);

            return true;
        });
    }

    private function releaseTickets(Order $order): void
    {
        $ticketCounts = $order->items->groupBy('ticket_type_id')->map(function ($tickets) {
            $ticketType = $tickets->first()->ticketType;
            
            if ($ticketType->isBundle()) {
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
        $subtotal = 0;
        $orderDetails = [];
        
        foreach ($selectedTickets as $index => $ticket) {

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
        
        return $result;
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
            'order_number' => $order->transaction_id,
            'status' => $order->status,
            'total_amount' => $order->total_amount,
            'order_date' => $order->order_date,
            'client_name' => $order->client->person->first_name . ' ' . $order->client->person->last_name,
            'client_email' => $order->client->email,
            'grouped_tickets' => $groupedTickets,
            'total_tickets' => $order->items->count(),
        ];
    }

    public function finalizeOrderPayment(Order $order, PaymentResult $paymentResult, array $processedTicketTypes): void
    {
        try {
            if ($paymentResult->success) {
                $order->update([ 'status' => OrderStatus::PAID ]);
                $order->items()->update(['status' => IssuedTicketStatus::AVAILABLE]);
                $this->checkStagesAfterPurchase($processedTicketTypes);
            } else {
                $this->cancelOrder($order);
            }

            $order->save();
        } catch (\Exception $e) {
            $this->cancelOrder($order);
            throw $e;
        }   
    }

    /*
    public function processPayment(Order $order, array $paymentData): bool
    {
        try {
            
            $paymentSuccessful = true;
            
            if ($paymentSuccessful) {
                $order->update([ 'status' => OrderStatus::PAID ]);

                $order->items()->update(['status' => IssuedTicketStatus::AVAILABLE]);

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
    }*/
}