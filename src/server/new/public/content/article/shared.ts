import Content from '@/server/models/Content';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { toIsoOrNull } from '../../shared';
import { buildPublishedContentMatch } from '../shared';
import type { IPublicArticleCard, IPublicArticleDetail, IPublicTopicSummary } from './types';

export interface ITopicLean {
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

export interface ISubtopicLean {
    _id: ObjectId;
    slug: string;
    title: string;
    description?: string | null;
    order?: number;
    contentCount?: number;
}

export interface IArticleLean {
    _id: ObjectId;
    slug: string;
    title: string;
    description: string;
    readingTime?: number;
    order?: number;
    featured?: boolean;
    publishedAt?: Date | null;
    subtopicId?: ObjectId | null;
    topicId?: ObjectId | null;
}

export interface IArticleDetailLean {
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
    topicId?: ObjectId | null;
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

export const toTopicSummary = (topic: ITopicLean): IPublicTopicSummary => ({
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

export const toArticleCard = (article: IArticleLean): IPublicArticleCard => ({
    id: article._id.toString(),
    slug: article.slug,
    title: article.title,
    description: article.description,
    readingTime: article.readingTime ?? 0,
    order: article.order ?? 0,
    featured: Boolean(article.featured),
    publishedAt: toIsoOrNull(article.publishedAt),
});

export const getPublishedTopicBySlug = async (topicSlug: string) => {
    return Topic.findOne({ slug: topicSlug, published: true })
        .select('_id slug title description coverImage order featured subTopicCount contentCount updatedAt')
        .lean<ITopicLean | null>();
};

export const getPublishedTopicById = async (topicId: ObjectId) => {
    return Topic.findOne({ _id: topicId, published: true })
        .select('_id slug title')
        .lean<{ _id: ObjectId; slug: string; title: string } | null>();
};

export const getPublishedArticleRecordByPath = async (topicId: ObjectId, articleSlug: string) => {
    return Content.findOne(
        buildPublishedContentMatch('article', {
            topicId,
            slug: articleSlug,
        })
    )
        .select('_id slug title description body html tags coverImage readingTime featured publishedAt updatedAt subtopicId seo')
        .lean<IArticleDetailLean | null>();
};

export const getPublishedArticleRecordById = async (contentId: ObjectId) => {
    return Content.findOne(
        buildPublishedContentMatch('article', {
            _id: contentId,
        })
    )
        .select(
            '_id slug title description body html tags coverImage readingTime featured publishedAt updatedAt topicId subtopicId seo'
        )
        .lean<IArticleDetailLean | null>();
};

export const getPublishedSubtopicById = async (subtopicId: ObjectId, topicId: ObjectId) => {
    return Subtopic.findOne({
        _id: subtopicId,
        topicId,
        published: true,
    })
        .select('_id slug title')
        .lean<{ _id: ObjectId; slug: string; title: string } | null>();
};

export const toPublicArticleDetail = (
    article: IArticleDetailLean,
    topic: { _id: ObjectId; slug: string; title: string },
    subtopic: { _id: ObjectId; slug: string; title: string } | null,
): IPublicArticleDetail => ({
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
