/**
 * @fileoverview Admin Auth - Reset Password API
 * Step 3 of Password Reset Flow
 * 
 * Validates token and updates admin password.
 * 
 * @endpoint POST /api/admin/auth/reset-password
 * 
 * -------------------------------------------------------------------
 * POSTMAN DEMO DATA
 * -------------------------------------------------------------------
 * 
 * POST /api/admin/auth/reset-password
 * Content-Type: application/json
 * 
 * Request Body:
 * {
 *   "token": "a7Bx9kM2pQ4rS1tV",
 *   "newPassword": "NewSecure123",
 *   "confirmPassword": "NewSecure123"
 * }
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "status": 200,
 *   "data": {
 *     "success": true,
 *     "message": "Password reset successfully. You can now log in with your new password."
 *   }
 * }
 * 
 * Error Response - Invalid Token (400):
 * {
 *   "success": false,
 *   "status": 400,
 *   "error": "Invalid or expired reset token"
 * }
 * 
 * Error Response - Weak Password (400):
 * {
 *   "success": false,
 *   "status": 400,
 *   "error": "Password must be at least 8 characters"
 * }
 * 
 * Error Response - Passwords Don't Match (400):
 * {
 *   "success": false,
 *   "status": 400,
 *   "error": "Passwords do not match"
 * }
 * 
 * Error Response - Same as Current (400):
 * {
 *   "success": false,
 *   "status": 400,
 *   "error": "New password must be different from current password"
 * }
 * -------------------------------------------------------------------
 */

import { resetPassword } from '@/server/new/admin/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ============================================================
// POST - Reset Password (Step 3)
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const result = await resetPassword({
            token: body.token,
            newPassword: body.newPassword,
            confirmPassword: body.confirmPassword,
        });
        return NextResponse.json(result, { status: result.status });
    } catch {
        return NextResponse.json(
            { success: false, status: 400, error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
