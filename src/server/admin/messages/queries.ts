'use server';

/**
 * Messages Admin Queries
 * 
 * Server queries for fetching contact messages in the admin panel.
 */

import { getCollection } from '@/lib/db/connect';
import type { ActionResponse, PaginatedResponse } from '../utils/types';
import { success, paginated } from '../utils/response';
import { handleError } from '../utils/errorHandler';
import type { ContactMessage } from './actions';

// ===== TYPES =====

export interface AdminMessage {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    type: 'general' | 'collaboration' | 'hiring' | 'feedback';
    createdAt: string;
    read: boolean;
    archived: boolean;
}

export interface GetMessagesRequest {
    limit?: number;
    offset?: number;
    filter?: 'all' | 'unread' | 'read' | 'archived';
    type?: 'general' | 'collaboration' | 'hiring' | 'feedback';
    search?: string;
}

export interface MessageStats {
    total: number;
    unread: number;
    read: number;
    archived: number;
    byType: {
        general: number;
        collaboration: number;
        hiring: number;
        feedback: number;
    };
}

// ===== HELPERS =====

const getContactsCollection = () => getCollection<ContactMessage>('contacts');

const serializeMessage = (message: ContactMessage): AdminMessage => ({
    _id: message._id!.toString(),
    name: message.name,
    email: message.email,
    subject: message.subject,
    message: message.message,
    type: message.type,
    createdAt: message.createdAt.toISOString(),
    read: message.read,
    archived: message.archived,
});

// ===== QUERIES =====

/**
 * Get messages with optional filtering and pagination
 */
export const getMessages = async (request: GetMessagesRequest = {}): Promise<PaginatedResponse<AdminMessage>> => {
    try {
        const { limit = 50, offset = 0, filter = 'all', type, search } = request;
        const collection = await getContactsCollection();

        // Build query
        const query: Record<string, unknown> = {};

        if (filter === 'unread') {
            query.read = false;
            query.archived = false;
        } else if (filter === 'read') {
            query.read = true;
            query.archived = false;
        } else if (filter === 'archived') {
            query.archived = true;
        } else {
            // 'all' shows non-archived by default
            query.archived = false;
        }

        if (type) {
            query.type = type;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
            ];
        }

        const [messages, total] = await Promise.all([
            collection.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
            collection.countDocuments(query),
        ]);

        return paginated(messages.map(serializeMessage), total, limit, offset);
    } catch (err) {
        const errorResult = handleError(err, 'Failed to get messages');
        return {
            ...errorResult,
            data: [],
            metadata: { total: 0, limit: 50, offset: 0, hasMore: false },
        };
    }
};

/**
 * Get all messages (simplified)
 */
export const getAllMessages = async (): Promise<AdminMessage[]> => {
    try {
        const collection = await getContactsCollection();
        const messages = await collection.find({}).sort({ createdAt: -1 }).toArray();
        return messages.map(serializeMessage);
    } catch (err) {
        console.error('Failed to get all messages:', err);
        return [];
    }
};

/**
 * Get message statistics
 */
export const getMessageStats = async (): Promise<ActionResponse<MessageStats>> => {
    try {
        const collection = await getContactsCollection();

        const [total, unread, read, archived, general, collaboration, hiring, feedback] = await Promise.all([
            collection.countDocuments({}),
            collection.countDocuments({ read: false, archived: false }),
            collection.countDocuments({ read: true, archived: false }),
            collection.countDocuments({ archived: true }),
            collection.countDocuments({ type: 'general' }),
            collection.countDocuments({ type: 'collaboration' }),
            collection.countDocuments({ type: 'hiring' }),
            collection.countDocuments({ type: 'feedback' }),
        ]);

        return success({
            total,
            unread,
            read,
            archived,
            byType: {
                general,
                collaboration,
                hiring,
                feedback,
            },
        });
    } catch (err) {
        return handleError(err, 'Failed to get message stats');
    }
};

/**
 * Get a single message by ID
 */
export const getMessageById = async (id: string): Promise<ActionResponse<AdminMessage | null>> => {
    try {
        const { ObjectId } = await import('mongodb');
        
        if (!ObjectId.isValid(id)) {
            return success(null);
        }

        const collection = await getContactsCollection();
        const message = await collection.findOne({ _id: new ObjectId(id) });

        if (!message) {
            return success(null);
        }

        return success(serializeMessage(message));
    } catch (err) {
        return handleError(err, 'Failed to get message');
    }
};

/**
 * Get unread message count (for notifications)
 */
export const getUnreadCount = async (): Promise<number> => {
    try {
        const collection = await getContactsCollection();
        return await collection.countDocuments({ read: false, archived: false });
    } catch (err) {
        console.error('Failed to get unread count:', err);
        return 0;
    }
};
