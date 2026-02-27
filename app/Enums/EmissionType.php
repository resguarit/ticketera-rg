<?php

namespace App\Enums;

enum EmissionType: string
{
    case ONLINE = 'online';
    case INVITATION = 'invitation';
    case BOX_OFFICE = 'box_office';
    case PRE_PRINTED = 'pre_printed';
}
