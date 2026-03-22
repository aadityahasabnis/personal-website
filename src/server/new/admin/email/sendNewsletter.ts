'use server';

// ============================================================
// Send Newsletter - Send to all or selected active subscribers
// Implements batch sending with rate limiting and tracking
// ============================================================

import { EMAIL_RATE_LIMIT, EMAIL_STATUS, EMAIL_TYPE } from '@/constants/emailConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subscriber from '@/server/models/Subscriber';
import { isEmailConfigured, sendEmailWithRetry, validateEmail } from '../../utils/mail';
import { newsletterEmailTemplate } from '../../utils/mail-templates';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import type { INewsletterRecipientStatus, INewsletterResult, ISendNewsletterInput } from './types';
import mongoose from 'mongoose';

// ============================================================
// Delay Helper
// ============================================================

const delay = (ms: number): Promise<void> => 
    new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// Send Newsletter Server Action
// ============================================================

export const sendNewsletter = async (
    input: ISendNewsletterInput
): Promise<IApiResponse<INewsletterResult>> => {
    try {
        // Require admin authentication
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        // Validate input
        if (!input.subject || !input.htmlContent) {
            return error('Missing required fields: subject, htmlContent', 400);
        }

        // Validate subject length
        if (input.subject.length > 200) {
            return error('Subject must be less than 200 characters', 400);
        }

        // Check email service configuration
        if (!isEmailConfigured()) {
            return error('Email service not configured. Please set GMAIL_ACCOUNT and GMAIL_PASSWORD.', 500);
        }

        // Connect to database
        await connectDB();

        // Get subscribers - either selected or all active
        let subscribers: Array<{ _id: mongoose.Types.ObjectId; email: string; name: string | null }>;

        if (input.subscriberIds && input.subscriberIds.length > 0) {
            // Validate all subscriber IDs
            const validIds = input.subscriberIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
            if (validIds.length !== input.subscriberIds.length) {
                return error('One or more invalid subscriber IDs', 400);
            }

            // Get selected subscribers (only active ones)
            subscribers = await Subscriber.find({
                _id: { $in: validIds.map((id) => new mongoose.Types.ObjectId(id)) },
                confirmed: true,
                unsubscribedAt: null,
            })
                .select('_id email name')
                .lean();

            if (subscribers.length === 0) {
                return error('No active subscribers found with the provided IDs', 404);
            }
        } else {
            // Get all active subscribers
            subscribers = await Subscriber.getActiveSubscribers();

            if (subscribers.length === 0) {
                return error('No active subscribers found', 404);
            }
        }

        // Check rate limit warning
        if (subscribers.length > EMAIL_RATE_LIMIT.warningThreshold) {
            console.warn(
                `[Newsletter] Warning: Sending to ${subscribers.length} subscribers. ` +
                `Gmail daily limit is ${EMAIL_RATE_LIMIT.dailyLimit}.`
            );
        }

        // Track results
        const results: INewsletterRecipientStatus[] = [];
        let sentCount = 0;
        let failedCount = 0;

        // Calculate batches
        const batchSize = EMAIL_RATE_LIMIT.batchSize;
        const batchDelayMs = EMAIL_RATE_LIMIT.batchDelayMs;
        const totalBatches = Math.ceil(subscribers.length / batchSize);

        console.log(
            `[Newsletter] Starting send to ${subscribers.length} subscribers ` +
            `in ${totalBatches} batches of ${batchSize}`
        );

        // Process subscribers in batches
        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const batchStart = batchIndex * batchSize;
            const batchEnd = Math.min(batchStart + batchSize, subscribers.length);
            const batch = subscribers.slice(batchStart, batchEnd);

            console.log(
                `[Newsletter] Processing batch ${batchIndex + 1}/${totalBatches} ` +
                `(${batch.length} subscribers)`
            );

            // Send to each subscriber in the batch
            for (const subscriber of batch) {
                // Validate email before sending
                if (!validateEmail(subscriber.email)) {
                    results.push({
                        subscriberId: subscriber._id.toString(),
                        email: subscriber.email,
                        name: subscriber.name,
                        status: EMAIL_STATUS.FAILED,
                        error: 'Invalid email address format',
                    });
                    failedCount++;
                    continue;
                }

                // Generate personalized email content
                const { html, text } = newsletterEmailTemplate(
                    subscriber.name,
                    input.subject,
                    input.htmlContent,
                    input.previewText
                );

                // Send email with retry
                const result = await sendEmailWithRetry(
                    {
                        to: subscriber.email,
                        subject: input.subject,
                        html,
                        text,
                    },
                    EMAIL_TYPE.NEWSLETTER
                );

                if (result.success) {
                    const successResult: INewsletterRecipientStatus = {
                        subscriberId: subscriber._id.toString(),
                        email: subscriber.email,
                        name: subscriber.name,
                        status: EMAIL_STATUS.SENT,
                    };
                    if (result.messageId) successResult.messageId = result.messageId;
                    results.push(successResult);
                    sentCount++;
                } else {
                    const failResult: INewsletterRecipientStatus = {
                        subscriberId: subscriber._id.toString(),
                        email: subscriber.email,
                        name: subscriber.name,
                        status: EMAIL_STATUS.FAILED,
                    };
                    if (result.error) failResult.error = result.error;
                    results.push(failResult);
                    failedCount++;
                }
            }

            // Delay between batches (except for the last batch)
            if (batchIndex < totalBatches - 1) {
                console.log(`[Newsletter] Waiting ${batchDelayMs}ms before next batch...`);
                await delay(batchDelayMs);
            }
        }

        console.log(
            `[Newsletter] Completed: ${sentCount} sent, ${failedCount} failed ` +
            `out of ${subscribers.length} total`
        );

        return success({
            totalRecipients: subscribers.length,
            sent: sentCount,
            failed: failedCount,
            results,
        });
    } catch (err) {
        return handleError(err, 'Failed to send newsletter');
    }
};
