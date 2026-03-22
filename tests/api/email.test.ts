import { GET, POST } from '@/app/api/admin/email/route';
import * as authModule from '@/lib/auth/admin';
import * as emailModule from '@/server/new/admin/email';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/admin', () => ({
    auth: vi.fn(),
}));

vi.mock('@/server/new/admin/email', () => ({
    sendNewsletter: vi.fn(),
    sendOtp: vi.fn(),
    sendPasswordReset: vi.fn(),
    sendTestEmail: vi.fn(),
    verifyEmailConnection: vi.fn(),
}));

describe('admin email API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (authModule.auth as unknown as { mockResolvedValue: (value: unknown) => void }).mockResolvedValue({
            user: { id: 'admin-id', email: 'admin@example.com', name: 'Admin', image: null },
            expires: '2099-01-01T00:00:00.000Z',
        });
    });

    // ============================================================
    // GET - Verify Email Connection
    // ============================================================

    describe('GET /api/admin/email', () => {
        it('returns connection status on success', async () => {
            vi.mocked(emailModule.verifyEmailConnection).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    connected: true,
                    configured: true,
                    lastChecked: '2024-01-01T00:00:00.000Z',
                },
            });

            const request = new NextRequest('http://localhost/api/admin/email');
            void request; // Silence unused variable warning
            const response = await GET();
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(payload.data.connected).toBe(true);
        });

        it('returns not configured status', async () => {
            vi.mocked(emailModule.verifyEmailConnection).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    connected: false,
                    configured: false,
                    lastChecked: '2024-01-01T00:00:00.000Z',
                    error: 'Email service not configured',
                },
            });

            const response = await GET();
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.data.configured).toBe(false);
        });

        it('returns 500 when verification throws unexpectedly', async () => {
            vi.mocked(emailModule.verifyEmailConnection).mockRejectedValue(new Error('boom'));

            const response = await GET();
            const payload = await response.json();

            expect(response.status).toBe(500);
            expect(payload.success).toBe(false);
        });
    });

    // ============================================================
    // POST - Verify Action
    // ============================================================

    describe('POST /api/admin/email - verify action', () => {
        it('returns connection status for verify action', async () => {
            vi.mocked(emailModule.verifyEmailConnection).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    connected: true,
                    configured: true,
                    lastChecked: '2024-01-01T00:00:00.000Z',
                },
            });

            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({ action: 'verify' }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
        });
    });

    // ============================================================
    // POST - Test Email Action
    // ============================================================

    describe('POST /api/admin/email - test action', () => {
        it('sends test email successfully', async () => {
            vi.mocked(emailModule.sendTestEmail).mockResolvedValue({
                success: true,
                status: 200,
                data: { sent: true, messageId: 'test-msg-123' },
            });

            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'test',
                    to: 'test@example.com',
                    subject: 'Test Subject',
                    body: 'Test body content',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(payload.data.sent).toBe(true);
            expect(emailModule.sendTestEmail).toHaveBeenCalledWith({
                to: 'test@example.com',
                subject: 'Test Subject',
                body: 'Test body content',
                cc: undefined,
                bcc: undefined,
            });
        });

        it('sends test email with cc and bcc', async () => {
            vi.mocked(emailModule.sendTestEmail).mockResolvedValue({
                success: true,
                status: 200,
                data: { sent: true, messageId: 'test-msg-456' },
            });

            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'test',
                    to: 'test@example.com',
                    subject: 'Test Subject',
                    body: 'Test body',
                    cc: 'cc@example.com',
                    bcc: 'bcc@example.com',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            expect(response.status).toBe(200);
            expect(emailModule.sendTestEmail).toHaveBeenCalledWith({
                to: 'test@example.com',
                subject: 'Test Subject',
                body: 'Test body',
                cc: 'cc@example.com',
                bcc: 'bcc@example.com',
            });
        });

        it('returns 400 for missing to field', async () => {
            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'test',
                    subject: 'Test Subject',
                    body: 'Test body',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
            expect(payload.error).toContain('to');
        });

        it('returns 400 for missing subject field', async () => {
            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'test',
                    to: 'test@example.com',
                    body: 'Test body',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
        });

        it('returns 400 for missing body field', async () => {
            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'test',
                    to: 'test@example.com',
                    subject: 'Test Subject',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
        });
    });

    // ============================================================
    // POST - Password Reset Action
    // ============================================================

    describe('POST /api/admin/email - password-reset action', () => {
        it('sends password reset email successfully', async () => {
            vi.mocked(emailModule.sendPasswordReset).mockResolvedValue({
                success: true,
                status: 200,
                data: { sent: true, messageId: 'reset-msg-123' },
            });

            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'password-reset',
                    resetLink: 'https://example.com/reset?token=abc123',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(emailModule.sendPasswordReset).toHaveBeenCalledWith({
                resetLink: 'https://example.com/reset?token=abc123',
                expiresIn: undefined,
            });
        });

        it('sends password reset email with custom expiry', async () => {
            vi.mocked(emailModule.sendPasswordReset).mockResolvedValue({
                success: true,
                status: 200,
                data: { sent: true, messageId: 'reset-msg-456' },
            });

            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'password-reset',
                    resetLink: 'https://example.com/reset?token=abc123',
                    expiresIn: '30 minutes',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            expect(response.status).toBe(200);
            expect(emailModule.sendPasswordReset).toHaveBeenCalledWith({
                resetLink: 'https://example.com/reset?token=abc123',
                expiresIn: '30 minutes',
            });
        });

        it('returns 400 for missing resetLink field', async () => {
            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({ action: 'password-reset' }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
            expect(payload.error).toContain('resetLink');
        });
    });

    // ============================================================
    // POST - OTP Action
    // ============================================================

    describe('POST /api/admin/email - otp action', () => {
        it('sends OTP email successfully', async () => {
            vi.mocked(emailModule.sendOtp).mockResolvedValue({
                success: true,
                status: 200,
                data: { sent: true, messageId: 'otp-msg-123' },
            });

            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'otp',
                    to: 'user@example.com',
                    otp: '123456',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(emailModule.sendOtp).toHaveBeenCalledWith({
                to: 'user@example.com',
                otp: '123456',
                recipientName: undefined,
                expiresIn: undefined,
            });
        });

        it('sends OTP email with recipient name and custom expiry', async () => {
            vi.mocked(emailModule.sendOtp).mockResolvedValue({
                success: true,
                status: 200,
                data: { sent: true, messageId: 'otp-msg-456' },
            });

            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'otp',
                    to: 'user@example.com',
                    otp: '654321',
                    recipientName: 'John Doe',
                    expiresIn: '5 minutes',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            expect(response.status).toBe(200);
            expect(emailModule.sendOtp).toHaveBeenCalledWith({
                to: 'user@example.com',
                otp: '654321',
                recipientName: 'John Doe',
                expiresIn: '5 minutes',
            });
        });

        it('returns 400 for missing to field', async () => {
            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'otp',
                    otp: '123456',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
            expect(payload.error).toContain('to');
        });

        it('returns 400 for missing otp field', async () => {
            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'otp',
                    to: 'user@example.com',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
            expect(payload.error).toContain('otp');
        });
    });

    // ============================================================
    // POST - Newsletter Action
    // ============================================================

    describe('POST /api/admin/email - newsletter action', () => {
        it('sends newsletter to all subscribers successfully', async () => {
            vi.mocked(emailModule.sendNewsletter).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    totalRecipients: 10,
                    sent: 10,
                    failed: 0,
                    results: [],
                },
            });

            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'newsletter',
                    subject: 'Monthly Newsletter',
                    htmlContent: '<h1>Hello!</h1><p>Newsletter content</p>',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(payload.data.totalRecipients).toBe(10);
            expect(payload.data.sent).toBe(10);
            expect(emailModule.sendNewsletter).toHaveBeenCalledWith({
                subject: 'Monthly Newsletter',
                htmlContent: '<h1>Hello!</h1><p>Newsletter content</p>',
                previewText: undefined,
                subscriberIds: undefined,
            });
        });

        it('sends newsletter to selected subscribers', async () => {
            vi.mocked(emailModule.sendNewsletter).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    totalRecipients: 2,
                    sent: 2,
                    failed: 0,
                    results: [],
                },
            });

            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'newsletter',
                    subject: 'Special Update',
                    htmlContent: '<p>Special content</p>',
                    previewText: 'Check this out!',
                    subscriberIds: ['sub-1', 'sub-2'],
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            expect(response.status).toBe(200);
            expect(emailModule.sendNewsletter).toHaveBeenCalledWith({
                subject: 'Special Update',
                htmlContent: '<p>Special content</p>',
                previewText: 'Check this out!',
                subscriberIds: ['sub-1', 'sub-2'],
            });
        });

        it('returns partial success with some failures', async () => {
            vi.mocked(emailModule.sendNewsletter).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    totalRecipients: 5,
                    sent: 4,
                    failed: 1,
                    results: [
                        { subscriberId: 'sub-1', email: 'a@example.com', name: 'A', status: 'SENT', messageId: 'msg-1' },
                        { subscriberId: 'sub-2', email: 'invalid', name: 'B', status: 'FAILED', error: 'Invalid email' },
                    ],
                },
            });

            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'newsletter',
                    subject: 'Test',
                    htmlContent: '<p>Content</p>',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.data.failed).toBe(1);
        });

        it('returns 400 for missing subject field', async () => {
            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'newsletter',
                    htmlContent: '<p>Content</p>',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
            expect(payload.error).toContain('subject');
        });

        it('returns 400 for missing htmlContent field', async () => {
            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'newsletter',
                    subject: 'Newsletter Subject',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
            expect(payload.error).toContain('htmlContent');
        });
    });

    // ============================================================
    // General Error Cases
    // ============================================================

    describe('POST /api/admin/email - error handling', () => {
        it('returns 400 for missing action', async () => {
            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
            expect(payload.error).toBe('Missing action');
        });

        it('returns 400 for unsupported action', async () => {
            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({ action: 'unknown-action' }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
            expect(payload.error).toBe('Unsupported action');
        });

        it('returns 500 when action throws unexpectedly', async () => {
            vi.mocked(emailModule.sendTestEmail).mockRejectedValue(new Error('SMTP connection failed'));

            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'test',
                    to: 'test@example.com',
                    subject: 'Test',
                    body: 'Test body',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(500);
            expect(payload.success).toBe(false);
        });

        it('returns 400 for invalid JSON body', async () => {
            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: 'not valid json',
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
        });
    });

    // ============================================================
    // Authentication Boundary Tests
    // ============================================================

    describe('authentication boundaries', () => {
        it('blocks unauthenticated GET requests', async () => {
            (authModule.auth as unknown as { mockResolvedValue: (value: unknown) => void }).mockResolvedValue(null);

            const response = await GET();
            const payload = await response.json();

            expect(response.status).toBe(401);
            expect(payload.success).toBe(false);
            expect(payload.error).toBe('Unauthorized');
        });

        it('blocks unauthenticated POST requests', async () => {
            (authModule.auth as unknown as { mockResolvedValue: (value: unknown) => void }).mockResolvedValue(null);

            const request = new NextRequest('http://localhost/api/admin/email', {
                method: 'POST',
                body: JSON.stringify({ action: 'verify' }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(401);
            expect(payload.success).toBe(false);
            expect(payload.error).toBe('Unauthorized');
        });

        it('blocks requests with null user in session', async () => {
            (authModule.auth as unknown as { mockResolvedValue: (value: unknown) => void }).mockResolvedValue({
                user: null,
                expires: '2099-01-01T00:00:00.000Z',
            });

            const response = await GET();
            const payload = await response.json();

            expect(response.status).toBe(401);
            expect(payload.success).toBe(false);
        });
    });
});
