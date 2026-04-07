import { NextRequest, NextResponse } from 'next/server';

import {
    sendNewsletter,
    sendOtp,
    sendPasswordReset,
    sendTestEmail,
    verifyEmailConnection,
    type ISendNewsletterInput,
    type ISendOtpInput,
    type ISendPasswordResetInput,
    type ISendTestEmailInput,
} from '@/server/new/admin/email';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

// ============================================================
// Types
// ============================================================

type EmailAction = 'verify' | 'test' | 'password-reset' | 'otp' | 'newsletter';

interface IEmailActionBody {
    action: EmailAction;
    // Test email fields
    to?: string;
    subject?: string;
    body?: string;
    cc?: string;
    bcc?: string;
    // Password reset fields
    resetLink?: string;
    expiresIn?: string;
    // OTP fields
    otp?: string;
    recipientName?: string;
    // Newsletter fields
    htmlContent?: string;
    previewText?: string;
    subscriberIds?: string[];
}

// ============================================================
// Route Configuration
// ============================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// GET - Verify Email Connection
// ============================================================

export const GET = async (): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        return toHttp(await verifyEmailConnection());
    } catch {
        return NextResponse.json(
            { success: false, status: 500, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};

// ============================================================
// POST - Email Actions
// ============================================================

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const body = await parseJsonBody<IEmailActionBody>(request);
        if (!body?.action) {
            return NextResponse.json(
                { success: false, status: 400, error: 'Missing action' },
                { status: 400 }
            );
        }

        switch (body.action) {
            // --------------------------------------------------------
            // Action: verify
            // --------------------------------------------------------
            case 'verify':
                return toHttp(await verifyEmailConnection());

            // --------------------------------------------------------
            // Action: test
            // Required: to, subject, body
            // Optional: cc, bcc
            // --------------------------------------------------------
            case 'test': {
                if (!body.to || !body.subject || !body.body) {
                    return NextResponse.json(
                        { success: false, status: 400, error: 'Missing required fields: to, subject, body' },
                        { status: 400 }
                    );
                }
                const input: ISendTestEmailInput = {
                    to: body.to,
                    subject: body.subject,
                    body: body.body,
                };
                if (body.cc) input.cc = body.cc;
                if (body.bcc) input.bcc = body.bcc;
                return toHttp(await sendTestEmail(input));
            }

            // --------------------------------------------------------
            // Action: password-reset
            // Required: resetLink
            // Optional: expiresIn
            // --------------------------------------------------------
            case 'password-reset': {
                if (!body.resetLink) {
                    return NextResponse.json(
                        { success: false, status: 400, error: 'Missing required field: resetLink' },
                        { status: 400 }
                    );
                }
                const input: ISendPasswordResetInput = {
                    resetLink: body.resetLink,
                };
                if (body.expiresIn) input.expiresIn = body.expiresIn;
                return toHttp(await sendPasswordReset(input));
            }

            // --------------------------------------------------------
            // Action: otp
            // Required: to, otp
            // Optional: recipientName, expiresIn
            // --------------------------------------------------------
            case 'otp': {
                if (!body.to || !body.otp) {
                    return NextResponse.json(
                        { success: false, status: 400, error: 'Missing required fields: to, otp' },
                        { status: 400 }
                    );
                }
                const input: ISendOtpInput = {
                    to: body.to,
                    otp: body.otp,
                };
                if (body.recipientName) input.recipientName = body.recipientName;
                if (body.expiresIn) input.expiresIn = body.expiresIn;
                return toHttp(await sendOtp(input));
            }

            // --------------------------------------------------------
            // Action: newsletter
            // Required: subject, htmlContent
            // Optional: previewText, subscriberIds
            // --------------------------------------------------------
            case 'newsletter': {
                if (!body.subject || !body.htmlContent) {
                    return NextResponse.json(
                        { success: false, status: 400, error: 'Missing required fields: subject, htmlContent' },
                        { status: 400 }
                    );
                }
                const input: ISendNewsletterInput = {
                    subject: body.subject,
                    htmlContent: body.htmlContent,
                };
                if (body.previewText) input.previewText = body.previewText;
                if (body.subscriberIds) input.subscriberIds = body.subscriberIds;
                return toHttp(await sendNewsletter(input));
            }

            // --------------------------------------------------------
            // Unsupported action
            // --------------------------------------------------------
            default:
                return NextResponse.json(
                    { success: false, status: 400, error: 'Unsupported action' },
                    { status: 400 }
                );
        }
    } catch {
        return NextResponse.json(
            { success: false, status: 500, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};

/**
 * ============================================================
 * Admin Email API Route
 * ============================================================
 *
 * Endpoint: /api/admin/email
 * Auth: Admin session required
 *
 * ============================================================
 * GET - Verify Email Connection
 * ============================================================
 *
 * Returns the SMTP connection status and configuration state.
 *
 * Response:
 *   - connected: boolean - Whether SMTP connection is established
 *   - configured: boolean - Whether email credentials are set
 *   - lastChecked: string - ISO timestamp of verification
 *   - error?: string - Error message if connection failed
 *
 * ============================================================
 * POST Actions
 * ============================================================
 *
 * All POST requests require: { "action": "<action-name>", ...params }
 *
 * ------------------------------------------------------------
 * Action: "verify"
 * ------------------------------------------------------------
 * Verify SMTP connection (same as GET).
 *
 * Demo (Postman):
 * {
 *   "action": "verify"
 * }
 *
 * ------------------------------------------------------------
 * Action: "test"
 * ------------------------------------------------------------
 * Send a test email to verify delivery.
 *
 * Required: to, subject, body
 * Optional: cc, bcc
 *
 * Demo (Postman):
 * {
 *   "action": "test",
 *   "to": "recipient@example.com",
 *   "subject": "Test Email from Admin Panel",
 *   "body": "This is a test email to verify the email service is working correctly.",
 *   "cc": "cc@example.com",
 *   "bcc": "bcc@example.com"
 * }
 *
 * ------------------------------------------------------------
 * Action: "password-reset"
 * ------------------------------------------------------------
 * Send password reset email to admin's primary email.
 *
 * Required: resetLink
 * Optional: expiresIn (default: "1 hour")
 *
 * Demo (Postman):
 * {
 *   "action": "password-reset",
 *   "resetLink": "https://aadityahasabnis.com/admin/reset-password?token=abc123xyz",
 *   "expiresIn": "30 minutes"
 * }
 *
 * ------------------------------------------------------------
 * Action: "otp"
 * ------------------------------------------------------------
 * Send OTP verification code.
 *
 * Required: to, otp (6-digit numeric string)
 * Optional: recipientName, expiresIn (default: "10 minutes")
 *
 * Demo (Postman):
 * {
 *   "action": "otp",
 *   "to": "user@example.com",
 *   "otp": "123456",
 *   "recipientName": "John Doe",
 *   "expiresIn": "5 minutes"
 * }
 *
 * ------------------------------------------------------------
 * Action: "newsletter"
 * ------------------------------------------------------------
 * Send newsletter to subscribers.
 * Sends to all active subscribers if subscriberIds not provided.
 * Uses batch processing (25/batch, 2s delay) to respect Gmail limits.
 *
 * Required: subject, htmlContent
 * Optional: previewText, subscriberIds (array of subscriber IDs)
 *
 * Demo (Postman) - Send to all:
 * {
 *   "action": "newsletter",
 *   "subject": "Monthly Newsletter - March 2024",
 *   "htmlContent": "<h1>Hello!</h1><p>Here's what's new this month...</p>",
 *   "previewText": "Check out our latest updates and announcements"
 * }
 *
 * Demo (Postman) - Send to specific subscribers:
 * {
 *   "action": "newsletter",
 *   "subject": "Exclusive Update",
 *   "htmlContent": "<h1>Special Announcement</h1><p>You're receiving this because...</p>",
 *   "previewText": "An exclusive update just for you",
 *   "subscriberIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 * }
 *
 * ============================================================
 */
