'use server';

import { CONTACT_STATUS } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Contact from '@/server/models/Contact';
import { created, error, handleError } from '../../utils/helper';
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
