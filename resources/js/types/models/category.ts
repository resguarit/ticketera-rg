import { Event } from './event';

export interface Category {
    id: number;
    name: string;
    icon: string;
    color: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CategoryRelations {
    events: Event[];
}