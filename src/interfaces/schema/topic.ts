import type { ISeoMetadata } from './content';
import type { IDocument, ITimestamps } from './base';

// ============================================================
// Topic Interface
// ============================================================

export interface ITopic extends IDocument, ITimestamps {
    slug: string;
    title: string;
    description: string;
    coverImage: string | null;
    order: number;
    published: boolean;
    featured: boolean;
    subTopicCount: number;
    contentCount: number;
    tags: string[];
    seo: ISeoMetadata | null;
}
