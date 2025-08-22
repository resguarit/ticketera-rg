import type { Venue } from './venue';
import type { Seat } from './seat';

export interface Sector {
    id: number;
    name: string;
    description: string | null;
    capacity: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Claves foráneas
    venue_id: number;
}

export interface SectorRelations {
    venue: Venue;
    seats: Seat[];
}