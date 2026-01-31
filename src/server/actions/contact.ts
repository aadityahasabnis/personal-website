'use server';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { IApiResponse } from '@/interfaces';

interface IContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    type: 'general' | 'collaboration' | 'hiring' | 'feedback';
}

interface IContactSubmission extends IContactFormData {
    createdAt: Date;
    read: boolean;
    archived: boolean;
}

/**
 * Submit contact form
 *
 * Validates input and stores in database.
 * In production, would also send email notification.
 */
export const submitContact = async (
    data: IContactFormData
): Promise<IApiResponse<{ id: string }>> => {
    try {
        // Validation
        if (!data.name || data.name.length < 2) {
            return {
                success: false,
                status: 400,
                error: 'Please provide your name.',
            };
        }

        if (!data.email || !VALIDATION.email.pattern.test(data.email)) {
            return {
                success: false,
                status: 400,
                error: 'Please provide a valid email address.',
            };
        }

        if (!data.subject || data.subject.length < 5) {
            return {
                success: false,
                status: 400,
                error: 'Please provide a subject (at least 5 characters).',
            };
        }

        if (!data.message || data.message.length < 20) {
            return {
                success: false,
                status: 400,
                error: 'Please provide a message (at least 20 characters).',
            };
        }

        // Store in database
        const collection = await getCollection<IContactSubmission>('contacts');

        const submission: IContactSubmission = {
            ...data,
            createdAt: new Date(),
            read: false,
            archived: false,
        };

        const result = await collection.insertOne(submission);

        // TODO: Send email notification in production
        // await sendEmail({
        //     to: SITE_CONFIG.email,
        //     subject: `New contact: ${data.subject}`,
        //     body: data.message,
        // });

        return {
            success: true,
            status: 201,
            data: { id: result.insertedId.toString() },
            message: 'Thank you! Your message has been sent.',
        };
    } catch (error) {
        console.error('Failed to submit contact form:', error);
        return {
            success: false,
            status: 500,
            error: 'Something went wrong. Please try again later.',
        };
    }
};
