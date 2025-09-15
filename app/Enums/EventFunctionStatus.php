<?php

namespace App\Enums;

enum EventFunctionStatus: string
{
    case UPCOMING = 'upcoming';
    case ON_SALE = 'on_sale';
    case SOLD_OUT = 'sold_out';
    case FINISHED = 'finished';
    case INACTIVE = 'inactive';

    public function label(): string
    {
        return match ($this) {
            self::UPCOMING => 'Próxima',
            self::ON_SALE => 'A la venta',
            self::SOLD_OUT => 'Agotada',
            self::FINISHED => 'Finalizada',
            self::INACTIVE => 'Inactiva',
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
        };
    }
}