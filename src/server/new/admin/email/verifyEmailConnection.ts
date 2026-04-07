'use server';

// ============================================================
// Verify Email Connection - Test SMTP connection status
// ============================================================

import type { IApiResponse } from '@/interfaces/actionHelper';
import { isEmailConfigured, verifyConnection } from '../../utils/mail';
import { handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import type { IEmailConnectionStatus } from './types';

export const verifyEmailConnection = async (): Promise<IApiResponse<IEmailConnectionStatus>> => {
    try {
        // Require admin authentication
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        // Check if email is configured
        const configured = isEmailConfigured();
        if (!configured) {
            return success({
                connected: false,
                configured: false,
                lastChecked: new Date().toISOString(),
                error: 'Email service not configured. Please set GMAIL_ACCOUNT and GMAIL_PASSWORD.',
            });
        }

        // Verify SMTP connection
        const connected = await verifyConnection();

        return success({
            connected,
            configured: true,
            lastChecked: new Date().toISOString(),
            ...(connected ? {} : { error: 'SMTP connection failed. Please check credentials.' }),
        });
    } catch (err) {
        return handleError(err, 'Failed to verify email connection');
    }
};
