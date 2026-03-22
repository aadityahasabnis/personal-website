/**
 * @fileoverview Admin Auth - Verify Reset Token API
 * Step 2 of Password Reset Flow (Optional)
 * 
 * Checks if a password reset token is valid before showing the reset form.
 * 
 * @endpoint POST /api/admin/auth/verify-reset-token
 * 
 * -------------------------------------------------------------------
 * POSTMAN DEMO DATA
 * -------------------------------------------------------------------
 * 
 * POST /api/admin/auth/verify-reset-token
 * Content-Type: application/json
 * 
 * Request Body:
 * {
 *   "token": "a7Bx9kM2pQ4rS1tV"
 * }
 * 
 * Success Response - Valid Token (200):
 * {
 *   "success": true,
 *   "status": 200,
 *   "data": {
 *     "valid": true,
 *     "email": "ad***@example.com"
 *   }
 * }
 * 
 * Success Response - Invalid/Expired Token (200):
 * {
 *   "success": true,
 *   "status": 200,
 *   "data": {
 *     "valid": false
 *   }
 * }
 * 
 * Note: Invalid tokens return { valid: false }, not an error,
 * to allow the frontend to display appropriate messaging.
 * 
 * Error Response - Missing Token (400):
 * {
 *   "success": false,
 *   "status": 400,
 *   "error": "Reset token is required"
 * }
 * -------------------------------------------------------------------
 */

import { verifyResetToken } from '@/server/new/admin/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ============================================================
// POST - Verify Reset Token (Step 2)
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const result = await verifyResetToken({
            token: body.token,
        });
        return NextResponse.json(result, { status: result.status });
    } catch {
        return NextResponse.json(
            { success: false, status: 400, error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
