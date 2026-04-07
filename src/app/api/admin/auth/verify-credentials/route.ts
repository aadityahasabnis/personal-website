/**
 * @fileoverview Admin Auth - Verify Credentials API
 * Step 1 of Two-Step Login Flow
 * 
 * Validates admin email/password and returns a temporary JWT token
 * along with email options for OTP delivery.
 * 
 * @endpoint POST /api/admin/auth/verify-credentials
 * 
 * -------------------------------------------------------------------
 * POSTMAN DEMO DATA
 * -------------------------------------------------------------------
 * 
 * POST /api/admin/auth/verify-credentials
 * Content-Type: application/json
 * 
 * Request Body:
 * {
 *   "email": "admin@example.com",
 *   "password": "SecurePassword123"
 * }
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "status": 200,
 *   "data": {
 *     "pendingToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "emailOptions": [
 *       { "type": "main", "maskedEmail": "ad***@example.com" },
 *       { "type": "recovery", "maskedEmail": "re***@backup.com" }
 *     ],
 *     "adminName": "Admin User"
 *   }
 * }
 * 
 * Error Response - Invalid Credentials (401):
 * {
 *   "success": false,
 *   "status": 401,
 *   "error": "Invalid credentials"
 * }
 * 
 * Error Response - Missing Fields (400):
 * {
 *   "success": false,
 *   "status": 400,
 *   "error": "Email is required"
 * }
 * -------------------------------------------------------------------
 */

import { verifyCredentials } from '@/server/new/admin/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ============================================================
// POST - Verify Credentials (Step 1)
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const result = await verifyCredentials({
            email: body.email,
            password: body.password,
        });
        return NextResponse.json(result, { status: result.status });
    } catch {
        return NextResponse.json(
            { success: false, status: 400, error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
