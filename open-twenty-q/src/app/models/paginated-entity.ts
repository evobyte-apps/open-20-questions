export interface PaginatedEntity<T> {
    count: number;
    results: T[];
}
