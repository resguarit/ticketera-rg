import type { Organizer } from './organizer';
import type { Person } from './person';

export type UserRole = 'admin' | 'client' | 'organizer';

export interface User {
    id: number;
    email: string;
    role: UserRole;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;

    // Claves foráneas
    organizer_id: number | null;
    person_id: number;
}

export interface UserRelations {
    person: Person;
    organizer: Organizer;
}
