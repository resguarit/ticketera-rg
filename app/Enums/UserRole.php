<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case CLIENT = 'client';
    case ORGANIZER = 'organizer';
    case VIEWER = 'viewer'; // Nuevo rol

}
