import type { FaqCategory } from './faqCategory';

export interface Faq {
    id: number;
    faq_category_id: number;
    question: string;
    answer: string;
    order: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface FaqRelations {
    category: FaqCategory;
}