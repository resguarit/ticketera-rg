import type { EventFunction } from './eventFunction';
import type { Person } from './person';

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
}