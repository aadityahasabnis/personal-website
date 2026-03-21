import type { ISeoMetadata } from '@/interfaces/schema';
import type { IPublicListQuery } from '../../shared';

export interface IPublicBlogListItem {
    id: string;
    slug: string;
    title: string;
    description: string;
    coverImage: string | null;
    readingTime: number;
    featured: boolean;
    publishedAt: string | null;
    updatedAt: string;
}

export interface IPublicBlogDetail extends IPublicBlogListItem {
    body: string;
    html: string | null;
    tags: string[];
    seo: ISeoMetadata | null;
}

export interface IBlogListQuery extends IPublicListQuery {
    featuredOnly?: boolean;
}

export interface IBlogStaticPath {
    contentId: string;
    blogSlug: string;
}
