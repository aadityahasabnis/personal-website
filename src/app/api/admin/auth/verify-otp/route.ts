/**
 * @fileoverview Admin Auth - Verify Login OTP API
 * Step 3 of Two-Step Login Flow
 * 
 * Validates OTP and completes login by creating NextAuth session.
 * 
 * @endpoint POST /api/admin/auth/verify-otp
 * 
 * -------------------------------------------------------------------
 * POSTMAN DEMO DATA
 * -------------------------------------------------------------------
 * 
 * POST /api/admin/auth/verify-otp
 * Content-Type: application/json
 * 
 * Request Body:
 * {
 *   "pendingToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "otp": "123456"
 * }
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "status": 200,
 *   "data": {
 *     "success": true,
 *     "redirectTo": "/admin"
 *   }
 * }
 * 
 * Error Response - Invalid OTP (400):
 * {
 *   "success": false,
 *   "status": 400,
 *   "error": "Invalid OTP. Please try again."
 * }
 * 
 * Error Response - Expired OTP (400):
 * {
 *   "success": false,
 *   "status": 400,
 *   "error": "OTP has expired. Please request a new one."
 * }
 * 
 * Error Response - Invalid Token (401):
 * {
 *   "success": false,
 *   "status": 401,
 *   "error": "Invalid or expired session. Please restart login."
 * }
 * -------------------------------------------------------------------
 */

import { verifyLoginOtp } from '@/server/new/admin/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ============================================================
// POST - Verify Login OTP (Step 3)
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const result = await verifyLoginOtp({
            pendingToken: body.pendingToken,
            otp: body.otp,
        });
        return NextResponse.json(result, { status: result.status });
    } catch {
        return NextResponse.json(
            { success: false, status: 400, error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
