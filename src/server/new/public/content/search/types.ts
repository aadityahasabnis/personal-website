import type { PublicReadContentType } from '@/constants/schemaConstants';
import type { IPublicListQuery } from '../../shared';

export interface IContentSearchQuery extends IPublicListQuery {
    query: string;
    contentTypes?: PublicReadContentType[];
    featuredOnly?: boolean;
}

export interface IPublicContentSearchResult {
    id: string;
    type: PublicReadContentType;
    slug: string;
    topicSlug: string | null;
    path: string;
    title: string;
    description: string;
    tags: string[];
    coverImage: string | null;
    publishedAt: string | null;
    updatedAt: string;
}
