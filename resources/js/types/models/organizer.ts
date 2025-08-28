import type { Event } from './event';
import type { User } from './user';

export interface Organizer {
    id: number;
    name: string;
    referring: string | null;
    email: string | null;
    phone: string | null;
    logo_url: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    tax: string | null;
    decidir_public_key_prod: string | null;
    decidir_secret_key_prod: string | null;
    decidir_public_key_test: string | null;
    decidir_secret_key_test: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Accessor
    image_url: string | null;
}

export interface OrganizerRelations {
    events: Event[];
    users: User[];
}

export interface CredentialsFlash { email: string; password: string; }
