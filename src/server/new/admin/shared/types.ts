import type { IPaginationParams, ISortParams } from '@/interfaces/actionHelper';

// ========================================================
// Shared Types
// ========================================================

export interface ITableQueryParams {
    query?: string;
    pagination?: IPaginationParams;
    sort?: ISortParams;
}
