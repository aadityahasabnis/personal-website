import { Suspense } from 'react';
import { BarChart3, Eye, Heart, MessageSquare, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/admin';
import { getAnalyticsDashboardData } from '@/server/queries/analytics';
import { cn } from '@/lib/utils';

export const metadata = {
    title: 'Analytics | Admin Dashboard',
    description: 'View analytics and insights for your personal website',
};

export default async function AnalyticsPage() {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Analytics"
                description="View insights and performance metrics for your content"
                icon={BarChart3}
            />

            <Suspense fallback={<LoadingSkeleton />}>
                <AnalyticsDashboard />
            </Suspense>
        </div>
    );
}

async function AnalyticsDashboard() {
    const data = await getAnalyticsDashboardData();

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Views"
                    value={data.totalViews.toLocaleString()}
                    icon={Eye}
                    trend={data.viewsTrend}
                    color="blue"
                />
                <StatCard
                    title="Total Likes"
                    value={data.totalLikes.toLocaleString()}
                    icon={Heart}
                    trend={data.likesTrend}
                    color="red"
                />
                <StatCard
                    title="Total Comments"
                    value={data.totalComments.toLocaleString()}
                    icon={MessageSquare}
                    trend={data.commentsTrend}
                    color="green"
                />
                <StatCard
                    title="Subscribers"
                    value={data.totalSubscribers.toLocaleString()}
                    icon={Users}
                    trend={data.subscribersTrend}
                    color="purple"
                />
            </div>

            {/* Most Viewed Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Viewed Articles */}
                <div className="rounded-lg border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Most Viewed Articles
                    </h2>
                    <div className="space-y-3">
                        {data.topArticles.map((article, index) => (
                            <div
                                key={article.slug}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="flex-shrink-0 text-sm font-bold text-muted-foreground w-6">
                                        #{index + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">{article.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {article.slug}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">
                                            {article.views.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">views</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-red-600">
                                            {article.likes.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">likes</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {data.topArticles.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No article views yet
                            </p>
                        )}
                    </div>
                </div>

                {/* Most Viewed Pages */}
                <div className="rounded-lg border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Most Viewed Pages
                    </h2>
                    <div className="space-y-3">
                        {data.topPages.map((page, index) => (
                            <div
                                key={page.slug}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="flex-shrink-0 text-sm font-bold text-muted-foreground w-6">
                                        #{index + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">
                                            {page.slug || 'Homepage'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">
                                            {page.views.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">views</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-red-600">
                                            {page.likes.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">likes</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {data.topPages.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No page views yet
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    {data.recentActivity.map((activity, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-shrink-0">
                                {activity.type === 'view' && (
                                    <div className="p-2 rounded-full bg-blue-500/10">
                                        <Eye className="h-4 w-4 text-blue-600" />
                                    </div>
                                )}
                                {activity.type === 'like' && (
                                    <div className="p-2 rounded-full bg-red-500/10">
                                        <Heart className="h-4 w-4 text-red-600" />
                                    </div>
                                )}
                                {activity.type === 'comment' && (
                                    <div className="p-2 rounded-full bg-green-500/10">
                                        <MessageSquare className="h-4 w-4 text-green-600" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{activity.title}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {activity.slug}
                                </p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <p className="text-xs text-muted-foreground">
                                    {activity.timestamp}
                                </p>
                            </div>
                        </div>
                    ))}
                    {data.recentActivity.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No recent activity
                        </p>
                    )}
                </div>
            </div>

            {/* Content Performance */}
            <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Content Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Published Articles</p>
                        <p className="text-3xl font-bold">{data.publishedArticles}</p>
                        <p className="text-xs text-green-600">
                            {data.draftArticles} drafts
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Published Notes</p>
                        <p className="text-3xl font-bold">{data.publishedNotes}</p>
                        <p className="text-xs text-green-600">
                            {data.draftNotes} drafts
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Published Projects</p>
                        <p className="text-3xl font-bold">{data.publishedProjects}</p>
                        <p className="text-xs text-green-600">
                            {data.draftProjects} drafts
                        </p>
                    </div>
                </div>
            </div>

            {/* Engagement Metrics */}
            <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Engagement Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Avg. Views per Article</p>
                        <p className="text-2xl font-bold">
                            {data.avgViewsPerArticle.toFixed(1)}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Avg. Likes per Article</p>
                        <p className="text-2xl font-bold">
                            {data.avgLikesPerArticle.toFixed(1)}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Like Rate</p>
                        <p className="text-2xl font-bold">
                            {data.likeRate.toFixed(2)}%
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Pending Comments</p>
                        <p className="text-2xl font-bold text-amber-600">
                            {data.pendingComments}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: number;
    color: 'blue' | 'red' | 'green' | 'purple';
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-600',
        red: 'bg-red-500/10 text-red-600',
        green: 'bg-green-500/10 text-green-600',
        purple: 'bg-purple-500/10 text-purple-600',
    };

    const trendColorClasses = trend && trend > 0
        ? 'text-green-600'
        : trend && trend < 0
            ? 'text-red-600'
            : 'text-muted-foreground';

    return (
        <div className="rounded-lg border bg-card p-6 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{title}</p>
                <div className={cn('p-2 rounded-lg', colorClasses[color])}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div>
                <p className="text-3xl font-bold">{value}</p>
                {trend !== undefined && (
                    <p className={cn('text-xs mt-1', trendColorClasses)}>
                        {trend > 0 && '+'}
                        {trend.toFixed(1)}% from last month
                    </p>
                )}
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-6 animate-pulse">
                        <div className="h-4 bg-muted rounded w-24 mb-4" />
                        <div className="h-8 bg-muted rounded w-32" />
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-6 animate-pulse">
                        <div className="h-6 bg-muted rounded w-48 mb-4" />
                        <div className="space-y-3">
                            {[...Array(5)].map((_, j) => (
                                <div key={j} className="h-16 bg-muted rounded" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
