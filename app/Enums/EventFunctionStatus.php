<?php

namespace App\Enums;

enum EventFunctionStatus: string
{
    case UPCOMING = 'upcoming';
    case ON_SALE = 'on_sale';
    case SOLD_OUT = 'sold_out';
    case FINISHED = 'finished';
    case INACTIVE = 'inactive';
    case CANCELLED = 'cancelled';
    case REPROGRAMMED = 'reprogrammed';

    public function label(): string
    {
        return match ($this) {
            self::UPCOMING => 'Próximamente',
            self::ON_SALE => 'En venta',
            self::SOLD_OUT => 'Agotado',
            self::FINISHED => 'Finalizado',
            self::INACTIVE => 'Inactivo',
            self::CANCELLED => 'Cancelado',
            self::REPROGRAMMED => 'Reprogramado',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::UPCOMING => 'blue',
            self::ON_SALE => 'green',
            self::SOLD_OUT => 'red',
            self::FINISHED => 'gray',
            self::INACTIVE => 'yellow',
            self::CANCELLED => 'red',
            self::REPROGRAMMED => 'orange',
        };
    }
}
