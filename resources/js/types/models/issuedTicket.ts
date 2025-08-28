import type { TicketType } from './ticketType';
import type { Order } from './order';
import type { Assistant } from './assistant';
import type { User } from './user';

export type IssuedTicketStatus = 'available' | 'used' | 'cancelled' | 'reprinted';

export interface IssuedTicket {
    id: number;
    unique_code: string;
    status: IssuedTicketStatus;
    issued_at: string | null;
    validated_at: string | null;
    device_used: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Claves foráneas
    ticket_type_id: number;
    order_id: number;
    assistant_id: number | null;
    client_id: number;
}

export interface IssuedTicketRelations {
    ticketType: TicketType;
    order: Order;
    assistant: Assistant;
    client: User;
}