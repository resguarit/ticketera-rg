import type { Event } from './event';
import type { TicketType } from './ticketType';

export interface EventFunction {
    id: number;
    name: string;
    description: string | null;
    start_time: string;
    end_time: string | null;
    is_active: boolean;
    status: string; 
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Claves foráneas
    event_id: number;
    ticketTypes: TicketType[];
    
    // Estadísticas calculadas (opcional, solo cuando se incluyen)
    stats?: {
        totalTickets: number;
        soldTickets: number;
        availableTickets: number;
        totalRevenue: number;
        visibleTickets: number;
        totalTypes: number;
    };
}

export interface EventFunctionRelations {
    event: Event;
    ticketTypes: TicketType[];
}
