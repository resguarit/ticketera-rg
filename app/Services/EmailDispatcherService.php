<?php

namespace App\Services;

use App\Jobs\SendOrderConfirmationJob;
use App\Jobs\SendOrderTicketJob;
use App\Jobs\SendTicketBatchJob;
use App\Jobs\SendTicketEmailJob;
use App\Models\Invitation;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Support\Collection;

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
        SendOrderTicketJob::dispatch($order);
    }

    public function sendTicketPurchaseConfirmation(Order $order)
    {
        SendOrderConfirmationJob::dispatch($order);
    }
}
