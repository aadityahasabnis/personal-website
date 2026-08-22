'use client';

import { useState } from 'react';

import { type LucideIcon, KeyRound, Loader2, Mail, Save, Shield, User } from 'lucide-react';

import type { IFieldConfig } from '@/components/form';
import { renderField } from '@/components/form/FormWrapper';
import type { IFormData } from '@/components/form/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormOperations, useSnackbar } from '@/hooks/form';
import { formatDateTime } from '@/lib/utils';
import {
    changeAdminPassword,
    type IAdminSettingsProfile,
    type IChangeAdminPasswordInput,
    type IUpdateAdminProfileInput,
    type IUpdateAdminRecoveryEmailInput,
    updateAdminProfile,
    updateAdminRecoveryEmail,
} from '@/server/new/admin/settings';

// =============================================================
// Form Data Types
// =============================================================

interface IProfileFormData extends IFormData {
    name: string;
    email: string;
    image: string;
}

interface IPasswordFormData extends IFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface IRecoveryEmailFormData extends IFormData {
    recoveryEmail: string;
}

// =============================================================
// Field Configurations
// =============================================================

const profileFields: Array<IFieldConfig<IProfileFormData>> = [
    {
        fieldtype: 'input',
        name: 'name',
        label: 'Name',
        placeholder: 'Your display name',
        required: true,
        colsize: 'full',
    },
    {
        fieldtype: 'input',
        name: 'email',
        label: 'Email',
        placeholder: 'your@email.com',
        type: 'email',
        required: true,
        colsize: 'full',
    },
    {
        fieldtype: 'input',
        name: 'image',
        label: 'Profile Image URL',
        placeholder: 'https://example.com/avatar.jpg',
        type: 'url',
        hint: 'Optional. URL to your profile image.',
        colsize: 'full',
    },
];

const passwordFields: Array<IFieldConfig<IPasswordFormData>> = [
    {
        fieldtype: 'input',
        name: 'currentPassword',
        label: 'Current Password',
        placeholder: 'Enter your current password',
        type: 'password',
        allowPasswordToggle: true,
        required: true,
        colsize: 'full',
    },
    {
        fieldtype: 'input',
        name: 'newPassword',
        label: 'New Password',
        placeholder: 'Enter a strong password',
        type: 'password',
        allowPasswordToggle: true,
        required: true,
        hint: 'At least 8 characters with uppercase, lowercase, and number.',
        colsize: 'full',
    },
    {
        fieldtype: 'input',
        name: 'confirmPassword',
        label: 'Confirm New Password',
        placeholder: 'Re-enter your new password',
        type: 'password',
        allowPasswordToggle: true,
        required: true,
        colsize: 'full',
    },
];

const recoveryEmailFields: Array<IFieldConfig<IRecoveryEmailFormData>> = [
    {
        fieldtype: 'input',
        name: 'recoveryEmail',
        label: 'Recovery Email',
        placeholder: 'backup@email.com',
        type: 'email',
        hint: 'Optional. Used for account recovery. Cannot be the same as your primary email.',
        colsize: 'full',
    },
];

// =============================================================
// Props
// =============================================================

interface ISettingsFormProps {
    profile: IAdminSettingsProfile;
}

// =============================================================
// Section Card Component
// =============================================================

interface ISectionCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const SectionCard = ({ icon: Icon, title, description, children, footer }: ISectionCardProps) => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            {children}
        </CardContent>
        {footer && (
            <div className="flex items-center justify-end border-t px-6 py-4">
                {footer}
            </div>
        )}
    </Card>
);

// =============================================================
// Settings Form Component
// =============================================================

export const SettingsForm = ({ profile }: ISettingsFormProps): React.ReactElement => {
    const { triggerActionSnackbar } = useSnackbar();

    // =============================================================
    // Profile Form State
    // =============================================================

    const profileInitialData: IProfileFormData = {
        name: profile.name,
        email: profile.email,
        image: profile.image ?? '',
    };

    const {
        formData: profileData,
        handleChange: handleProfileChange,
        isModified: isProfileModified,
    } = useFormOperations<IProfileFormData>(profileInitialData);

    const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

    const handleProfileSubmit = async () => {
        setIsProfileSubmitting(true);
        try {
            const input: IUpdateAdminProfileInput = {
                name: profileData.name,
                email: profileData.email,
                image: profileData.image || null,
            };

            const result = await triggerActionSnackbar(updateAdminProfile(input), {
                loadingMessage: 'Updating profile...',
                successMessage: 'Profile updated successfully',
                errorMessage: 'Failed to update profile',
            });

            if (result.success) {
                // Profile updated - the page will revalidate
            }
        } finally {
            setIsProfileSubmitting(false);
        }
    };

    // =============================================================
    // Password Form State
    // =============================================================

    const passwordInitialData: IPasswordFormData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    };

    const {
        formData: passwordData,
        handleChange: handlePasswordChange,
        isModified: isPasswordModified,
        resetForm: resetPassword,
    } = useFormOperations<IPasswordFormData>(passwordInitialData);

    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

    const handlePasswordSubmit = async () => {
        setIsPasswordSubmitting(true);
        try {
            const input: IChangeAdminPasswordInput = {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword,
            };

            const result = await triggerActionSnackbar(changeAdminPassword(input), {
                loadingMessage: 'Changing password...',
                successMessage: 'Password changed successfully',
                errorMessage: 'Failed to change password',
            });

            if (result.success) {
                resetPassword();
            }
        } finally {
            setIsPasswordSubmitting(false);
        }
    };

    // =============================================================
    // Recovery Email Form State
    // =============================================================

    const recoveryEmailInitialData: IRecoveryEmailFormData = {
        recoveryEmail: profile.recoveryEmail ?? '',
    };

    const {
        formData: recoveryEmailData,
        handleChange: handleRecoveryEmailChange,
        isModified: isRecoveryEmailModified,
    } = useFormOperations<IRecoveryEmailFormData>(recoveryEmailInitialData);

    const [isRecoveryEmailSubmitting, setIsRecoveryEmailSubmitting] = useState(false);

    const handleRecoveryEmailSubmit = async () => {
        setIsRecoveryEmailSubmitting(true);
        try {
            const input: IUpdateAdminRecoveryEmailInput = {
                recoveryEmail: recoveryEmailData.recoveryEmail || null,
            };

            const result = await triggerActionSnackbar(updateAdminRecoveryEmail(input), {
                loadingMessage: 'Updating recovery email...',
                successMessage: 'Recovery email updated successfully',
                errorMessage: 'Failed to update recovery email',
            });

            if (result.success) {
                // Recovery email updated - the page will revalidate
            }
        } finally {
            setIsRecoveryEmailSubmitting(false);
        }
    };

    // =============================================================
    // Render
    // =============================================================

    return (
        <div className="space-y-6">
            {/* Profile Section */}
            <SectionCard
                icon={User}
                title="Profile Information"
                description="Update your display name, email, and profile image."
                footer={
                    <Button
                        onClick={handleProfileSubmit}
                        disabled={!isProfileModified || isProfileSubmitting}
                        size="sm"
                        className="gap-1.5"
                    >
                        {isProfileSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="size-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-6">
                    {profileFields.map((field, index) =>
                        renderField(profileData, handleProfileChange, field, index)
                    )}
                </div>
            </SectionCard>

            {/* Password Section */}
            <SectionCard
                icon={KeyRound}
                title="Change Password"
                description="Update your password. Make sure it's strong and unique."
                footer={
                    <Button
                        onClick={handlePasswordSubmit}
                        disabled={!isPasswordModified || isPasswordSubmitting}
                        size="sm"
                        className="gap-1.5"
                    >
                        {isPasswordSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Changing...
                            </>
                        ) : (
                            <>
                                <KeyRound className="size-4" />
                                Change Password
                            </>
                        )}
                    </Button>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-6">
                    {passwordFields.map((field, index) =>
                        renderField(passwordData, handlePasswordChange, field, index)
                    )}
                </div>
            </SectionCard>

            {/* Recovery Email Section */}
            <SectionCard
                icon={Shield}
                title="Account Recovery"
                description="Set a recovery email for account access in case you forget your password."
                footer={
                    <Button
                        onClick={handleRecoveryEmailSubmit}
                        disabled={!isRecoveryEmailModified || isRecoveryEmailSubmitting}
                        size="sm"
                        className="gap-1.5"
                    >
                        {isRecoveryEmailSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Mail className="size-4" />
                                Update Recovery Email
                            </>
                        )}
                    </Button>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-6">
                    {recoveryEmailFields.map((field, index) =>
                        renderField(recoveryEmailData, handleRecoveryEmailChange, field, index)
                    )}
                </div>
            </SectionCard>

            {/* Account Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <User className="size-5" />
                        </div>
                        <div>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>Read-only account details.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-muted-foreground">Account ID</dt>
                            <dd className="font-mono text-foreground">{profile.id}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Last Login</dt>
                            <dd className="text-foreground">
                                {profile.lastLoginAt ? formatDateTime(profile.lastLoginAt) : 'Never'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Last Updated</dt>
                            <dd className="text-foreground">
                                {formatDateTime(profile.updatedAt)}
                            </dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsForm;
