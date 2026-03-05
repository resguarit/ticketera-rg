<?php

namespace App\Enums;

enum SalesChannel: string
{
    case ONLINE = 'online';
    case BOX_OFFICE = 'box_office';
    case SALES_POINT = 'sales_point';
}
