import type { Ciudad } from './ciudad';
import type { Event } from './event';
import type { Sector } from './sector';

export interface Venue {
    id: number;
    name: string;
    address: string | null;
    coordinates: string | null;
    banner_url: string | null;
    referring: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Claves foráneas
    ciudad_id: number | null;
    ciudad: Ciudad;

    // Accessor
    image_url: string | null;
}

export interface VenueRelations {
    ciudad: Ciudad;
    eventos: Event[];
    sectors: Sector[];
}
