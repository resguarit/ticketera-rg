import type { EventFunction } from './eventFunction';
import type { Sector } from './sector';

export interface TicketType {
    id: number;
    name: string;
    description: string | null;
    price: number;
    sales_start_date: string;
    sales_end_date: string;
    quantity: number;
    quantity_sold: number;
    quantity_available: number;
    sold_percentage: number;
    total_income: number;
    is_hidden: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Claves foráneas
    event_function_id: number;
    sector_id: number;
}

export interface TicketTypeRelations {
    eventFunction: EventFunction;
    sector: Sector;
}