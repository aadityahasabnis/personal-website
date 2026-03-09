'use client';

import { useState, useTransition, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Globe, Mail, Code, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { PageHeader } from '@/components/admin';
import {
    updateSiteSettings,
    updateSeoSettings,
    updateSocialSettings,
    changePassword,
    getSiteSettings,
    getSeoSettings,
    getSocialSettings,
    type SiteSettings as ISiteSettings,
    type SeoSettings as ISeoSettings,
    type SocialSettings as ISocialSettings,
} from '@/server/admin/settings';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { cn } from '@/lib/utils';

type SettingsTab = 'general' | 'seo' | 'social' | 'security';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    const tabs = [
        { id: 'general' as const, label: 'General', icon: Globe },
        { id: 'seo' as const, label: 'SEO & Meta', icon: Code },
        { id: 'social' as const, label: 'Social Links', icon: Mail },
        { id: 'security' as const, label: 'Security', icon: Lock },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Settings"
                description="Manage your site configuration and preferences"
                icon={SettingsIcon}
            />

            {/* Tabs */}
            <div className="border-b border-border">
                <nav className="flex gap-6 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 px-1 py-3 border-b-2 transition-colors whitespace-nowrap',
                                    activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="max-w-3xl">
                {activeTab === 'general' && <GeneralSettings />}
                {activeTab === 'seo' && <SeoSettings />}
                {activeTab === 'social' && <SocialSettings />}
                {activeTab === 'security' && <SecuritySettings />}
            </div>
        </div>
    );
}

// ===== FEEDBACK COMPONENTS =====

function SuccessMessage({ message }: { message: string }) {
    return (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-600 flex items-center gap-2">
            <Check className="h-4 w-4" />
            {message}
        </div>
    );
}

function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {message}
        </div>
    );
}

function SaveButton({ isPending, label = 'Save Changes' }: { isPending: boolean; label?: string }) {
    return (
        <button
            type="submit"
            disabled={isPending}
            className={cn(
                'inline-flex items-center gap-2 px-6 py-2.5 rounded-lg',
                'bg-primary text-primary-foreground font-medium',
                'hover:bg-primary/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
        >
            <Save className="h-4 w-4" />
            {isPending ? 'Saving...' : label}
        </button>
    );
}

// ===== GENERAL SETTINGS =====

function GeneralSettings() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Form state with defaults from config (explicitly typed as string)
    const [siteName, setSiteName] = useState<string>(SITE_CONFIG.name);
    const [siteTitle, setSiteTitle] = useState<string>(SITE_CONFIG.title);
    const [siteDescription, setSiteDescription] = useState<string>(SITE_CONFIG.description);
    const [siteUrl, setSiteUrl] = useState<string>(SITE_CONFIG.url);
    const [contactEmail, setContactEmail] = useState<string>(SITE_CONFIG.email);
    const [authorName, setAuthorName] = useState<string>(SITE_CONFIG.author.name);
    const [authorBio, setAuthorBio] = useState<string>(SITE_CONFIG.author.bio);

    // Load saved settings on mount
    useEffect(() => {
        getSiteSettings().then((result) => {
            if (result.success && result.data) {
                setSiteName(result.data.name);
                setSiteTitle(result.data.title);
                setSiteDescription(result.data.description);
                setSiteUrl(result.data.url);
                setContactEmail(result.data.email);
                setAuthorName(result.data.author.name);
                setAuthorBio(result.data.author.bio ?? '');
            }
            setIsLoaded(true);
        });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        startTransition(async () => {
            const result = await updateSiteSettings({
                name: siteName,
                title: siteTitle,
                description: siteDescription,
                url: siteUrl,
                email: contactEmail,
                author: {
                    name: authorName,
                    email: contactEmail,
                    bio: authorBio,
                },
            });

            if (result.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(result.error || 'Failed to save settings');
            }
        });
    };

    if (!isLoaded) {
        return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorMessage message={error} />}
            {success && <SuccessMessage message="Settings saved successfully!" />}

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Site Information</h3>

                <div>
                    <label htmlFor="siteName" className="block text-sm font-medium mb-2">
                        Site Name
                    </label>
                    <input
                        id="siteName"
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                        )}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="siteTitle" className="block text-sm font-medium mb-2">
                        Site Title
                    </label>
                    <input
                        id="siteTitle"
                        type="text"
                        value={siteTitle}
                        onChange={(e) => setSiteTitle(e.target.value)}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                        )}
                        required
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        Used in page titles and browser tabs
                    </p>
                </div>

                <div>
                    <label htmlFor="siteDescription" className="block text-sm font-medium mb-2">
                        Site Description
                    </label>
                    <textarea
                        id="siteDescription"
                        value={siteDescription}
                        onChange={(e) => setSiteDescription(e.target.value)}
                        rows={3}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5 resize-none',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                        )}
                        required
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        Used in meta description and search results
                    </p>
                </div>

                <div>
                    <label htmlFor="siteUrl" className="block text-sm font-medium mb-2">
                        Site URL
                    </label>
                    <input
                        id="siteUrl"
                        type="url"
                        value={siteUrl}
                        onChange={(e) => setSiteUrl(e.target.value)}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                        )}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">
                        Contact Email
                    </label>
                    <input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                        )}
                        required
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Author Information</h3>

                <div>
                    <label htmlFor="authorName" className="block text-sm font-medium mb-2">
                        Author Name
                    </label>
                    <input
                        id="authorName"
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                        )}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="authorBio" className="block text-sm font-medium mb-2">
                        Author Bio
                    </label>
                    <textarea
                        id="authorBio"
                        value={authorBio}
                        onChange={(e) => setAuthorBio(e.target.value)}
                        rows={3}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5 resize-none',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                        )}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
                <SaveButton isPending={isPending} />
            </div>
        </form>
    );
}

// ===== SEO SETTINGS =====

function SeoSettings() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const [twitterHandle, setTwitterHandle] = useState<string>(SITE_CONFIG.seo.twitterHandle);
    const [ogImage, setOgImage] = useState<string>(SITE_CONFIG.seo.ogImage);
    const [keywords, setKeywords] = useState('');

    // Load saved settings on mount
    useEffect(() => {
        getSeoSettings().then((result) => {
            if (result.success && result.data) {
                setTwitterHandle(result.data.twitterHandle ?? '');
                setOgImage(result.data.ogImage ?? '');
                setKeywords(result.data.keywords?.join(', ') ?? '');
            }
            setIsLoaded(true);
        });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        startTransition(async () => {
            const result = await updateSeoSettings({
                twitterHandle,
                ogImage,
                keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
            });

            if (result.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(result.error || 'Failed to save SEO settings');
            }
        });
    };

    if (!isLoaded) {
        return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorMessage message={error} />}
            {success && <SuccessMessage message="SEO settings saved successfully!" />}

            <div>
                <label htmlFor="twitterHandle" className="block text-sm font-medium mb-2">
                    Twitter Handle
                </label>
                <input
                    id="twitterHandle"
                    type="text"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    placeholder="@username"
                    className={cn(
                        'w-full rounded-lg border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                    )}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    Used for Twitter Card metadata
                </p>
            </div>

            <div>
                <label htmlFor="ogImage" className="block text-sm font-medium mb-2">
                    Default OG Image URL
                </label>
                <input
                    id="ogImage"
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="/og-default.png"
                    className={cn(
                        'w-full rounded-lg border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                    )}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    Used when sharing links on social media (recommended: 1200x630px)
                </p>
            </div>

            <div>
                <label htmlFor="keywords" className="block text-sm font-medium mb-2">
                    Default Keywords
                </label>
                <input
                    id="keywords"
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="web development, programming, tutorials"
                    className={cn(
                        'w-full rounded-lg border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                    )}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    Comma-separated list of keywords
                </p>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
                <SaveButton isPending={isPending} />
            </div>
        </form>
    );
}

// ===== SOCIAL SETTINGS =====

function SocialSettings() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const [github, setGithub] = useState('');
    const [twitter, setTwitter] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [email, setEmail] = useState('');

    // Load saved settings on mount
    useEffect(() => {
        getSocialSettings().then((result) => {
            if (result.success && result.data) {
                setGithub(result.data.github ?? '');
                setTwitter(result.data.twitter ?? '');
                setLinkedin(result.data.linkedin ?? '');
                setEmail(result.data.email ?? '');
            }
            setIsLoaded(true);
        });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        startTransition(async () => {
            const result = await updateSocialSettings({
                github,
                twitter,
                linkedin,
                email,
            });

            if (result.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(result.error || 'Failed to save social links');
            }
        });
    };

    if (!isLoaded) {
        return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorMessage message={error} />}
            {success && <SuccessMessage message="Social links saved successfully!" />}

            <div>
                <label htmlFor="github" className="block text-sm font-medium mb-2">
                    GitHub Profile URL
                </label>
                <input
                    id="github"
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className={cn(
                        'w-full rounded-lg border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                    )}
                />
            </div>

            <div>
                <label htmlFor="twitter" className="block text-sm font-medium mb-2">
                    Twitter/X Profile URL
                </label>
                <input
                    id="twitter"
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/username"
                    className={cn(
                        'w-full rounded-lg border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                    )}
                />
            </div>

            <div>
                <label htmlFor="linkedin" className="block text-sm font-medium mb-2">
                    LinkedIn Profile URL
                </label>
                <input
                    id="linkedin"
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className={cn(
                        'w-full rounded-lg border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                    )}
                />
            </div>

            <div>
                <label htmlFor="socialEmail" className="block text-sm font-medium mb-2">
                    Contact Email
                </label>
                <input
                    id="socialEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    className={cn(
                        'w-full rounded-lg border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                    )}
                />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
                <SaveButton isPending={isPending} />
            </div>
        </form>
    );
}

// ===== SECURITY SETTINGS (Change Password) =====

function SecuritySettings() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password strength indicators
    const passwordChecks = {
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
    };

    const allChecksPassed = Object.values(passwordChecks).every(Boolean);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!allChecksPassed) {
            setError('Please ensure your password meets all requirements');
            return;
        }

        if (!passwordsMatch) {
            setError('Passwords do not match');
            return;
        }

        startTransition(async () => {
            const result = await changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            if (result.success) {
                setSuccess(true);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setSuccess(false), 5000);
            } else {
                setError(result.error || 'Failed to change password');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Change Password</h3>
                <p className="text-sm text-muted-foreground">
                    Update your password to keep your account secure
                </p>
            </div>

            {error && <ErrorMessage message={error} />}
            {success && <SuccessMessage message="Password changed successfully!" />}

            <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                    Current Password
                </label>
                <div className="relative">
                    <input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5 pr-10',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                        )}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                    New Password
                </label>
                <div className="relative">
                    <input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5 pr-10',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                        )}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>

                {/* Password Requirements */}
                {newPassword.length > 0 && (
                    <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Password requirements:</p>
                        <div className="grid grid-cols-2 gap-2">
                            <PasswordCheck label="At least 8 characters" passed={passwordChecks.length} />
                            <PasswordCheck label="One uppercase letter" passed={passwordChecks.uppercase} />
                            <PasswordCheck label="One lowercase letter" passed={passwordChecks.lowercase} />
                            <PasswordCheck label="One number" passed={passwordChecks.number} />
                        </div>
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                    Confirm New Password
                </label>
                <div className="relative">
                    <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5 pr-10',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            confirmPassword.length > 0 && !passwordsMatch && 'border-destructive'
                        )}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
                )}
                {passwordsMatch && (
                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Passwords match
                    </p>
                )}
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
                <button
                    type="submit"
                    disabled={isPending || !allChecksPassed || !passwordsMatch}
                    className={cn(
                        'inline-flex items-center gap-2 px-6 py-2.5 rounded-lg',
                        'bg-primary text-primary-foreground font-medium',
                        'hover:bg-primary/90 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    <Lock className="h-4 w-4" />
                    {isPending ? 'Changing...' : 'Change Password'}
                </button>
            </div>
        </form>
    );
}

// ===== PASSWORD CHECK COMPONENT =====

function PasswordCheck({ label, passed }: { label: string; passed: boolean }) {
    return (
        <div className={cn(
            'flex items-center gap-2 text-xs',
            passed ? 'text-green-600' : 'text-muted-foreground'
        )}>
            <div className={cn(
                'h-4 w-4 rounded-full flex items-center justify-center',
                passed ? 'bg-green-500/20' : 'bg-muted'
            )}>
                {passed && <Check className="h-3 w-3" />}
            </div>
            {label}
        </div>
    );
}
