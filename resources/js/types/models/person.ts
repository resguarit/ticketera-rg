import type { User } from './user';

export interface Person {
    id: number;
    name: string;
    last_name: string;
    dni: string | null;
    phone: string | null;
    address: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface PersonRelations {
    user: User;
}