'use server';

import { EMAIL_TYPE } from '@/constants/emailConstants';
import { CONTACT_STATUS, SCHEMA_LIMITS } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Contact from '@/server/models/Contact';
import { error, handleError, success } from '../../utils/helper';
import { isEmailConfigured, sendEmailWithRetry, validateEmail } from '../../utils/mail';
import { contactResponseEmailTemplate } from '../../utils/mail-templates';
import { getAdminId } from '../shared';
import { parseContactObjectId, revalidateAdminContactsPaths } from './shared';
import type { IContactResponseInput, IContactResponseResult } from './types';

const RESPONSE_SUBJECT_MIN_LENGTH = 2;
const RESPONSE_BODY_MIN_LENGTH = 10;

const stripHtml = (value: string): string =>
    value
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const validateResponseSubject = (value: string): string | null => {
    const normalized = value.replace(/[\r\n]/g, ' ').trim();
    if (normalized.length < RESPONSE_SUBJECT_MIN_LENGTH) return null;
    if (normalized.length > SCHEMA_LIMITS.CONTACT_SUBJECT_MAX_LENGTH) return null;
    return normalized;
};

const validateResponseBody = (value: string): string | null => {
    const normalized = value.trim();
    if (!normalized) return null;
    if (stripHtml(normalized).length < RESPONSE_BODY_MIN_LENGTH) return null;
    return normalized;
};

// ========================================================
// Mutation: Send Contact Response
// ========================================================

export const sendContactResponse = async (
    contactId: string,
    input: IContactResponseInput,
): Promise<IApiResponse<IContactResponseResult>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const objectId = parseContactObjectId(contactId);
        if (!objectId) return error('Invalid contact id', 400);

        const subject = validateResponseSubject(input.subject);
        if (!subject) {
            return error(
                `Subject must be between ${String(RESPONSE_SUBJECT_MIN_LENGTH)} and ${String(SCHEMA_LIMITS.CONTACT_SUBJECT_MAX_LENGTH)} characters`,
                400,
            );
        }

        const body = validateResponseBody(input.body);
        if (!body) {
            return error(
                `Body content must contain at least ${String(RESPONSE_BODY_MIN_LENGTH)} visible characters`,
                400,
            );
        }

        if (!isEmailConfigured()) {
            return error('Email service not configured. Please set GMAIL_ACCOUNT and GMAIL_PASSWORD.', 500);
        }

        await connectDB();

        const contact = await Contact.findById(objectId)
            .select('_id name email subject message status');
        if (!contact) return error('Contact not found', 404);

        if (!validateEmail(contact.email)) {
            return error('Contact email address is invalid', 400);
        }

        const { html, text } = contactResponseEmailTemplate(
            contact.name,
            subject,
            body,
            contact.subject,
            contact.message,
        );

        const emailResult = await sendEmailWithRetry(
            {
                to: contact.email,
                subject,
                html,
                text,
            },
            EMAIL_TYPE.CONTACT_RESPONSE,
        );

        if (!emailResult.success) {
            return error(emailResult.error ?? 'Failed to send contact response', 500);
        }

        if (contact.status !== CONTACT_STATUS.REPLIED) {
            await contact.markAsReplied();
        }

        revalidateAdminContactsPaths();

        return success(
            {
                contactId: contact._id.toString(),
                email: contact.email,
                status: CONTACT_STATUS.REPLIED,
                ...(emailResult.messageId ? { messageId: emailResult.messageId } : {}),
            },
            'Response sent successfully',
        );
    } catch (err) {
        return handleError(err, 'Failed to send contact response');
    }
};

/*
API Responses:
- 200: Response sent and contact marked as replied.
- 400: Invalid input/contact id/email.
- 401: Admin authentication required.
- 404: Contact not found.
- 500: Unexpected server/database/email service error.
*/
