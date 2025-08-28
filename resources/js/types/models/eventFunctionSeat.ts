import type { EventFunction } from './eventFunction';
import type { Seat } from './seat';
import type { IssuedTicket } from './issuedTicket';

export interface EventFunctionSeat {
    id: number;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Claves foráneas
    event_function_id: number;
    seat_id: number;
    issued_ticket_id: number | null;
}

export interface EventFunctionSeatRelations {
    eventFunction: EventFunction;
    seat: Seat;
    issuedTicket: IssuedTicket;
}