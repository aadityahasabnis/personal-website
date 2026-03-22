/**
 * @fileoverview Admin Auth - Forgot Password API
 * Step 1 of Password Reset Flow
 * 
 * Generates reset token and sends email. Always returns success
 * to prevent email enumeration.
 * 
 * @endpoint POST /api/admin/auth/forgot-password
 * 
 * -------------------------------------------------------------------
 * POSTMAN DEMO DATA
 * -------------------------------------------------------------------
 * 
 * POST /api/admin/auth/forgot-password
 * Content-Type: application/json
 * 
 * Request Body:
 * {
 *   "email": "admin@example.com"
 * }
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "status": 200,
 *   "data": {
 *     "sent": true,
 *     "message": "If an account exists with this email, a password reset link has been sent."
 *   }
 * }
 * 
 * Note: This endpoint always returns 200 with the same message
 * regardless of whether the email exists, to prevent email enumeration.
 * 
 * Error Response - Missing Email (400):
 * {
 *   "success": false,
 *   "status": 400,
 *   "error": "Email is required"
 * }
 * 
 * Error Response - Invalid Format (400):
 * {
 *   "success": false,
 *   "status": 400,
 *   "error": "Invalid email format"
 * }
 * -------------------------------------------------------------------
 */

import { requestPasswordReset } from '@/server/new/admin/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ============================================================
// POST - Request Password Reset (Step 1)
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const result = await requestPasswordReset({
            email: body.email,
        });
        return NextResponse.json(result, { status: result.status });
    } catch {
        return NextResponse.json(
            { success: false, status: 400, error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
