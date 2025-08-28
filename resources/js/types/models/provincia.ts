import type { Ciudad } from './ciudad';
import type { Venue } from './venue';

export interface Provincia {
    id: number;
    name: string;
    code: string;
    country: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface ProvinciaRelations {
    ciudades: Ciudad[];
    venues: Venue[];
}