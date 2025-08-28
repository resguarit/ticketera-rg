import type { Category } from './category';
import type { DiscountCode } from './discountCode';
import type { EventFunction } from './eventFunction';
import type { Organizer } from './organizer';
import type { Venue } from './venue';

export interface Event {
    id: number;
    name: string;
    description: string | null;
    banner_url: string | null;
    featured: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Claves foráneas
    organizer_id: number | null;
    category_id: number;
    venue_id: number | null;

    // Accessor
    image_url: string | null;
}

export interface EventRelations {
    category: Category;
    organizer: Organizer;
    venue: Venue;
    functions: EventFunction[];
    discounts_codes: DiscountCode[];
}