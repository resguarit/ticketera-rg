export interface BaseFilters {
    search?: string;
    sort_by?: string;
    sort_direction?: 'string';
    page?: number;
    per_page?: number;
}

// Form validation types
export interface ValidationErrors {
    [key: string]: string | string[];
}

export interface FormState<T> {
    data: T;
    errors: ValidationErrors;
    processing: boolean;
    dirty: boolean;
}
