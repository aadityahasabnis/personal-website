import { SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import mongoose, { Model, Schema } from 'mongoose';
import type { ICommentDocument } from './types';

// ============================================================
// Author Schema (Embedded)
// ============================================================

const AuthorSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Author name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [SCHEMA_LIMITS.AUTHOR_NAME_MAX_LENGTH, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Author email is required'],
            trim: true,
            lowercase: true,
            match: [VALIDATION_PATTERNS.EMAIL, 'Please provide a valid email address'],
        },
        avatar: {
            type: String,
            default: null,
            trim: true,
        },
        website: {
            type: String,
            default: null,
            trim: true,
            match: [VALIDATION_PATTERNS.URL, 'Website must be a valid URL'],
        },
        isOwner: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

// ============================================================
// Comment Schema
// ============================================================

const CommentSchema = new Schema<ICommentDocument>(
    {
        contentId: {
            type: Schema.Types.ObjectId,
            required: [true, 'Content ID is required'],
            ref: 'Content',
        },
        parentId: {
            type: Schema.Types.ObjectId,
            default: null,
            ref: 'Comment',
        },
        author: {
            type: AuthorSchema,
            required: [true, 'Author information is required'],
        },
        content: {
            type: String,
            required: [true, 'Comment content is required'],
            trim: true,
            minlength: [SCHEMA_LIMITS.COMMENT_MIN_LENGTH, 'Comment cannot be empty'],
            maxlength: [SCHEMA_LIMITS.COMMENT_MAX_LENGTH, 'Comment cannot exceed 2000 characters'],
        },
        upvotes: {
            type: Number,
            default: 0,
            min: [0, 'Upvotes cannot be negative'],
        },
        approved: {
            type: Boolean,
            default: false,
        },
        replyCount: {
            type: Number,
            default: 0,
            min: [0, 'Reply count cannot be negative'],
        },
        ipHash: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true,
        collection: 'comments',
    }
);

// ============================================================
// Indexes
// ============================================================

CommentSchema.index({ contentId: 1, parentId: 1, createdAt: -1 });
CommentSchema.index({ contentId: 1, approved: 1, parentId: 1 });
CommentSchema.index({ approved: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1, approved: 1 });

// ============================================================
// Static Methods
// ============================================================

CommentSchema.statics.getTopLevelComments = async function (
    contentId: mongoose.Types.ObjectId,
    approved: boolean = true
) {
    return this.find({
        contentId,
        parentId: null,
        ...(approved && { approved: true }),
    })
        .sort({ createdAt: -1 })
        .lean();
};

CommentSchema.statics.getReplies = async function (
    commentId: mongoose.Types.ObjectId,
    approved: boolean = true
) {
    return this.find({
        parentId: commentId,
        ...(approved && { approved: true }),
    })
        .sort({ createdAt: 1 })
        .lean();
};

CommentSchema.statics.getCommentCount = async function (
    contentId: mongoose.Types.ObjectId,
    approved: boolean = true
) {
    return this.countDocuments({
        contentId,
        parentId: null,
        ...(approved && { approved: true }),
    });
};

// ============================================================
// Instance Methods
// ============================================================

CommentSchema.methods.approve = async function (this: ICommentDocument) {
    this.approved = true;
    return this.save();
};

CommentSchema.methods.incrementReplyCount = async function (this: ICommentDocument) {
    this.replyCount += 1;
    return this.save();
};

CommentSchema.methods.decrementReplyCount = async function (this: ICommentDocument) {
    if (this.replyCount > 0) {
        this.replyCount -= 1;
        return this.save();
    }
    return this;
};

CommentSchema.methods.incrementUpvotes = async function (this: ICommentDocument) {
    this.upvotes += 1;
    return this.save();
};

// ============================================================
// Middleware
// ============================================================

// Update parent comment's replyCount when a reply is created
CommentSchema.post('save', async function (doc: ICommentDocument) {
    if (doc.parentId && doc.approved) {
        await mongoose.model('Comment').findByIdAndUpdate(
            doc.parentId,
            { $inc: { replyCount: 1 } }
        );
    }
});

// Update parent comment's replyCount when a reply is deleted
CommentSchema.post('findOneAndDelete', async function (doc: ICommentDocument) {
    if (doc && doc.parentId && doc.approved) {
        await mongoose.model('Comment').findByIdAndUpdate(
            doc.parentId,
            { $inc: { replyCount: -1 } }
        );
    }
});

// ============================================================
// Model Export
// ============================================================

interface ICommentModel extends Model<ICommentDocument> {
    getTopLevelComments(contentId: mongoose.Types.ObjectId, approved?: boolean): Promise<ICommentDocument[]>;
    getReplies(commentId: mongoose.Types.ObjectId, approved?: boolean): Promise<ICommentDocument[]>;
    getCommentCount(contentId: mongoose.Types.ObjectId, approved?: boolean): Promise<number>;
}

const Comment: ICommentModel =
    (mongoose.models.Comment as ICommentModel) || 
    mongoose.model<ICommentDocument, ICommentModel>('Comment', CommentSchema);

export default Comment;
