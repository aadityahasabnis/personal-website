/**
 * @fileoverview Admin Auth - Request Login OTP API
 * Step 2 of Two-Step Login Flow
 * 
 * Generates OTP, stores in database, and sends to chosen email address.
 * Requires valid pending token from Step 1.
 * 
 * @endpoint POST /api/admin/auth/request-otp
 * 
 * -------------------------------------------------------------------
 * POSTMAN DEMO DATA
 * -------------------------------------------------------------------
 * 
 * POST /api/admin/auth/request-otp
 * Content-Type: application/json
 * 
 * Request Body:
 * {
 *   "pendingToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "targetEmail": "main"
 * }
 * 
 * Note: targetEmail can be "main" or "recovery"
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "status": 200,
 *   "data": {
 *     "sent": true,
 *     "sentTo": "ad***@example.com",
 *     "expiresIn": "5 minutes"
 *   }
 * }
 * 
 * Error Response - Invalid Token (401):
 * {
 *   "success": false,
 *   "status": 401,
 *   "error": "Invalid or expired pending token. Please restart login."
 * }
 * 
 * Error Response - Recovery Not Set (400):
 * {
 *   "success": false,
 *   "status": 400,
 *   "error": "Recovery email is not set up. Please use main email."
 * }
 * -------------------------------------------------------------------
 */

import { requestLoginOtp } from '@/server/new/admin/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ============================================================
// POST - Request Login OTP (Step 2)
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const result = await requestLoginOtp({
            pendingToken: body.pendingToken,
            targetEmail: body.targetEmail,
        });
        return NextResponse.json(result, { status: result.status });
    } catch {
        return NextResponse.json(
            { success: false, status: 400, error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
