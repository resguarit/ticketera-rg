export interface PaginatedResponse<T> {
    data: T[];
    current_page_url: string,
    first_page_url: string,
    last_page_url: string,
    next_page_url: string,
    prev_page_url?: string,
    path: string,
    from: number,
    to: number,
    total: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
}

export type With<
    TModel,
    TRelations,
    K extends keyof TRelations
> = TModel & Pick<TRelations, K>; 