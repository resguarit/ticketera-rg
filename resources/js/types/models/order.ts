import type { User } from './user';
import type { IssuedTicket } from './issuedTicket';

export type OrderStatus = 'pending' | 'paid' | 'cancelled';

export interface Order {
    id: number;
    order_date: string;
    total_amount: number;
    status: OrderStatus;
    payment_method: string;
    transaction_id: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Claves foráneas
    client_id: number;
}

export interface OrderRelations {
    client: User;
    items: IssuedTicket[];
}