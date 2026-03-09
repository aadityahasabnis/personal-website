import { Document, Types } from 'mongoose';
import type {
    ITopic,
    ISubtopic,
    IContent,
    IArticle,
    IBlog,
    IProject,
    IPageStats,
    IComment,
    ISubscriber,
    IUser,
    IContact,
} from '@/interfaces/schema';

// ============================================================
// Mongoose Document Types
// ============================================================

// Extend interfaces with Mongoose Document methods (omit _id to avoid conflicts)
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
    isArticle(): this is IArticleDocument;
    isBlog(): this is IBlogDocument;
    isProject(): this is IProjectDocument;
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

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
    updateLastLogin(): Promise<this>;
    isAdmin(): boolean;
    isViewer(): boolean;
}

export interface IContactDocument extends Omit<IContact, '_id'>, Document {
    markAsRead(): Promise<this>;
    markAsReplied(): Promise<this>;
    archive(): Promise<this>;
    unarchive(): Promise<this>;
}
