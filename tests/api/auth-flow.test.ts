import { POST as forgotPasswordPost } from '@/app/api/admin/auth/forgot-password/route';
import { POST as requestOtpPost } from '@/app/api/admin/auth/request-otp/route';
import { POST as resetPasswordPost } from '@/app/api/admin/auth/reset-password/route';
import { POST as verifyCredentialsPost } from '@/app/api/admin/auth/verify-credentials/route';
import { POST as verifyOtpPost } from '@/app/api/admin/auth/verify-otp/route';
import { POST as verifyResetTokenPost } from '@/app/api/admin/auth/verify-reset-token/route';
import * as authActions from '@/server/new/admin/auth';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ============================================================
// Mock Setup
// ============================================================

vi.mock('@/lib/auth/admin', () => ({
    auth: vi.fn(),
    signIn: vi.fn(),
}));

vi.mock('@/server/new/admin/auth', () => ({
    verifyCredentials: vi.fn(),
    requestLoginOtp: vi.fn(),
    verifyLoginOtp: vi.fn(),
    requestPasswordReset: vi.fn(),
    verifyResetToken: vi.fn(),
    resetPassword: vi.fn(),
}));

// ============================================================
// Helper Functions
// ============================================================

const createPostRequest = (path: string, body: object): NextRequest => {
    return new NextRequest(`http://localhost${path}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
    });
};

// ============================================================
// Test Suite: Two-Step Login Flow
// ============================================================

describe('Two-Step Login API Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ============================================================
    // Step 1: Verify Credentials
    // ============================================================

    describe('POST /api/admin/auth/verify-credentials', () => {
        it('returns pending token and email options on valid credentials', async () => {
            vi.mocked(authActions.verifyCredentials).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    pendingToken: 'mock-jwt-token',
                    emailOptions: [
                        { type: 'main', maskedEmail: 'ad***@example.com' },
                        { type: 'recovery', maskedEmail: 're***@backup.com' },
                    ],
                    adminName: 'Admin User',
                },
            });

            const request = createPostRequest('/api/admin/auth/verify-credentials', {
                email: 'admin@example.com',
                password: 'SecurePass123',
            });

            const response = await verifyCredentialsPost(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(payload.data.pendingToken).toBe('mock-jwt-token');
            expect(payload.data.emailOptions).toHaveLength(2);
            expect(payload.data.adminName).toBe('Admin User');
            expect(authActions.verifyCredentials).toHaveBeenCalledWith({
                email: 'admin@example.com',
                password: 'SecurePass123',
            });
        });

        it('returns only main email when recovery is not set', async () => {
            vi.mocked(authActions.verifyCredentials).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    pendingToken: 'mock-jwt-token',
                    emailOptions: [{ type: 'main', maskedEmail: 'ad***@example.com' }],
                    adminName: 'Admin User',
                },
            });

            const request = createPostRequest('/api/admin/auth/verify-credentials', {
                email: 'admin@example.com',
                password: 'SecurePass123',
            });

            const response = await verifyCredentialsPost(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.data.emailOptions).toHaveLength(1);
            expect(payload.data.emailOptions[0].type).toBe('main');
        });

        it('returns 401 for invalid credentials', async () => {
            vi.mocked(authActions.verifyCredentials).mockResolvedValue({
                success: false,
                status: 401,
                error: 'Invalid credentials',
            });

            const request = createPostRequest('/api/admin/auth/verify-credentials', {
                email: 'admin@example.com',
                password: 'WrongPassword',
            });

            const response = await verifyCredentialsPost(request);
            const payload = await response.json();

            expect(response.status).toBe(401);
            expect(payload.success).toBe(false);
            expect(payload.error).toBe('Invalid credentials');
        });

        it('returns 400 for missing email', async () => {
            vi.mocked(authActions.verifyCredentials).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Email is required',
            });

            const request = createPostRequest('/api/admin/auth/verify-credentials', {
                password: 'SecurePass123',
            });

            const response = await verifyCredentialsPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toBe('Email is required');
        });

        it('returns 400 for missing password', async () => {
            vi.mocked(authActions.verifyCredentials).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Password is required',
            });

            const request = createPostRequest('/api/admin/auth/verify-credentials', {
                email: 'admin@example.com',
            });

            const response = await verifyCredentialsPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toBe('Password is required');
        });

        it('returns 400 for invalid email format', async () => {
            vi.mocked(authActions.verifyCredentials).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Invalid email format',
            });

            const request = createPostRequest('/api/admin/auth/verify-credentials', {
                email: 'not-an-email',
                password: 'SecurePass123',
            });

            const response = await verifyCredentialsPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toBe('Invalid email format');
        });

        it('returns 400 for invalid JSON body', async () => {
            const request = new NextRequest('http://localhost/api/admin/auth/verify-credentials', {
                method: 'POST',
                body: 'not valid json',
                headers: { 'content-type': 'application/json' },
            });

            const response = await verifyCredentialsPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toBe('Invalid request body');
        });
    });

    // ============================================================
    // Step 2: Request Login OTP
    // ============================================================

    describe('POST /api/admin/auth/request-otp', () => {
        it('sends OTP to main email successfully', async () => {
            vi.mocked(authActions.requestLoginOtp).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    sent: true,
                    sentTo: 'ad***@example.com',
                    expiresIn: '5 minutes',
                },
            });

            const request = createPostRequest('/api/admin/auth/request-otp', {
                pendingToken: 'mock-jwt-token',
                targetEmail: 'main',
            });

            const response = await requestOtpPost(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(payload.data.sent).toBe(true);
            expect(payload.data.sentTo).toBe('ad***@example.com');
            expect(payload.data.expiresIn).toBe('5 minutes');
        });

        it('sends OTP to recovery email successfully', async () => {
            vi.mocked(authActions.requestLoginOtp).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    sent: true,
                    sentTo: 're***@backup.com',
                    expiresIn: '5 minutes',
                },
            });

            const request = createPostRequest('/api/admin/auth/request-otp', {
                pendingToken: 'mock-jwt-token',
                targetEmail: 'recovery',
            });

            const response = await requestOtpPost(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.data.sentTo).toBe('re***@backup.com');
        });

        it('returns 401 for invalid pending token', async () => {
            vi.mocked(authActions.requestLoginOtp).mockResolvedValue({
                success: false,
                status: 401,
                error: 'Invalid or expired pending token. Please restart login.',
            });

            const request = createPostRequest('/api/admin/auth/request-otp', {
                pendingToken: 'invalid-token',
                targetEmail: 'main',
            });

            const response = await requestOtpPost(request);
            const payload = await response.json();

            expect(response.status).toBe(401);
            expect(payload.error).toContain('Invalid or expired pending token');
        });

        it('returns 400 when recovery email is not set', async () => {
            vi.mocked(authActions.requestLoginOtp).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Recovery email is not set up. Please use main email.',
            });

            const request = createPostRequest('/api/admin/auth/request-otp', {
                pendingToken: 'mock-jwt-token',
                targetEmail: 'recovery',
            });

            const response = await requestOtpPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toContain('Recovery email is not set up');
        });

        it('returns 400 for invalid target email option', async () => {
            vi.mocked(authActions.requestLoginOtp).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Invalid target email. Must be "main" or "recovery"',
            });

            const request = createPostRequest('/api/admin/auth/request-otp', {
                pendingToken: 'mock-jwt-token',
                targetEmail: 'invalid',
            });

            const response = await requestOtpPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toContain('Invalid target email');
        });

        it('returns 500 when email service fails', async () => {
            vi.mocked(authActions.requestLoginOtp).mockResolvedValue({
                success: false,
                status: 500,
                error: 'Failed to send OTP email. Please try again.',
            });

            const request = createPostRequest('/api/admin/auth/request-otp', {
                pendingToken: 'mock-jwt-token',
                targetEmail: 'main',
            });

            const response = await requestOtpPost(request);
            const payload = await response.json();

            expect(response.status).toBe(500);
            expect(payload.error).toContain('Failed to send OTP');
        });
    });

    // ============================================================
    // Step 3: Verify Login OTP
    // ============================================================

    describe('POST /api/admin/auth/verify-otp', () => {
        it('completes login with valid OTP', async () => {
            vi.mocked(authActions.verifyLoginOtp).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    success: true,
                    redirectTo: '/admin',
                },
            });

            const request = createPostRequest('/api/admin/auth/verify-otp', {
                pendingToken: 'mock-jwt-token',
                otp: '123456',
            });

            const response = await verifyOtpPost(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(payload.data.success).toBe(true);
            expect(payload.data.redirectTo).toBe('/admin');
        });

        it('returns 400 for invalid OTP', async () => {
            vi.mocked(authActions.verifyLoginOtp).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Invalid OTP. Please try again.',
            });

            const request = createPostRequest('/api/admin/auth/verify-otp', {
                pendingToken: 'mock-jwt-token',
                otp: '000000',
            });

            const response = await verifyOtpPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toBe('Invalid OTP. Please try again.');
        });

        it('returns 400 for expired OTP', async () => {
            vi.mocked(authActions.verifyLoginOtp).mockResolvedValue({
                success: false,
                status: 400,
                error: 'OTP has expired. Please request a new one.',
            });

            const request = createPostRequest('/api/admin/auth/verify-otp', {
                pendingToken: 'mock-jwt-token',
                otp: '123456',
            });

            const response = await verifyOtpPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toContain('OTP has expired');
        });

        it('returns 400 for invalid OTP format', async () => {
            vi.mocked(authActions.verifyLoginOtp).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Invalid OTP format. Must be 6 digits.',
            });

            const request = createPostRequest('/api/admin/auth/verify-otp', {
                pendingToken: 'mock-jwt-token',
                otp: 'abc',
            });

            const response = await verifyOtpPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toContain('Invalid OTP format');
        });

        it('returns 401 for expired session token', async () => {
            vi.mocked(authActions.verifyLoginOtp).mockResolvedValue({
                success: false,
                status: 401,
                error: 'Invalid or expired session. Please restart login.',
            });

            const request = createPostRequest('/api/admin/auth/verify-otp', {
                pendingToken: 'expired-token',
                otp: '123456',
            });

            const response = await verifyOtpPost(request);
            const payload = await response.json();

            expect(response.status).toBe(401);
            expect(payload.error).toContain('Invalid or expired session');
        });

        it('returns 400 when no OTP is stored', async () => {
            vi.mocked(authActions.verifyLoginOtp).mockResolvedValue({
                success: false,
                status: 400,
                error: 'No OTP found. Please request a new one.',
            });

            const request = createPostRequest('/api/admin/auth/verify-otp', {
                pendingToken: 'mock-jwt-token',
                otp: '123456',
            });

            const response = await verifyOtpPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toContain('No OTP found');
        });
    });
});

// ============================================================
// Test Suite: Forgot Password Flow
// ============================================================

describe('Forgot Password API Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ============================================================
    // Step 1: Request Password Reset
    // ============================================================

    describe('POST /api/admin/auth/forgot-password', () => {
        it('returns success for valid email', async () => {
            vi.mocked(authActions.requestPasswordReset).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    sent: true,
                    message: 'If an account exists with this email, a password reset link has been sent.',
                },
            });

            const request = createPostRequest('/api/admin/auth/forgot-password', {
                email: 'admin@example.com',
            });

            const response = await forgotPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(payload.data.sent).toBe(true);
            expect(payload.data.message).toContain('If an account exists');
        });

        it('returns same success response for non-existent email (prevents enumeration)', async () => {
            vi.mocked(authActions.requestPasswordReset).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    sent: true,
                    message: 'If an account exists with this email, a password reset link has been sent.',
                },
            });

            const request = createPostRequest('/api/admin/auth/forgot-password', {
                email: 'nonexistent@example.com',
            });

            const response = await forgotPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(payload.data.message).toContain('If an account exists');
        });

        it('returns 400 for missing email', async () => {
            vi.mocked(authActions.requestPasswordReset).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Email is required',
            });

            const request = createPostRequest('/api/admin/auth/forgot-password', {});

            const response = await forgotPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toBe('Email is required');
        });

        it('returns 400 for invalid email format', async () => {
            vi.mocked(authActions.requestPasswordReset).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Invalid email format',
            });

            const request = createPostRequest('/api/admin/auth/forgot-password', {
                email: 'not-an-email',
            });

            const response = await forgotPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toBe('Invalid email format');
        });
    });

    // ============================================================
    // Step 2: Verify Reset Token
    // ============================================================

    describe('POST /api/admin/auth/verify-reset-token', () => {
        it('returns valid status for valid token', async () => {
            vi.mocked(authActions.verifyResetToken).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    valid: true,
                    email: 'ad***@example.com',
                },
            });

            const request = createPostRequest('/api/admin/auth/verify-reset-token', {
                token: 'valid-reset-token',
            });

            const response = await verifyResetTokenPost(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(payload.data.valid).toBe(true);
            expect(payload.data.email).toBe('ad***@example.com');
        });

        it('returns invalid status for invalid token', async () => {
            vi.mocked(authActions.verifyResetToken).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    valid: false,
                },
            });

            const request = createPostRequest('/api/admin/auth/verify-reset-token', {
                token: 'invalid-token',
            });

            const response = await verifyResetTokenPost(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.data.valid).toBe(false);
            expect(payload.data.email).toBeUndefined();
        });

        it('returns invalid status for expired token', async () => {
            vi.mocked(authActions.verifyResetToken).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    valid: false,
                },
            });

            const request = createPostRequest('/api/admin/auth/verify-reset-token', {
                token: 'expired-token',
            });

            const response = await verifyResetTokenPost(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.data.valid).toBe(false);
        });

        it('returns 400 for missing token', async () => {
            vi.mocked(authActions.verifyResetToken).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Reset token is required',
            });

            const request = createPostRequest('/api/admin/auth/verify-reset-token', {});

            const response = await verifyResetTokenPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toBe('Reset token is required');
        });
    });

    // ============================================================
    // Step 3: Reset Password
    // ============================================================

    describe('POST /api/admin/auth/reset-password', () => {
        it('resets password successfully with valid token', async () => {
            vi.mocked(authActions.resetPassword).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    success: true,
                    message: 'Password reset successfully. You can now log in with your new password.',
                },
            });

            const request = createPostRequest('/api/admin/auth/reset-password', {
                token: 'valid-reset-token',
                newPassword: 'NewSecure123',
                confirmPassword: 'NewSecure123',
            });

            const response = await resetPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(payload.data.success).toBe(true);
            expect(payload.data.message).toContain('Password reset successfully');
        });

        it('returns 400 for invalid token', async () => {
            vi.mocked(authActions.resetPassword).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Invalid or expired reset token',
            });

            const request = createPostRequest('/api/admin/auth/reset-password', {
                token: 'invalid-token',
                newPassword: 'NewSecure123',
                confirmPassword: 'NewSecure123',
            });

            const response = await resetPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toBe('Invalid or expired reset token');
        });

        it('returns 400 for expired token', async () => {
            vi.mocked(authActions.resetPassword).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Reset token has expired. Please request a new one.',
            });

            const request = createPostRequest('/api/admin/auth/reset-password', {
                token: 'expired-token',
                newPassword: 'NewSecure123',
                confirmPassword: 'NewSecure123',
            });

            const response = await resetPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toContain('expired');
        });

        it('returns 400 for password mismatch', async () => {
            vi.mocked(authActions.resetPassword).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Passwords do not match',
            });

            const request = createPostRequest('/api/admin/auth/reset-password', {
                token: 'valid-reset-token',
                newPassword: 'NewSecure123',
                confirmPassword: 'DifferentPassword',
            });

            const response = await resetPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toBe('Passwords do not match');
        });

        it('returns 400 for weak password - too short', async () => {
            vi.mocked(authActions.resetPassword).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Password must be at least 8 characters',
            });

            const request = createPostRequest('/api/admin/auth/reset-password', {
                token: 'valid-reset-token',
                newPassword: 'Short1',
                confirmPassword: 'Short1',
            });

            const response = await resetPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toContain('at least 8 characters');
        });

        it('returns 400 for weak password - no uppercase', async () => {
            vi.mocked(authActions.resetPassword).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Password must include at least one uppercase letter',
            });

            const request = createPostRequest('/api/admin/auth/reset-password', {
                token: 'valid-reset-token',
                newPassword: 'alllowercase123',
                confirmPassword: 'alllowercase123',
            });

            const response = await resetPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toContain('uppercase letter');
        });

        it('returns 400 for weak password - no lowercase', async () => {
            vi.mocked(authActions.resetPassword).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Password must include at least one lowercase letter',
            });

            const request = createPostRequest('/api/admin/auth/reset-password', {
                token: 'valid-reset-token',
                newPassword: 'ALLUPPERCASE123',
                confirmPassword: 'ALLUPPERCASE123',
            });

            const response = await resetPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toContain('lowercase letter');
        });

        it('returns 400 for weak password - no number', async () => {
            vi.mocked(authActions.resetPassword).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Password must include at least one number',
            });

            const request = createPostRequest('/api/admin/auth/reset-password', {
                token: 'valid-reset-token',
                newPassword: 'NoNumbersHere',
                confirmPassword: 'NoNumbersHere',
            });

            const response = await resetPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toContain('one number');
        });

        it('returns 400 for same password as current', async () => {
            vi.mocked(authActions.resetPassword).mockResolvedValue({
                success: false,
                status: 400,
                error: 'New password must be different from current password',
            });

            const request = createPostRequest('/api/admin/auth/reset-password', {
                token: 'valid-reset-token',
                newPassword: 'CurrentPassword123',
                confirmPassword: 'CurrentPassword123',
            });

            const response = await resetPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toContain('different from current password');
        });

        it('returns 400 for missing token', async () => {
            vi.mocked(authActions.resetPassword).mockResolvedValue({
                success: false,
                status: 400,
                error: 'Reset token is required',
            });

            const request = createPostRequest('/api/admin/auth/reset-password', {
                newPassword: 'NewSecure123',
                confirmPassword: 'NewSecure123',
            });

            const response = await resetPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toBe('Reset token is required');
        });

        it('returns 400 for missing new password', async () => {
            vi.mocked(authActions.resetPassword).mockResolvedValue({
                success: false,
                status: 400,
                error: 'New password is required',
            });

            const request = createPostRequest('/api/admin/auth/reset-password', {
                token: 'valid-reset-token',
                confirmPassword: 'NewSecure123',
            });

            const response = await resetPasswordPost(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.error).toBe('New password is required');
        });
    });
});

// ============================================================
// Test Suite: Error Handling
// ============================================================

describe('Auth API Error Handling', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('handles invalid JSON in verify-credentials', async () => {
        const request = new NextRequest('http://localhost/api/admin/auth/verify-credentials', {
            method: 'POST',
            body: 'not valid json',
            headers: { 'content-type': 'application/json' },
        });

        const response = await verifyCredentialsPost(request);
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload.error).toBe('Invalid request body');
    });

    it('handles invalid JSON in request-otp', async () => {
        const request = new NextRequest('http://localhost/api/admin/auth/request-otp', {
            method: 'POST',
            body: 'not valid json',
            headers: { 'content-type': 'application/json' },
        });

        const response = await requestOtpPost(request);
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload.error).toBe('Invalid request body');
    });

    it('handles invalid JSON in verify-otp', async () => {
        const request = new NextRequest('http://localhost/api/admin/auth/verify-otp', {
            method: 'POST',
            body: 'not valid json',
            headers: { 'content-type': 'application/json' },
        });

        const response = await verifyOtpPost(request);
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload.error).toBe('Invalid request body');
    });

    it('handles invalid JSON in forgot-password', async () => {
        const request = new NextRequest('http://localhost/api/admin/auth/forgot-password', {
            method: 'POST',
            body: 'not valid json',
            headers: { 'content-type': 'application/json' },
        });

        const response = await forgotPasswordPost(request);
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload.error).toBe('Invalid request body');
    });

    it('handles invalid JSON in verify-reset-token', async () => {
        const request = new NextRequest('http://localhost/api/admin/auth/verify-reset-token', {
            method: 'POST',
            body: 'not valid json',
            headers: { 'content-type': 'application/json' },
        });

        const response = await verifyResetTokenPost(request);
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload.error).toBe('Invalid request body');
    });

    it('handles invalid JSON in reset-password', async () => {
        const request = new NextRequest('http://localhost/api/admin/auth/reset-password', {
            method: 'POST',
            body: 'not valid json',
            headers: { 'content-type': 'application/json' },
        });

        const response = await resetPasswordPost(request);
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload.error).toBe('Invalid request body');
    });

    it('handles server errors in actions', async () => {
        vi.mocked(authActions.verifyCredentials).mockResolvedValue({
            success: false,
            status: 500,
            error: 'Failed to verify credentials',
        });

        const request = createPostRequest('/api/admin/auth/verify-credentials', {
            email: 'admin@example.com',
            password: 'SecurePass123',
        });

        const response = await verifyCredentialsPost(request);
        const payload = await response.json();

        expect(response.status).toBe(500);
        expect(payload.success).toBe(false);
    });
});

// ============================================================
// Test Suite: Edge Cases
// ============================================================

describe('Auth API Edge Cases', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('handles whitespace-only email in verify-credentials', async () => {
        vi.mocked(authActions.verifyCredentials).mockResolvedValue({
            success: false,
            status: 400,
            error: 'Email is required',
        });

        const request = createPostRequest('/api/admin/auth/verify-credentials', {
            email: '   ',
            password: 'SecurePass123',
        });

        const response = await verifyCredentialsPost(request);
        await response.json(); // consume the response

        expect(response.status).toBe(400);
    });

    it('handles whitespace-only OTP', async () => {
        vi.mocked(authActions.verifyLoginOtp).mockResolvedValue({
            success: false,
            status: 400,
            error: 'OTP is required',
        });

        const request = createPostRequest('/api/admin/auth/verify-otp', {
            pendingToken: 'mock-jwt-token',
            otp: '   ',
        });

        const response = await verifyOtpPost(request);
        await response.json(); // consume the response

        expect(response.status).toBe(400);
    });

    it('handles email with mixed case', async () => {
        vi.mocked(authActions.verifyCredentials).mockResolvedValue({
            success: true,
            status: 200,
            data: {
                pendingToken: 'mock-jwt-token',
                emailOptions: [{ type: 'main', maskedEmail: 'ad***@example.com' }],
                adminName: 'Admin User',
            },
        });

        const request = createPostRequest('/api/admin/auth/verify-credentials', {
            email: 'ADMIN@EXAMPLE.COM',
            password: 'SecurePass123',
        });

        const response = await verifyCredentialsPost(request);

        expect(response.status).toBe(200);
        expect(authActions.verifyCredentials).toHaveBeenCalledWith({
            email: 'ADMIN@EXAMPLE.COM',
            password: 'SecurePass123',
        });
    });

    it('handles OTP with leading/trailing spaces', async () => {
        vi.mocked(authActions.verifyLoginOtp).mockResolvedValue({
            success: true,
            status: 200,
            data: {
                success: true,
                redirectTo: '/admin',
            },
        });

        const request = createPostRequest('/api/admin/auth/verify-otp', {
            pendingToken: 'mock-jwt-token',
            otp: '  123456  ',
        });

        const response = await verifyOtpPost(request);

        expect(response.status).toBe(200);
    });

    it('handles very long token in reset password', async () => {
        const veryLongToken = 'a'.repeat(1000);
        
        vi.mocked(authActions.resetPassword).mockResolvedValue({
            success: false,
            status: 400,
            error: 'Invalid or expired reset token',
        });

        const request = createPostRequest('/api/admin/auth/reset-password', {
            token: veryLongToken,
            newPassword: 'NewSecure123',
            confirmPassword: 'NewSecure123',
        });

        const response = await resetPasswordPost(request);
        await response.json(); // consume the response

        expect(response.status).toBe(400);
    });

    it('handles empty request body', async () => {
        const request = createPostRequest('/api/admin/auth/verify-credentials', {});

        vi.mocked(authActions.verifyCredentials).mockResolvedValue({
            success: false,
            status: 400,
            error: 'Email is required',
        });

        const response = await verifyCredentialsPost(request);
        await response.json(); // consume the response

        expect(response.status).toBe(400);
    });
});
