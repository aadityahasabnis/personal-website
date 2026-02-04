'use client';

import { useState, useTransition } from 'react';
import { Settings as SettingsIcon, Save, User, Globe, Mail, Image, Code } from 'lucide-react';
import { PageHeader } from '@/components/admin';
import { updateSiteSettings, updateSeoSettings, updateSocialSettings } from '@/server/actions/settings';
import { SITE_CONFIG } from '@/constants';
import { cn } from '@/lib/utils';

type SettingsTab = 'general' | 'seo' | 'social' | 'appearance';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    const tabs = [
        { id: 'general' as const, label: 'General', icon: Globe },
        { id: 'seo' as const, label: 'SEO & Meta', icon: Code },
        { id: 'social' as const, label: 'Social Links', icon: Mail },
        { id: 'appearance' as const, label: 'Appearance', icon: Image },
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
                {activeTab === 'appearance' && <AppearanceSettings />}
            </div>
        </div>
    );
}

function GeneralSettings() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [siteName, setSiteName] = useState<string>(SITE_CONFIG.name);
    const [siteTitle, setSiteTitle] = useState<string>(SITE_CONFIG.title);
    const [siteDescription, setSiteDescription] = useState<string>(SITE_CONFIG.description);
    const [siteUrl, setSiteUrl] = useState<string>(SITE_CONFIG.url);
    const [contactEmail, setContactEmail] = useState<string>(SITE_CONFIG.email);
    const [authorName, setAuthorName] = useState<string>(SITE_CONFIG.author.name);
    const [authorBio, setAuthorBio] = useState<string>(SITE_CONFIG.author.bio);

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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-600">
                    Settings saved successfully!
                </div>
            )}

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
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

function SeoSettings() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [twitterHandle, setTwitterHandle] = useState<string>(SITE_CONFIG.seo.twitterHandle);
    const [ogImage, setOgImage] = useState<string>(SITE_CONFIG.seo.ogImage);
    const [keywords, setKeywords] = useState<string>('');

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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-600">
                    SEO settings saved successfully!
                </div>
            )}

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
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

function SocialSettings() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [github, setGithub] = useState('https://github.com/aadityahasabnis');
    const [twitter, setTwitter] = useState('https://twitter.com/aadityahasabnis');
    const [linkedin, setLinkedin] = useState('https://linkedin.com/in/aadityahasabnis');
    const [email, setEmail] = useState('mailto:hello@aadityahasabnis.site');

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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-600">
                    Social links saved successfully!
                </div>
            )}

            <div>
                <label htmlFor="github" className="block text-sm font-medium mb-2">
                    GitHub Profile URL
                </label>
                <input
                    id="github"
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
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
                    className={cn(
                        'w-full rounded-lg border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                    )}
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Contact Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                        'w-full rounded-lg border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                    )}
                />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
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
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

function AppearanceSettings() {
    return (
        <div className="rounded-lg border bg-card p-6">
            <p className="text-muted-foreground">
                Appearance settings (theme customization, color schemes) coming soon...
            </p>
        </div>
    );
}
