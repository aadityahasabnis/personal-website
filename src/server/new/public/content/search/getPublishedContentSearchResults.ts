'use server';

import {
    CONTENT_TYPES,
    CONTENT_TYPE_TO_ROUTE_SEGMENT,
    PUBLIC_READ_CONTENT_TYPE_VALUES,
    PUBLISH_STATUS,
    SCHEMA_LIMITS,
    type PublicReadContentType,
} from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { error, handleError, normalizePagination, success } from '../../../utils/helper';
import { toStableSort } from '../shared';
import type { IContentSearchQuery, IPublicContentSearchResult } from './types';

interface IContentSearchLean {
    _id: { toString(): string };
    type: PublicReadContentType;
    slug: string;
    title: string;
    description: string;
    tags?: string[];
    coverImage?: string | null;
    publishedAt?: Date | null;
    updatedAt: Date;
    topicSlug?: string | null;
}

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isPublicReadContentType = (value: string): value is PublicReadContentType => {
    return PUBLIC_READ_CONTENT_TYPE_VALUES.includes(value as PublicReadContentType);
};

const toPublicPath = (type: PublicReadContentType, slug: string, topicSlug: string | null): string => {
    const base = `/${CONTENT_TYPE_TO_ROUTE_SEGMENT[type]}`;

    if (type === CONTENT_TYPES.ARTICLE) {
        return topicSlug ? `${base}/${topicSlug}/${slug}` : `${base}/${slug}`;
    }

    return `${base}/${slug}`;
};

// ========================================================
// Query: Published Content Search Results
// ========================================================

export const getPublishedContentSearchResults = async (
    params: IContentSearchQuery,
): Promise<IApiResponse<IPublicContentSearchResult[]>> => {
    try {
        await connectDB();

        const query = params.query.trim();
        if (query.length < SCHEMA_LIMITS.TITLE_MIN_LENGTH) {
            return error('Search query is too short', 400);
        }
        if (query.length > SCHEMA_LIMITS.TITLE_MAX_LENGTH) {
            return error('Search query is too long', 400);
        }

        const selectedTypes = Array.isArray(params.contentTypes)
            ? params.contentTypes.filter((type) => isPublicReadContentType(type))
            : [];

        const contentTypes = selectedTypes.length > 0
            ? selectedTypes
            : [...PUBLIC_READ_CONTENT_TYPE_VALUES];

        const { offset, limit } = normalizePagination(params.pagination);
        const regex = new RegExp(escapeRegex(query), 'i');

        const match: Record<string, unknown> = {
            type: { $in: contentTypes },
            publishStatus: PUBLISH_STATUS.PUBLISHED,
            $or: [
                { title: regex },
                { description: regex },
                { tags: regex },
                { 'seo.keywords': regex },
            ],
        };

        if (params.featuredOnly === true) {
            match.featured = true;
        }

        const rows = await Content.aggregate<IContentSearchLean>([
            { $match: match },
            {
                $lookup: {
                    from: 'topics',
                    localField: 'topicId',
                    foreignField: '_id',
                    as: 'topic',
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                slug: 1,
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    topicSlug: { $arrayElemAt: ['$topic.slug', 0] },
                },
            },
            {
                $project: {
                    _id: 1,
                    type: 1,
                    slug: 1,
                    title: 1,
                    description: 1,
                    tags: 1,
                    coverImage: 1,
                    publishedAt: 1,
                    updatedAt: 1,
                    topicSlug: 1,
                },
            },
            {
                $sort: toStableSort({ featured: -1, publishedAt: -1, updatedAt: -1 }),
            },
            { $skip: offset },
            { $limit: limit },
        ]);

        return success(
            rows.map((row) => ({
                id: row._id.toString(),
                type: row.type,
                slug: row.slug,
                topicSlug: row.topicSlug ?? null,
                path: toPublicPath(row.type, row.slug, row.topicSlug ?? null),
                title: row.title,
                description: row.description,
                tags: row.tags ?? [],
                coverImage: row.coverImage ?? null,
                publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
                updatedAt: row.updatedAt.toISOString(),
            }))
        );
    } catch (err) {
        return handleError(err, 'Failed to search published content');
    }
};

/*
API Responses:
- 200: Published content search results returned.
- 400: Invalid search query.
- 500: Unexpected server/database error.
*/
