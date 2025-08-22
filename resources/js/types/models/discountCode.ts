import { Event } from './event';

export interface DiscountCode {
    id: number;
    name: string;
    code: string;
    value: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Claves foráneas
    event_id: number;
}

export interface DiscountCodeRelations {
    event: Event;
}
