// ============================================================
// Auth Flow Types - Two-Step Login & Forgot Password
// ============================================================

// ============================================================
// Email Target Options
// ============================================================

/** Target email options for OTP delivery */
export type OtpTargetEmail = 'main' | 'recovery';

// ============================================================
// Verify Credentials (Step 1 of Login)
// ============================================================

export interface IVerifyCredentialsInput {
    /** Admin email address */
    email: string;
    /** Admin password */
    password: string;
}

export interface IEmailOption {
    /** Type of email ('main' or 'recovery') */
    type: OtpTargetEmail;
    /** Masked email for display (e.g., "ad***@gmail.com") */
    maskedEmail: string;
}

export interface IVerifyCredentialsResult {
    /** Temporary JWT token for OTP flow (valid for 5 minutes) */
    pendingToken: string;
    /** Available email options for OTP delivery */
    emailOptions: IEmailOption[];
    /** Admin name for personalized UI */
    adminName: string;
}

// ============================================================
// Request Login OTP (Step 2 of Login)
// ============================================================

export interface IRequestLoginOtpInput {
    /** Pending login token from Step 1 */
    pendingToken: string;
    /** Target email to send OTP to ('main' or 'recovery') */
    targetEmail: OtpTargetEmail;
}

export interface IRequestLoginOtpResult {
    /** Whether OTP was sent successfully */
    sent: boolean;
    /** Masked email OTP was sent to */
    sentTo: string;
    /** OTP expiry time in human-readable format */
    expiresIn: string;
}

// ============================================================
// Verify Login OTP (Step 3 of Login)
// ============================================================

export interface IVerifyLoginOtpInput {
    /** Pending login token from Step 1 */
    pendingToken: string;
    /** 6-digit OTP code entered by user */
    otp: string;
}

export interface IVerifyLoginOtpResult {
    /** Whether login was successful */
    success: boolean;
    /** Redirect URL after successful login */
    redirectTo: string;
}

// ============================================================
// Request Password Reset (Forgot Password Step 1)
// ============================================================

export interface IRequestPasswordResetInput {
    /** Admin email address */
    email: string;
}

export interface IRequestPasswordResetResult {
    /** Always true to prevent email enumeration */
    sent: boolean;
    /** Generic message (same regardless of email existence) */
    message: string;
}

// ============================================================
// Verify Reset Token (Forgot Password Step 2 - Optional check)
// ============================================================

export interface IVerifyResetTokenInput {
    /** Password reset token from email link */
    token: string;
}

export interface IVerifyResetTokenResult {
    /** Whether token is valid and not expired */
    valid: boolean;
    /** Admin email (only if valid) */
    email?: string;
}

// ============================================================
// Reset Password (Forgot Password Step 3)
// ============================================================

export interface IResetPasswordInput {
    /** Password reset token from email link */
    token: string;
    /** New password */
    newPassword: string;
    /** Confirm new password */
    confirmPassword: string;
}

export interface IResetPasswordResult {
    /** Whether password was reset successfully */
    success: boolean;
    /** Success message */
    message: string;
}
