import { Suspense } from 'react';
import Link from 'next/link';
import {
    FileText,
    BookOpen,
    FolderKanban,
    Eye,
    Heart,
    Users,
    TrendingUp,
    Plus,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getRecentArticles } from '@/server/queries/content';
import { getProjects } from '@/server/queries/projects';
import { formatDate, formatNumber } from '@/lib/utils';

/**
 * Admin Dashboard
 *
 * Overview of site content and stats
 */

interface IStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: IStatCardProps): React.ReactElement => (
    <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
                {trend && (
                    <p className={cn(
                        'mt-1 flex items-center gap-1 text-xs',
                        trendUp ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                    )}>
                        {trendUp && <TrendingUp className="h-3 w-3" />}
                        {trend}
                    </p>
                )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
            </div>
        </div>
    </div>
);

const DashboardStats = async (): Promise<React.ReactElement> => {
    const [articles, projects] = await Promise.all([
        getRecentArticles(100),
        getProjects(),
    ]);

    const publishedArticles = articles.filter(a => a.published).length;
    const draftArticles = articles.length - publishedArticles;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Published Articles"
                value={publishedArticles}
                icon={FileText}
                trend={`${draftArticles} drafts`}
            />
            <StatCard
                title="Projects"
                value={projects.length}
                icon={FolderKanban}
            />
            <StatCard
                title="Total Views"
                value="—"
                icon={Eye}
                trend="Coming soon"
            />
            <StatCard
                title="Total Likes"
                value="—"
                icon={Heart}
                trend="Coming soon"
            />
        </div>
    );
};

const RecentContent = async (): Promise<React.ReactElement> => {
    const articles = await getRecentArticles(5);

    return (
        <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b p-4">
                <h2 className="font-semibold">Recent Articles</h2>
                <Link
                    href="/admin/articles"
                    className="text-sm text-primary hover:underline"
                >
                    View all
                </Link>
            </div>
            <div className="divide-y">
                {articles.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p>No articles yet</p>
                        <Link
                            href="/admin/articles/new"
                            className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            <Plus className="h-4 w-4" />
                            Create your first article
                        </Link>
                    </div>
                ) : (
                    articles.map((article) => (
                        <Link
                            key={article.slug}
                            href={`/admin/articles/${article.slug}/edit`}
                            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{article.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {article.published ? (
                                        <>Published {formatDate(article.publishedAt)}</>
                                    ) : (
                                        <span className="text-amber-600 dark:text-amber-400">Draft</span>
                                    )}
                                </p>
                            </div>
                            <div className="ml-4 flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    —
                                </span>
                                <span className="flex items-center gap-1">
                                    <Heart className="h-4 w-4" />
                                    —
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

const QuickActions = (): React.ReactElement => (
    <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-4 font-semibold">Quick Actions</h2>
        <div className="grid gap-2 sm:grid-cols-2">
            <Link
                href="/admin/articles/new"
                className={cn(
                    'flex items-center gap-3 rounded-lg border border-dashed p-4',
                    'hover:border-primary hover:bg-primary/5 transition-colors'
                )}
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <FileText className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-medium">New Article</p>
                    <p className="text-sm text-muted-foreground">Write a blog post</p>
                </div>
            </Link>
            <Link
                href="/admin/notes/new"
                className={cn(
                    'flex items-center gap-3 rounded-lg border border-dashed p-4',
                    'hover:border-primary hover:bg-primary/5 transition-colors'
                )}
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <BookOpen className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-medium">New Note</p>
                    <p className="text-sm text-muted-foreground">Quick TIL note</p>
                </div>
            </Link>
            <Link
                href="/admin/projects/new"
                className={cn(
                    'flex items-center gap-3 rounded-lg border border-dashed p-4',
                    'hover:border-primary hover:bg-primary/5 transition-colors'
                )}
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <FolderKanban className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-medium">New Project</p>
                    <p className="text-sm text-muted-foreground">Showcase your work</p>
                </div>
            </Link>
            <Link
                href="/admin/subscribers"
                className={cn(
                    'flex items-center gap-3 rounded-lg border border-dashed p-4',
                    'hover:border-primary hover:bg-primary/5 transition-colors'
                )}
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <Users className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-medium">Subscribers</p>
                    <p className="text-sm text-muted-foreground">Manage your list</p>
                </div>
            </Link>
        </div>
    </div>
);

const AdminDashboardPage = (): React.ReactElement => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here&apos;s an overview of your site.
                </p>
            </div>

            {/* Stats */}
            <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-muted" />}>
                <DashboardStats />
            </Suspense>

            {/* Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Content */}
                <div className="lg:col-span-2">
                    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
                        <RecentContent />
                    </Suspense>
                </div>

                {/* Quick Actions */}
                <div>
                    <QuickActions />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
