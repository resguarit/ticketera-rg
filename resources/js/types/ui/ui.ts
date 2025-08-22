// ===================================
// UTILITY INTERFACES - Para formularios, UI extras, etc.
// ===================================

// Para páginas de checkout y compra (interfaces híbridas)
export interface EventDataForCheckout {
    id: number;
    title: string;
    description?: string;
    image: string;
    date: string;
    time: string;
    location: string;
    city: string;
    province?: string;
    full_address?: string;
    category?: string;
    rating?: number;
    reviews?: number;
    duration?: string;
    ageRestriction?: string;
    functions?: any[]; // Se puede usar PublicEventFunction si es necesario
    function?: any; // Función seleccionada
    selectedTickets?: SelectedTicket[];
}

// Para tickets seleccionados en checkout
export interface SelectedTicket {
    id: number;
    type: string;
    price: number;
    quantity: number;
    description?: string;
}

// ===================================
// FORM INTERFACES
// ===================================

// Para formularios de creación/edición de eventos
export interface EventFormData {
    title: string;
    description: string;
    category: string;
    date: string;
    time: string;
    location: string;
    city: string;
    capacity: string;
    featured: boolean;
    status: string;
}

// Para tipo de ticket en formularios
export interface TicketTypeFormData {
    id: string;
    name: string;
    description: string;
    price: string;
    quantity: string;
}

// ===================================
// UI SPECIFIC INTERFACES
// ===================================

// Para componentes que necesitan compatibilidad con estructuras legacy
export interface LegacyEventData {
    id: number;
    title?: string; // Alias de name
    name?: string;
    image?: string; // Alias de image_url
    image_url?: string;
    location?: string; // Alias de venue.name
    city?: string;
    province?: string;
    category?: string;
    functions?: any[];
    // Otros campos que puedan ser necesarios para compatibilidad
}

// ===================================
// FILTER & SEARCH INTERFACES
// ===================================

export interface EventFilters {
    search?: string;
    status?: string;
    category?: string;
    city?: string;
    sort_by?: string;
    sort_direction?: string;
    sortBy?: string; // Para compatibilidad con páginas públicas
}

// ===================================
// PAGINATION UTILITIES
// ===================================

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLink[];
    total: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
    from?: number;
    to?: number;
}

// ===================================
// COMPONENT PROPS
// ===================================

export interface EventDetailProps {
    eventData: any; // Se puede especificar más si es necesario
}

export interface EventCardProps {
    event: any; // Se puede especificar más si es necesario
}

export interface EventListProps {
    events: any[];
    loading?: boolean;
    onEventClick?: (event: any) => void;
}

// ===================================
// ENUMS & CONSTANTS
// ===================================

// Tipos de estado de eventos
export type EventStatus = 'draft' | 'pending' | 'active' | 'inactive' | 'finished' | 'cancelled';

// Tipos de categorías comunes
export type EventCategoryType = 'music' | 'sports' | 'theater' | 'conference' | 'festival' | 'other';

// Tipos de ordenamiento
export type SortDirection = 'asc' | 'desc';
export type EventSortField = 'name' | 'date' | 'created_at' | 'tickets_sold' | 'revenue';

// ===================================
// TYPE GUARDS & HELPERS
// ===================================

export function hasRequiredEventFields(event: any): boolean {
    return event && 
           typeof event.id === 'number' && 
           typeof event.title === 'string' || typeof event.name === 'string';
}

export function isEventWithFunctions(event: any): boolean {
    return event && Array.isArray(event.functions) && event.functions.length > 0;
}

export function isEventWithCategory(event: any): boolean {
    return event && (
        typeof event.category === 'string' || 
        (event.category && typeof event.category.name === 'string')
    );
}

import { Music, Theater, Trophy, Presentation, Utensils, Palette, Laugh, Users, PartyPopper } from 'lucide-react';

export const iconMap = {
    music: Music,
    theater: Theater,
    trophy: Trophy,
    presentation: Presentation,
    utensils: Utensils,
    palette: Palette,
    laugh: Laugh,
    users: Users,
    default: PartyPopper
};

export const getCategoryIcon = (iconName: string) => {
        return iconMap[iconName as keyof typeof iconMap] || iconMap.default;
};
