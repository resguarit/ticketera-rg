<?php

namespace App\Enums;

enum IssuedTicketStatus: string
{
    case AVAILABLE = 'available';
    case USED = 'used';
    case CANCELLED = 'cancelled';
    case REPRINTED = 'reprinted';
}
