import type { IPaginationParams } from '@/interfaces/actionHelper';

export interface IPublicListQuery {
    pagination?: IPaginationParams;
}

export interface IPublicCommentListQuery extends IPublicListQuery {
    approvedOnly?: boolean;
}
