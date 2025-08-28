import type { Provincia } from './provincia';
import type { Venue } from './venue';

export interface Ciudad {
    id: number;
    name: string;
    postal_code: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Claves foráneas
    provincia_id: number;
    provincia: Provincia;
}

export interface CiudadRelations {
    provincia: Provincia;
    venues: Venue[];
}