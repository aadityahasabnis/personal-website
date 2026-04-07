// ========================================================
// Admin Settings Types
// ========================================================

export interface IAdminSettingsProfile {
    id: string;
    email: string;
    name: string;
    image: string | null;
    recoveryEmail: string | null;
    lastLoginAt: string | null;
    updatedAt: string;
}

export interface IUpdateAdminProfileInput {
    name: string;
    email: string;
    image?: string | null;
}

export interface IChangeAdminPasswordInput {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface IUpdateAdminRecoveryEmailInput {
    recoveryEmail?: string | null;
}