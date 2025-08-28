import type { Sector } from './sector';

export interface Seat {
    id: number;
    fila: string;
    numero: string;
    display_name: string | null;
    is_available: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Claves foráneas
    sector_id: number;
}

export interface SeatRelations {
    sector: Sector;
}