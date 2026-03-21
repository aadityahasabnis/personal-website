import type { ISeoMetadata } from '@/interfaces/schema';
import Content from '@/server/models/Content';
import { ObjectId } from 'mongodb';
import { toIsoOrNull } from '../../shared';
import { buildPublishedContentMatch } from '../shared';
import type { IPublicBlogDetail, IPublicBlogListItem } from './types';

export interface IBlogLean {
    _id: ObjectId;
    slug: string;
    title: string;
    description: string;
    body: string;
    html?: string | null;
    tags?: string[];
    coverImage?: string | null;
    readingTime?: number;
    featured?: boolean;
    publishedAt?: Date | null;
    updatedAt: Date;
    seo?: ISeoMetadata | null;
}

export const toPublicBlogListItem = (row: IBlogLean): IPublicBlogListItem => ({
    id: row._id.toString(),
    slug: row.slug,
    title: row.title,
    description: row.description,
    coverImage: row.coverImage ?? null,
    readingTime: row.readingTime ?? 0,
    featured: Boolean(row.featured),
    publishedAt: toIsoOrNull(row.publishedAt),
    updatedAt: row.updatedAt.toISOString(),
});

export const toPublicBlogDetail = (row: IBlogLean): IPublicBlogDetail => ({
    ...toPublicBlogListItem(row),
    body: row.body,
    html: row.html ?? null,
    tags: row.tags ?? [],
    seo: row.seo ?? null,
});

export const getPublishedBlogBySlug = async (blogSlug: string): Promise<IBlogLean | null> => {
    return Content.findOne(
        buildPublishedContentMatch('blog', {
            slug: blogSlug,
        })
    )
        .select('_id slug title description body html tags coverImage readingTime featured publishedAt updatedAt seo')
        .lean<IBlogLean | null>();
};

export const getPublishedBlogByObjectId = async (blogId: ObjectId): Promise<IBlogLean | null> => {
    return Content.findOne(
        buildPublishedContentMatch('blog', {
            _id: blogId,
        })
    )
        .select('_id slug title description body html tags coverImage readingTime featured publishedAt updatedAt seo')
        .lean<IBlogLean | null>();
};
