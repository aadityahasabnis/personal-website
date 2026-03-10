import type { IAdmin } from '@/interfaces/schema/admin';
import type { IComment } from '@/interfaces/schema/comment';
import type { IContact } from '@/interfaces/schema/contact';
import type { IArticle, IBlog, IContent, IProject } from '@/interfaces/schema/content';
import type { IPageStats } from '@/interfaces/schema/pageStats';
import type { ISubscriber } from '@/interfaces/schema/subscriber';
import type { ISubtopic } from '@/interfaces/schema/subtopic';
import type { ITopic } from '@/interfaces/schema/topic';
import { Document } from 'mongoose';

// ============================================================
// Mongoose Document Types
// ============================================================

export interface ITopicDocument extends Omit<ITopic, '_id'>, Document {
    incrementContentCount(): Promise<this>;
    decrementContentCount(): Promise<this>;
}

export interface ISubtopicDocument extends Omit<ISubtopic, '_id'>, Document {
    incrementContentCount(): Promise<this>;
    decrementContentCount(): Promise<this>;
}

export interface IContentDocument extends Omit<IContent, '_id'>, Document {
    publish(): Promise<this>;
    unpublish(): Promise<this>;
    schedule(date: Date): Promise<this>;
    isArticle(): boolean;
    isBlog(): boolean;
    isProject(): boolean;
}

export interface IArticleDocument extends Omit<IArticle, '_id'>, Document {
    publish(): Promise<this>;
    unpublish(): Promise<this>;
    schedule(date: Date): Promise<this>;
}

export interface IBlogDocument extends Omit<IBlog, '_id'>, Document {
    publish(): Promise<this>;
    unpublish(): Promise<this>;
    schedule(date: Date): Promise<this>;
}

export interface IProjectDocument extends Omit<IProject, '_id'>, Document {
    publish(): Promise<this>;
    unpublish(): Promise<this>;
    schedule(date: Date): Promise<this>;
}

export interface IPageStatsDocument extends Omit<IPageStats, '_id'>, Document {}

export interface ICommentDocument extends Omit<IComment, '_id'>, Document {
    approve(): Promise<this>;
    incrementReplyCount(): Promise<this>;
    decrementReplyCount(): Promise<this>;
    incrementUpvotes(): Promise<this>;
}

export interface ISubscriberDocument extends Omit<ISubscriber, '_id'>, Document {
    confirm(): Promise<this>;
    unsubscribe(): Promise<this>;
    resubscribe(): Promise<this>;
}

export interface IAdminDocument extends Omit<IAdmin, '_id'>, Document {
    updateLastLogin(): Promise<this>;
}

export interface IContactDocument extends Omit<IContact, '_id'>, Document {
    markAsRead(): Promise<this>;
    markAsReplied(): Promise<this>;
    archive(): Promise<this>;
    unarchive(): Promise<this>;
}
