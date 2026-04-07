import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import { ObjectId } from 'mongodb';
export { isDuplicateSlugError } from '../helpers';

export interface IBlogActionBase {
    _id: ObjectId;
    slug: string;
    publishStatus: PublishStatusType;
    featured: boolean;
    publishedAt: Date | null;
}

const PUBLISH_STATUS_SET = new Set<PublishStatusType>(Object.values(PUBLISH_STATUS));

export const isPublishedBlog = (blog: Pick<IBlogActionBase, 'publishStatus'>): boolean => {
    return blog.publishStatus === PUBLISH_STATUS.PUBLISHED;
};

export const isValidPublishStatus = (status: unknown): status is PublishStatusType => {
    return typeof status === 'string' && PUBLISH_STATUS_SET.has(status as PublishStatusType);
};

export const normalizeBlogIds = (blogIds: string[]): string[] => {
    return Array.from(new Set(blogIds));
};

export const toObjectIds = (ids: string[]): ObjectId[] => {
    return ids.map((id) => new ObjectId(id));
};

