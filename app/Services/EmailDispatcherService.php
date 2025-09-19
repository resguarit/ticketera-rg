<?php

namespace App\Services;

use App\Jobs\SendOrderConfirmationJob;
use App\Jobs\SendTicketEmailJob;
use App\Models\Invitation;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Illuminate\Mail\Mailables\Attachment;

class EmailDispatcherService
{
    public function sendInvitation($issuedTickets, $recipientEmail)
    {
        Log::info("Dispatching email for invitation to {$recipientEmail}");
        Log::info("Issued Tickets qnty: " . count($issuedTickets));
        Log::info("Issued Tickets: " . json_encode($issuedTickets));
    }

    public function sendTicketPurchaseConfirmation(Order $order)
    {
        Log::info("Dispatching ticket purchase confirmation email for Order ID: {$order->id} to {$order->client->email}");

        SendOrderConfirmationJob::dispatch($order);
    }
}
