import type { EventFunction } from './eventFunction';
import type { Person } from './person';
import type { IssuedTicket } from './issuedTicket';

export interface Assistant {
    id: number;
    email: string | null;
    quantity: number;
    sended_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Claves foráneas
    event_function_id: number;
    person_id: number;
}

export interface AssistantRelations {
    eventFunction: EventFunction;
    person: Person;
    issuedTickets: IssuedTicket[];
}

// Tipo para asistentes agrupados por assistant_id (invitados)
export interface InvitedAttendee {
    type: 'invited';
    assistant_id: number;
    full_name: string;
    dni: string | null;
    email: string | null;
    phone: string | null;
    function_name: string;
    function_date: string;
    invited_at: string;
    sended_at: string | null;
    tickets_count: number;
    tickets_used: number;
    tickets: AttendeeTicket[];
}

// Tipo para compradores agrupados por order_id
export interface BuyerAttendee {
    type: 'buyer';
    order_id: number;
    full_name: string;
    dni: string | null;
    email: string | null;
    phone: string | null;
    function_name: string;
    function_date: string;
    purchased_at: string;
    total_amount: number;
    tickets_count: number;
    tickets_used: number;
    tickets: AttendeeTicket[];
}

// Tipo unificado para la tabla
export type AttendeeForTable = InvitedAttendee | BuyerAttendee;

// Información de cada ticket individual
export interface AttendeeTicket {
    id: number;
    unique_code: string;
    status: string;
    ticket_type_name: string;
    price: number;
    validated_at: string | null;
}

export interface AttendeeStats {
    total_attendees: number;
    invited_attendees: number;
    buyer_attendees: number;
    total_tickets: number;
    tickets_used: number;
    tickets_pending: number;
    total_revenue: number;
}

// Tipos para detalles de tickets
export interface OrderTicketType {
    ticket_type_id: number;
    ticket_type_name: string;
    price: number;
    quantity: number;
    subtotal: number;
    tickets_used: number;
    tickets_available: number;
}

export interface InvitedTicketType {
    ticket_type_id: number;
    ticket_type_name: string;
    courtesy_value: number;
    quantity: number;
    total_courtesy_value: number;
    tickets_used: number;
    tickets_available: number;
}

export interface OrderTotals {
    subtotal: number;
    discount_percentage: number;
    discount_amount: number;
    subtotal_after_discount: number;
    service_fee_amount: number;
    tax_percentage: number;
    total_paid: number;
}

export interface InvitedTotals {
    total_tickets: number;
    tickets_used: number;
    tickets_available: number;
    total_courtesy_value: number;
}

export interface PersonInfo {
    full_name: string;
    dni: string | null;
    email: string | null;
    phone: string | null;
}

export interface OrderDetails {
    type: 'buyer';
    order: {
        id: number;
        order_date: string;
        status: string;
        payment_method: string | null;
        transaction_id: string | null;
    };
    person: PersonInfo;
    per_type: OrderTicketType[];
    totals: OrderTotals;
    discount_code: {
        code: string;
        description: string;
    } | null;
    order_details: any | null;
}

export interface AssistantDetails {
    type: 'invited';
    assistant: {
        id: number;
        invited_at: string;
        sended_at: string | null;
        email: string | null;
        quantity: number;
    };
    person: PersonInfo;
    function: {
        name: string;
        start_time: string;
    };
    per_type: InvitedTicketType[];
    totals: InvitedTotals;
}

export type TicketDetails = OrderDetails | AssistantDetails;