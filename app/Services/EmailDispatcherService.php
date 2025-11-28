<?php

namespace App\Services;

use App\Jobs\SendOrderConfirmationJob;
use App\Jobs\SendOrderTicketJob;
use App\Jobs\SendTicketBatchJob;
use App\Models\Order;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class EmailDispatcherService
{
    const BATCH_SIZE = 10;

    public function sendBatchInvitation(Collection $tickets, string $recipientEmail)
    {
        if ($tickets->isEmpty()) {
            return 0;
        }

        $ticketsChunk = $tickets->chunk(self::BATCH_SIZE);

        foreach ($ticketsChunk as $chunk) {
            SendTicketBatchJob::dispatch($chunk, $recipientEmail);
        }
    }

    public function resendTicketPurchaseConfirmation(Order $order)
    {
        Log::info("Resending ticket purchase confirmation email for Order ID: {$order->id} to {$order->client->email}");

        SendOrderTicketJob::dispatch($order);
    }

    public function sendTicketPurchaseConfirmation(Order $order)
    {
        Log::info("Dispatching ticket purchase confirmation email for Order ID: {$order->id} to {$order->client->email}");

        SendOrderConfirmationJob::dispatch($order);
    }
}
