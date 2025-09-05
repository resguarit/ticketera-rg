import type { EventFunction } from './eventFunction';
import type { Sector } from './sector';

export interface TicketType {
    id: number;
    event_function_id: number;
    sector_id: number;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    quantity_sold: number;
    max_purchase_quantity: number; // ← AGREGAR ESTE CAMPO
    is_hidden: boolean;
    sales_start_date: string;
    sales_end_date: string;
    created_at: string;
    updated_at: string;

    // Campos calculados
    quantity_available?: number;
    sold_percentage?: number;
    total_income?: number;
}

export interface TicketTypeRelations {
    eventFunction: EventFunction;
    sector: Sector;
}