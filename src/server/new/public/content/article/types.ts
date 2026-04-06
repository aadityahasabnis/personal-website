import type { IPublicListQuery } from '../../shared';

export interface IPublicTopicSummary {
    id: string;
    slug: string;
    title: string;
    description: string;
    coverImage: string | null;
    order: number;
    featured: boolean;
    subTopicCount: number;
    contentCount: number;
    updatedAt: string;
}

export interface IPublicArticleCard {
    id: string;
    slug: string;
    title: string;
    description: string;
    readingTime: number;
    featured: boolean;
    publishedAt: string | null;
}

export interface IPublicSubtopicSection {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    order: number;
    contentCount: number;
    articles: IPublicArticleCard[];
}

export interface IPublicTopicTree {
    topic: IPublicTopicSummary;
    subtopics: IPublicSubtopicSection[];
    uncategorizedArticles: IPublicArticleCard[];
}

export interface IPublicArticleDetail {
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
    topic: {
        id: string;
        slug: string;
        title: string;
    };
    subtopic: {
        id: string;
        slug: string;
        title: string;
    } | null;
    seo: {
        title: string | null;
        description: string | null;
        keywords: string[];
        ogImage: string | null;
        canonicalUrl: string | null;
        noIndex: boolean;
    } | null;
}

export interface IArticleTopicQuery extends IPublicListQuery {
    featuredOnly?: boolean;
}

export interface IArticleStaticPath {
    contentId: string;
    topicSlug: string;
    articleSlug: string;
}
