import type { Faq } from './faq';

export interface FaqCategory {
    id: number;
    title: string;
    icon: string | null;
    color: string | null;
    order: number;
    created_at: string;
    updated_at: string;
}

export interface FaqCategoryRelations {
    faqs: Faq[];
}