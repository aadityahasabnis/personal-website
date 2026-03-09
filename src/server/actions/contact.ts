'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { VALIDATION } from '@/constants';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import { createErrorResponse, createSuccessResponse } from '@/server/lib/action-utils';

// ===== TYPES =====

export interface IContactMessage {
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

type SerializedMessage = Omit<IContactMessage, '_id' | 'createdAt'> & { _id: string; createdAt: string };

// ===== HELPERS =====

const getContactsCollection = () => getCollection<IContactMessage>('contacts');
const revalidate = () => revalidatePath('/admin/messages');

// ===== PUBLIC ACTIONS =====

export const submitContact = async (
    data: Pick<IContactMessage, 'name' | 'email' | 'subject' | 'message' | 'type'>
): Promise<IApiResponse<{ id: string }>> => {
    try {
        if (!data.name || data.name.length < 2) return createErrorResponse('Please provide your name.');
        if (!data.email || !VALIDATION.email.pattern.test(data.email)) return createErrorResponse('Please provide a valid email.');
        if (!data.subject || data.subject.length < 5) return createErrorResponse('Subject must be at least 5 characters.');
        if (!data.message || data.message.length < 20) return createErrorResponse('Message must be at least 20 characters.');

        const collection = await getContactsCollection();
        const result = await collection.insertOne({ ...data, createdAt: new Date(), read: false, archived: false });

        return { success: true, status: 201, data: { id: result.insertedId.toString() }, message: 'Thank you! Your message has been sent.' };
    } catch (error) {
        console.error('Failed to submit contact form:', error);
        return createErrorResponse('Something went wrong. Please try again later.', 500);
    }
};

// ===== ADMIN ACTIONS =====

export const getMessages = async (): Promise<SerializedMessage[]> => {
    try {
        const messages = await (await getContactsCollection()).find({}).sort({ createdAt: -1 }).toArray();
        return messages.map(m => ({ ...m, _id: m._id!.toString(), createdAt: m.createdAt.toISOString() }));
    } catch (error) {
        console.error('Failed to get messages:', error);
        return [];
    }
};

export const markMessageRead = async (id: string): Promise<IApiResponse> => {
    try {
        await (await getContactsCollection()).updateOne({ _id: new ObjectId(id) }, { $set: { read: true } });
        revalidate();
        return createSuccessResponse(undefined);
    } catch (error) {
        console.error('Failed to mark message read:', error);
        return createErrorResponse('Failed to mark as read', 500);
    }
};

export const markMessageUnread = async (id: string): Promise<IApiResponse> => {
    try {
        await (await getContactsCollection()).updateOne({ _id: new ObjectId(id) }, { $set: { read: false } });
        revalidate();
        return createSuccessResponse(undefined);
    } catch (error) {
        console.error('Failed to mark message unread:', error);
        return createErrorResponse('Failed to mark as unread', 500);
    }
};

export const archiveMessage = async (id: string): Promise<IApiResponse> => {
    try {
        await (await getContactsCollection()).updateOne({ _id: new ObjectId(id) }, { $set: { archived: true, read: true } });
        revalidate();
        return createSuccessResponse(undefined);
    } catch (error) {
        console.error('Failed to archive message:', error);
        return createErrorResponse('Failed to archive', 500);
    }
};

export const unarchiveMessage = async (id: string): Promise<IApiResponse> => {
    try {
        await (await getContactsCollection()).updateOne({ _id: new ObjectId(id) }, { $set: { archived: false } });
        revalidate();
        return createSuccessResponse(undefined);
    } catch (error) {
        console.error('Failed to unarchive message:', error);
        return createErrorResponse('Failed to unarchive', 500);
    }
};

export const deleteMessage = async (id: string): Promise<IApiResponse> => {
    try {
        await (await getContactsCollection()).deleteOne({ _id: new ObjectId(id) });
        revalidate();
        return createSuccessResponse(undefined);
    } catch (error) {
        console.error('Failed to delete message:', error);
        return createErrorResponse('Failed to delete', 500);
    }
};
