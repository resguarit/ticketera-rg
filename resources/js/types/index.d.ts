import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

// Re-export all models types
export * from './common';
export * from './admin';
export * from './models/assistant';
export * from './models/category';
export * from './models/ciudad';
export * from './models/discountCode';
export * from './models/event';
export * from './models/eventFunction';
export * from './models/eventFunctionSeat';
export * from './models/issuedTicket';
export * from './models/order';
export * from './models/organizer';
export * from './models/person';
export * from './models/provincia';
export * from './models/seat';
export * from './models/sector';
export * from './models/ticketType';
export * from './models/user';
export * from './models/venue';

// export de las vistas
export * from './ui/event.views'; 

export * from './ui';


export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    email: string;
    role: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    person: {
        id: number;
        name: string;
        last_name: string;
        dni: string;
        phone?: string | null; // Optional phone field
        address?: string;
    };
    organizer?: {
        id: number;
        name: string;
        logo_url?: string;
        image_url?: string;
        referring?: string;
        email?: string;
        phone?: string;
    };
    [key: string]: unknown; // This allows for additional properties...
}
