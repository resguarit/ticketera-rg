<?php

namespace App\Enums;

enum IssuedTicketStatus: string
{
    case AVAILABLE = 'available';
    case USED = 'used';
    case CANCELED = 'canceled';
    case REPRINTED = 'reprinted';
}