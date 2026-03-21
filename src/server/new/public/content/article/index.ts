'use server';

import { PUBLISH_STATUS } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, normalizePagination, success } from '../../../utils/helper';
import { toIsoOrNull } from '../../shared';
import type {
    IArticleStaticPath,
    IArticleTopicQuery,
    IPublicArticleCard,
    IPublicArticleDetail,
    IPublicSubtopicSection,
    IPublicTopicSummary,
    IPublicTopicTree,
} from './types';

interface ITopicLean {
    _id: ObjectId;
    slug: string;
    title: string;
    description: string;
    coverImage?: string | null;
    order?: number;
    featured?: boolean;
    subTopicCount?: number;
    contentCount?: number;
    updatedAt: Date;
}

interface ISubtopicLean {
    _id: ObjectId;
    slug: string;
    title: string;
    description?: string | null;
    order?: number;
    contentCount?: number;
}

interface IArticleLean {
    _id: ObjectId;
    slug: string;
    title: string;
    description: string;
    readingTime?: number;
    order?: number;
    featured?: boolean;
    publishedAt?: Date | null;
    subtopicId?: ObjectId | null;
}

const toTopicSummary = (topic: ITopicLean): IPublicTopicSummary => ({
    id: topic._id.toString(),
    slug: topic.slug,
    title: topic.title,
    description: topic.description,
    coverImage: topic.coverImage ?? null,
    order: topic.order ?? 0,
    featured: Boolean(topic.featured),
    subTopicCount: topic.subTopicCount ?? 0,
    contentCount: topic.contentCount ?? 0,
    updatedAt: topic.updatedAt.toISOString(),
});

const toArticleCard = (article: IArticleLean): IPublicArticleCard => ({
    id: article._id.toString(),
    slug: article.slug,
    title: article.title,
    description: article.description,
    readingTime: article.readingTime ?? 0,
    order: article.order ?? 0,
    featured: Boolean(article.featured),
    publishedAt: toIsoOrNull(article.publishedAt),
});

export const getPublishedArticleTopics = async (
    params: IArticleTopicQuery = {},
): Promise<IApiResponse<IPublicTopicSummary[]>> => {
    try {
        await connectDB();
        const { offset, limit } = normalizePagination(params.pagination);

        const match: Record<string, unknown> = {
            published: true,
            contentCount: { $gt: 0 },
        };
        if (params.featuredOnly === true) match.featured = true;

        const topics = await Topic.find(match)
            .sort({ featured: -1, order: 1, updatedAt: -1 })
            .skip(offset)
            .limit(limit)
            .select('_id slug title description coverImage order featured subTopicCount contentCount updatedAt')
            .lean<ITopicLean[]>();

        return success(topics.map(toTopicSummary));
    } catch (err) {
        return handleError(err, 'Failed to fetch published article topics');
    }
};

export const getPublishedTopicTreeBySlug = async (
    topicSlug: string,
): Promise<IApiResponse<IPublicTopicTree | null>> => {
    try {
        await connectDB();

        const topic = await Topic.findOne({ slug: topicSlug, published: true })
            .select('_id slug title description coverImage order featured subTopicCount contentCount updatedAt')
            .lean<ITopicLean | null>();
        if (!topic) return success(null);

        const [subtopics, articles] = await Promise.all([
            Subtopic.find({ topicId: topic._id, published: true })
                .sort({ order: 1, updatedAt: -1 })
                .select('_id slug title description order contentCount')
                .lean<ISubtopicLean[]>(),
            Content.find({
                type: 'article',
                topicId: topic._id,
                publishStatus: PUBLISH_STATUS.PUBLISHED,
            })
                .sort({ subtopicId: 1, order: 1, publishedAt: -1 })
                .select('_id slug title description readingTime order featured publishedAt subtopicId')
                .lean<IArticleLean[]>(),
        ]);

        const articleCards = articles.map(toArticleCard);
        const bySubtopic = new Map<string, IPublicArticleCard[]>();

        for (let index = 0; index < articles.length; index += 1) {
            const article = articles[index];
            if (!article.subtopicId) continue;

            const key = article.subtopicId.toString();
            const list = bySubtopic.get(key) ?? [];
            list.push(articleCards[index]);
            bySubtopic.set(key, list);
        }

        const sections: IPublicSubtopicSection[] = subtopics.map((subtopic) => ({
            id: subtopic._id.toString(),
            slug: subtopic.slug,
            title: subtopic.title,
            description: subtopic.description ?? null,
            order: subtopic.order ?? 0,
            contentCount: subtopic.contentCount ?? 0,
            articles: bySubtopic.get(subtopic._id.toString()) ?? [],
        }));

        const uncategorizedArticles = articleCards.filter((_, index) => !articles[index].subtopicId);

        return success({
            topic: toTopicSummary(topic),
            subtopics: sections,
            uncategorizedArticles,
        });
    } catch (err) {
        return handleError(err, 'Failed to fetch topic content tree');
    }
};

export const getPublishedArticleByPath = async (
    topicSlug: string,
    articleSlug: string,
): Promise<IApiResponse<IPublicArticleDetail | null>> => {
    try {
        await connectDB();

        const topic = await Topic.findOne({ slug: topicSlug, published: true })
            .select('_id slug title')
            .lean<{ _id: ObjectId; slug: string; title: string } | null>();
        if (!topic) return success(null);

        const article = await Content.findOne({
            type: 'article',
            topicId: topic._id,
            slug: articleSlug,
            publishStatus: PUBLISH_STATUS.PUBLISHED,
        })
            .select(
                '_id slug title description body html tags coverImage readingTime featured publishedAt updatedAt subtopicId seo'
            )
            .lean<
                | {
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
                      subtopicId?: ObjectId | null;
                      seo?: {
                          title?: string | null;
                          description?: string | null;
                          keywords?: string[];
                          ogImage?: string | null;
                          canonicalUrl?: string | null;
                          noIndex?: boolean;
                      } | null;
                  }
                | null
            >();

        if (!article) return success(null);

        const subtopic = article.subtopicId
            ? await Subtopic.findOne({
                  _id: article.subtopicId,
                  topicId: topic._id,
                  published: true,
              })
                  .select('_id slug title')
                  .lean<{ _id: ObjectId; slug: string; title: string } | null>()
            : null;

        return success({
            id: article._id.toString(),
            slug: article.slug,
            title: article.title,
            description: article.description,
            body: article.body,
            html: article.html ?? null,
            tags: article.tags ?? [],
            coverImage: article.coverImage ?? null,
            readingTime: article.readingTime ?? 0,
            featured: Boolean(article.featured),
            publishedAt: toIsoOrNull(article.publishedAt),
            updatedAt: article.updatedAt.toISOString(),
            topic: {
                id: topic._id.toString(),
                slug: topic.slug,
                title: topic.title,
            },
            subtopic: subtopic
                ? {
                      id: subtopic._id.toString(),
                      slug: subtopic.slug,
                      title: subtopic.title,
                  }
                : null,
            seo: article.seo
                ? {
                      title: article.seo.title ?? null,
                      description: article.seo.description ?? null,
                      keywords: article.seo.keywords ?? [],
                      ogImage: article.seo.ogImage ?? null,
                      canonicalUrl: article.seo.canonicalUrl ?? null,
                      noIndex: Boolean(article.seo.noIndex),
                  }
                : null,
        });
    } catch (err) {
        return handleError(err, 'Failed to fetch article');
    }
};

export const getPublishedArticleStaticPaths = async (): Promise<IApiResponse<IArticleStaticPath[]>> => {
    try {
        await connectDB();

        const rows = await Content.aggregate<{
            contentId: string;
            topicSlug: string;
            articleSlug: string;
        }>([
            {
                $match: {
                    type: 'article',
                    publishStatus: PUBLISH_STATUS.PUBLISHED,
                    topicId: { $ne: null },
                },
            },
            {
                $lookup: {
                    from: 'topics',
                    localField: 'topicId',
                    foreignField: '_id',
                    as: 'topic',
                    pipeline: [
                        {
                            $match: { published: true },
                        },
                        {
                            $project: {
                                _id: 0,
                                slug: 1,
                            },
                        },
                    ],
                },
            },
            { $unwind: '$topic' },
            {
                $project: {
                    _id: 0,
                    contentId: { $toString: '$_id' },
                    topicSlug: '$topic.slug',
                    articleSlug: '$slug',
                },
            },
            {
                $sort: { topicSlug: 1, articleSlug: 1 },
            },
        ]);

        return success(rows);
    } catch (err) {
        return handleError(err, 'Failed to fetch article static paths');
    }
};

export const getPublishedArticleById = async (
    contentId: string,
): Promise<IApiResponse<IPublicArticleDetail | null>> => {
    try {
        const objectId = ObjectId.isValid(contentId) ? new ObjectId(contentId) : null;
        if (!objectId) return error('Invalid content id', 400);

        await connectDB();

        const row = await Content.aggregate<{
            id: string;
            slug: string;
            title: string;
            description: string;
            body: string;
            html: string | null;
            tags: string[];
            coverImage: string | null;
            readingTime: number;
            featured: boolean;
            publishedAt: string | null;
            updatedAt: string;
            topic: { id: string; slug: string; title: string };
            subtopic: { id: string; slug: string; title: string } | null;
            seo: IPublicArticleDetail['seo'];
        }>([
            {
                $match: {
                    _id: objectId,
                    type: 'article',
                    publishStatus: PUBLISH_STATUS.PUBLISHED,
                },
            },
            {
                $lookup: {
                    from: 'topics',
                    localField: 'topicId',
                    foreignField: '_id',
                    as: 'topic',
                    pipeline: [
                        { $match: { published: true } },
                        { $project: { _id: 1, slug: 1, title: 1 } },
                    ],
                },
            },
            { $unwind: '$topic' },
            {
                $lookup: {
                    from: 'subtopics',
                    localField: 'subtopicId',
                    foreignField: '_id',
                    as: 'subtopic',
                    pipeline: [{ $project: { _id: 1, slug: 1, title: 1 } }],
                },
            },
            {
                $unwind: {
                    path: '$subtopic',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    id: { $toString: '$_id' },
                    slug: 1,
                    title: 1,
                    description: 1,
                    body: 1,
                    html: { $ifNull: ['$html', null] },
                    tags: { $ifNull: ['$tags', []] },
                    coverImage: { $ifNull: ['$coverImage', null] },
                    readingTime: { $ifNull: ['$readingTime', 0] },
                    featured: { $ifNull: ['$featured', false] },
                    publishedAt: {
                        $cond: [
                            { $ifNull: ['$publishedAt', false] },
                            { $dateToString: { date: '$publishedAt', format: '%Y-%m-%dT%H:%M:%S.%LZ' } },
                            null,
                        ],
                    },
                    updatedAt: { $dateToString: { date: '$updatedAt', format: '%Y-%m-%dT%H:%M:%S.%LZ' } },
                    topic: {
                        id: { $toString: '$topic._id' },
                        slug: '$topic.slug',
                        title: '$topic.title',
                    },
                    subtopic: {
                        $cond: [
                            { $ifNull: ['$subtopic._id', false] },
                            {
                                id: { $toString: '$subtopic._id' },
                                slug: '$subtopic.slug',
                                title: '$subtopic.title',
                            },
                            null,
                        ],
                    },
                    seo: {
                        $cond: [
                            { $ifNull: ['$seo', false] },
                            {
                                title: { $ifNull: ['$seo.title', null] },
                                description: { $ifNull: ['$seo.description', null] },
                                keywords: { $ifNull: ['$seo.keywords', []] },
                                ogImage: { $ifNull: ['$seo.ogImage', null] },
                                canonicalUrl: { $ifNull: ['$seo.canonicalUrl', null] },
                                noIndex: { $ifNull: ['$seo.noIndex', false] },
                            },
                            null,
                        ],
                    },
                },
            },
        ]);

        return success(row[0] ?? null);
    } catch (err) {
        return handleError(err, 'Failed to fetch article by id');
    }
};
