'use server';

/**
 * Messages Admin Actions
 * 
 * Server actions for managing contact messages in the admin panel.
 */

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import type { ActionResponse } from '../utils/types';
import { success, error, notFound } from '../utils/response';
import { handleError } from '../utils/errorHandler';
import { logUpdate, logDelete } from '../utils/activityLogger';

// ===== TYPES =====

export interface ContactMessage {
    _id?: ObjectId;
    name: string;
    email: string;
    subject: string;
    message: string;
    type: 'general' | 'collaboration' | 'hiring' | 'feedback';
    createdAt: Date;
    read: boolean;
    archived: boolean;
}

export interface MarkMessageReadRequest {
    id: string;
}

export interface MarkMessageUnreadRequest {
    id: string;
}

export interface ArchiveMessageRequest {
    id: string;
}

export interface UnarchiveMessageRequest {
    id: string;
}

export interface DeleteMessageRequest {
    id: string;
}

export interface BulkMessageRequest {
    ids: string[];
}

// ===== HELPERS =====

const getContactsCollection = () => getCollection<ContactMessage>('contacts');

const revalidateMessages = () => {
    revalidatePath('/admin/messages');
    revalidatePath('/admin');
};

// ===== ACTIONS =====

/**
 * Mark a message as read
 */
export const markMessageRead = async (request: MarkMessageReadRequest): Promise<ActionResponse<void>> => {
    try {
        const { id } = request;

        if (!ObjectId.isValid(id)) {
            return error('Invalid message ID');
        }

        const collection = await getContactsCollection();
        const message = await collection.findOne({ _id: new ObjectId(id) });

        if (!message) {
            return notFound('Message');
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { read: true } }
        );

        await logUpdate('message', message.subject, id, { action: 'marked_read' });
        revalidateMessages();

        return success(undefined, 'Message marked as read');
    } catch (err) {
        return handleError(err, 'Failed to mark message as read');
    }
};

/**
 * Mark a message as unread
 */
export const markMessageUnread = async (request: MarkMessageUnreadRequest): Promise<ActionResponse<void>> => {
    try {
        const { id } = request;

        if (!ObjectId.isValid(id)) {
            return error('Invalid message ID');
        }

        const collection = await getContactsCollection();
        const message = await collection.findOne({ _id: new ObjectId(id) });

        if (!message) {
            return notFound('Message');
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { read: false } }
        );

        await logUpdate('message', message.subject, id, { action: 'marked_unread' });
        revalidateMessages();

        return success(undefined, 'Message marked as unread');
    } catch (err) {
        return handleError(err, 'Failed to mark message as unread');
    }
};

/**
 * Archive a message
 */
export const archiveMessage = async (request: ArchiveMessageRequest): Promise<ActionResponse<void>> => {
    try {
        const { id } = request;

        if (!ObjectId.isValid(id)) {
            return error('Invalid message ID');
        }

        const collection = await getContactsCollection();
        const message = await collection.findOne({ _id: new ObjectId(id) });

        if (!message) {
            return notFound('Message');
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { archived: true, read: true } }
        );

        await logUpdate('message', message.subject, id, { action: 'archived' });
        revalidateMessages();

        return success(undefined, 'Message archived');
    } catch (err) {
        return handleError(err, 'Failed to archive message');
    }
};

/**
 * Unarchive a message
 */
export const unarchiveMessage = async (request: UnarchiveMessageRequest): Promise<ActionResponse<void>> => {
    try {
        const { id } = request;

        if (!ObjectId.isValid(id)) {
            return error('Invalid message ID');
        }

        const collection = await getContactsCollection();
        const message = await collection.findOne({ _id: new ObjectId(id) });

        if (!message) {
            return notFound('Message');
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { archived: false } }
        );

        await logUpdate('message', message.subject, id, { action: 'unarchived' });
        revalidateMessages();

        return success(undefined, 'Message unarchived');
    } catch (err) {
        return handleError(err, 'Failed to unarchive message');
    }
};

/**
 * Delete a message
 */
export const deleteMessage = async (request: DeleteMessageRequest): Promise<ActionResponse<void>> => {
    try {
        const { id } = request;

        if (!ObjectId.isValid(id)) {
            return error('Invalid message ID');
        }

        const collection = await getContactsCollection();
        const message = await collection.findOne({ _id: new ObjectId(id) });

        if (!message) {
            return notFound('Message');
        }

        await collection.deleteOne({ _id: new ObjectId(id) });

        await logDelete('message', message.subject, id);
        revalidateMessages();

        return success(undefined, 'Message deleted');
    } catch (err) {
        return handleError(err, 'Failed to delete message');
    }
};

/**
 * Bulk mark messages as read
 */
export const bulkMarkMessagesRead = async (request: BulkMessageRequest): Promise<ActionResponse<number>> => {
    try {
        const { ids } = request;

        const validIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
        if (validIds.length === 0) {
            return error('No valid message IDs provided');
        }

        const collection = await getContactsCollection();
        const result = await collection.updateMany(
            { _id: { $in: validIds } },
            { $set: { read: true } }
        );

        revalidateMessages();

        return success(result.modifiedCount, `Marked ${result.modifiedCount} messages as read`);
    } catch (err) {
        return handleError(err, 'Failed to mark messages as read');
    }
};

/**
 * Bulk archive messages
 */
export const bulkArchiveMessages = async (request: BulkMessageRequest): Promise<ActionResponse<number>> => {
    try {
        const { ids } = request;

        const validIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
        if (validIds.length === 0) {
            return error('No valid message IDs provided');
        }

        const collection = await getContactsCollection();
        const result = await collection.updateMany(
            { _id: { $in: validIds } },
            { $set: { archived: true, read: true } }
        );

        revalidateMessages();

        return success(result.modifiedCount, `Archived ${result.modifiedCount} messages`);
    } catch (err) {
        return handleError(err, 'Failed to archive messages');
    }
};

/**
 * Bulk delete messages
 */
export const bulkDeleteMessages = async (request: BulkMessageRequest): Promise<ActionResponse<number>> => {
    try {
        const { ids } = request;

        const validIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
        if (validIds.length === 0) {
            return error('No valid message IDs provided');
        }

        const collection = await getContactsCollection();
        const result = await collection.deleteMany({ _id: { $in: validIds } });

        revalidateMessages();

        return success(result.deletedCount, `Deleted ${result.deletedCount} messages`);
    } catch (err) {
        return handleError(err, 'Failed to delete messages');
    }
};
