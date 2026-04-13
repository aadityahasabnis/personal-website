'use server';

import { EMAIL_TYPE } from '@/constants/emailConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Newsletter from '@/server/models/Newsletter';
import Subscriber from '@/server/models/Subscriber';
import { error, handleError, success } from '../../utils/helper';
import { sendEmailBatch, type IBatchEmailResult } from '../../utils/mail';
import { newsletterEmailTemplate } from '../../utils/mail-templates';
import { getAdminId } from '../shared';
import {
    parseNewsletterObjectId,
    revalidateAdminNewslettersPaths,
} from './shared';
import type { ISendNewsletterResult } from './types';

const resolveRecipientName = (
    name: string | null | undefined,
): string | null => {
    const normalizedName = name?.trim();
    if (normalizedName) return normalizedName;
    return null;
};

// ============================================================
// Send Newsletter
// ============================================================

export const sendNewsletter = async (newsletterId: string): Promise<IApiResponse<ISendNewsletterResult>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const id = parseNewsletterObjectId(newsletterId);
        if (!id) {
            return error('Invalid newsletter ID', 400);
        }

        await connectDB();

        // Check if newsletter exists and is draft
        const newsletter = await Newsletter.findById(id);
        if (!newsletter) {
            return error('Newsletter not found', 404);
        }

        if (!newsletter.isDraft()) {
            return error('Only draft newsletters can be sent', 403);
        }

        // Get all active subscribers
        const subscribers = await Subscriber.getActiveSubscribers();
        
        if (subscribers.length === 0) {
            return error('No active subscribers to send to', 400);
        }

        const subscribersWithName = subscribers.map((subscriber) => ({
            ...subscriber,
            normalizedName: resolveRecipientName(subscriber.name),
        }));

        const missingNameCount = subscribersWithName.filter((subscriber) => !subscriber.normalizedName).length;
        if (missingNameCount > 0) {
            return error(
                `Cannot send newsletter: ${String(missingNameCount)} active subscriber(s) are missing a required name. Update names in Admin > Subscribers first.`,
                409,
            );
        }

        // Prepare email payloads for all subscribers
        const emailPayloads = subscribersWithName.map((subscriber) => {
            const { html, text } = newsletterEmailTemplate(
                subscriber.normalizedName,
                newsletter.subject,
                newsletter.body,
                newsletter.previewText ?? undefined
            );

            return {
                email: subscriber.email,
                payload: {
                    to: subscriber.email,
                    subject: newsletter.subject,
                    html,
                    text,
                },
            };
        });

        // Send emails in batches (25 per batch, 2 second delay between batches)
        const batchSize = 25;
        const delayBetweenBatches = 2000; // 2 seconds
        
        const results: IBatchEmailResult[] = await sendEmailBatch(
            emailPayloads,
            EMAIL_TYPE.NEWSLETTER,
            batchSize,
            delayBetweenBatches
        );

        // Calculate success/failure counts
        const recipientCount = results.length;
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;
        const deliveryRate = recipientCount > 0
            ? ((successCount / recipientCount) * 100).toFixed(2)
            : '0.00';

        // Mark newsletter as sent with delivery statistics
        await newsletter.markAsSent(recipientCount, successCount, failureCount);

        revalidateAdminNewslettersPaths();

        return success({
            recipientCount,
            successCount,
            failureCount,
            deliveryRate,
        }, `Newsletter sent successfully to ${successCount} of ${recipientCount} subscribers`);
    } catch (err) {
        return handleError(err, 'Failed to send newsletter');
    }
};

/*
API Responses:
- 200: Newsletter sent successfully with delivery statistics.
- 400: Invalid newsletter ID or no active subscribers.
- 403: Cannot send non-draft newsletters.
- 404: Newsletter not found.
- 401: Admin authentication required.
- 500: Unexpected server/database error or email service error.
*/
