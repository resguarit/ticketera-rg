import type { Event } from './event';

export interface Cuota {
    id: number;
    event_id: number;
    bin: string;
    cantidad_cuotas: number;
    habilitada: boolean;
    banco: string | null;
    created_at: string;
    updated_at: string;

    event?: Pick<Event, 'id' | 'name'>;
}
