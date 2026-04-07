'use server';

import { CONTACT_STATUS } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Contact from '@/server/models/Contact';
import { created, error, handleError } from '../../utils/helper';
import { buildClientFingerprint, consumePublicRateLimit } from '../shared';
import {
    hashContactIp,
    normalizeContactEmail,
    normalizeContactMessage,
    normalizeContactName,
    normalizeContactSubject,
    validateContactEmail,
    validateContactMessage,
    validateContactName,
    validateContactSubject,
} from './shared';
import type { IPublicContactSubmission, ISubmitPublicContactInput } from './types';

const CONTACT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_RATE_LIMIT_MAX_REQUESTS_PER_IP = 5;
const CONTACT_RATE_LIMIT_MAX_REQUESTS_PER_EMAIL = 3;
const CONTACT_DUPLICATE_WINDOW_MS = 15 * 60 * 1000;

// ========================================================
// Mutation: Submit Public Contact
// ========================================================

export const submitPublicContact = async (
    input: ISubmitPublicContactInput,
): Promise<IApiResponse<IPublicContactSubmission>> => {
    try {
        const name = normalizeContactName(input.name ?? '');
        const email = normalizeContactEmail(input.email ?? '');
        const subject = normalizeContactSubject(input.subject ?? '');
        const message = normalizeContactMessage(input.message ?? '');

        const nameError = validateContactName(name);
        if (nameError) return error(nameError, 400);

        const emailError = validateContactEmail(email);
        if (emailError) return error(emailError, 400);

        const subjectError = validateContactSubject(subject);
        if (subjectError) return error(subjectError, 400);

        const messageError = validateContactMessage(message);
        if (messageError) return error(messageError, 400);

        await connectDB();

        const ipRateLimitKey = buildClientFingerprint(input.ipAddress ?? null, null);
        if (ipRateLimitKey) {
            const ipRateLimit = await consumePublicRateLimit({
                scope: 'public:contact:submit:ip',
                key: ipRateLimitKey,
                limit: CONTACT_RATE_LIMIT_MAX_REQUESTS_PER_IP,
                windowMs: CONTACT_RATE_LIMIT_WINDOW_MS,
            });

            if (!ipRateLimit.allowed) {
                return error(
                    `Too many contact attempts. Please retry after ${String(ipRateLimit.retryAfterSeconds)} seconds.`,
                    429,
                );
            }
        }

        const emailRateLimitKey = buildClientFingerprint(null, email);
        if (emailRateLimitKey) {
            const emailRateLimit = await consumePublicRateLimit({
                scope: 'public:contact:submit:email',
                key: emailRateLimitKey,
                limit: CONTACT_RATE_LIMIT_MAX_REQUESTS_PER_EMAIL,
                windowMs: CONTACT_RATE_LIMIT_WINDOW_MS,
            });

            if (!emailRateLimit.allowed) {
                return error(
                    `Too many contact attempts for this email. Please retry after ${String(emailRateLimit.retryAfterSeconds)} seconds.`,
                    429,
                );
            }
        }

        const duplicateWindowStart = new Date(Date.now() - CONTACT_DUPLICATE_WINDOW_MS);
        const duplicateCandidates = await Contact.find({
            email,
            subject,
            createdAt: { $gte: duplicateWindowStart },
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('_id message')
            .lean<Array<{ _id: unknown; message: string }>>();

        const duplicateSubmission = duplicateCandidates.find((row) => row.message === message) ?? null;

        if (duplicateSubmission) {
            return error('A similar message was recently submitted. Please try again later.', 409);
        }

        const ipHash =
            typeof input.ipAddress === 'string' && input.ipAddress.trim().length
                ? hashContactIp(input.ipAddress.trim())
                : null;

        const doc = await Contact.create({
            name,
            email,
            subject,
            message,
            status: CONTACT_STATUS.NEW,
            ipHash,
        });

        return created(
            {
                id: doc._id.toString(),
                status: doc.status,
                createdAt: doc.createdAt.toISOString(),
            },
            'Message sent successfully',
        );
    } catch (err) {
        return handleError(err, 'Failed to send message');
    }
};

/*
API Responses:
- 201: Contact message created.
- 400: Invalid name/email/subject/message values.
- 500: Unexpected server/database error.
*/
