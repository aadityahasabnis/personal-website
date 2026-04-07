// ============================================================
// Admin Auth Server Actions - Index
// Two-Step Login Flow & Forgot Password Flow
// ============================================================

// Two-Step Login Flow
export { verifyCredentials } from './verifyCredentials';
export { requestLoginOtp } from './requestLoginOtp';
export { verifyLoginOtp } from './verifyLoginOtp';

// Forgot Password Flow
export { requestPasswordReset } from './requestPasswordReset';
export { verifyResetToken } from './verifyResetToken';
export { resetPassword } from './resetPassword';

// Types
export type {
    // Email Target
    OtpTargetEmail,
    // Verify Credentials
    IVerifyCredentialsInput,
    IVerifyCredentialsResult,
    IEmailOption,
    // Request Login OTP
    IRequestLoginOtpInput,
    IRequestLoginOtpResult,
    // Verify Login OTP
    IVerifyLoginOtpInput,
    IVerifyLoginOtpResult,
    // Request Password Reset
    IRequestPasswordResetInput,
    IRequestPasswordResetResult,
    // Verify Reset Token
    IVerifyResetTokenInput,
    IVerifyResetTokenResult,
    // Reset Password
    IResetPasswordInput,
    IResetPasswordResult,
} from './types';
