import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IArticle, INote, IProject, IArticleStats, IPageStats, IComment, ISubscriber } from '@/interfaces';

/**
 * Analytics Queries for Admin Dashboard
 */

export interface IAnalyticsDashboardData {
    // Overview stats
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalSubscribers: number;

    // Trends (percentage change from last month)
    viewsTrend: number;
    likesTrend: number;
    commentsTrend: number;
    subscribersTrend: number;

    // Top content
    topArticles: Array<{
        slug: string;
        title: string;
        views: number;
        likes: number;
    }>;
    topPages: Array<{
        slug: string;
        views: number;
        likes: number;
    }>;

    // Recent activity
    recentActivity: Array<{
        type: 'view' | 'like' | 'comment';
        slug: string;
        title: string;
        timestamp: string;
    }>;

    // Content counts
    publishedArticles: number;
    draftArticles: number;
    publishedNotes: number;
    draftNotes: number;
    publishedProjects: number;
    draftProjects: number;

    // Engagement metrics
    avgViewsPerArticle: number;
    avgLikesPerArticle: number;
    likeRate: number; // (likes / views) * 100
    pendingComments: number;
}

/**
 * Get complete analytics dashboard data
 */
export const getAnalyticsDashboardData = async (): Promise<IAnalyticsDashboardData> => {
    try {
        // Fetch data in parallel
        const [
            totalStats,
            topArticles,
            topPages,
            recentActivity,
            contentCounts,
            engagementMetrics,
            trendData,
        ] = await Promise.all([
            getTotalStats(),
            getTopArticles(10),
            getTopPages(10),
            getRecentActivity(20),
            getContentCounts(),
            getEngagementMetrics(),
            getTrendData(),
        ]);

        return {
            ...totalStats,
            ...trendData,
            topArticles,
            topPages,
            recentActivity,
            ...contentCounts,
            ...engagementMetrics,
        };
    } catch (error) {
        console.error('Failed to fetch analytics dashboard data', error);
        return getEmptyAnalyticsData();
    }
};

/**
 * Get total stats (views, likes, comments, subscribers)
 */
async function getTotalStats() {
    try {
        const [articleStatsCollection, pageStatsCollection, commentsCollection, subscribersCollection] = await Promise.all([
            getCollection<IArticleStats>(COLLECTIONS.articleStats),
            getCollection<IPageStats>(COLLECTIONS.pageStats),
            getCollection<IComment>(COLLECTIONS.comments),
            getCollection<ISubscriber>(COLLECTIONS.subscribers),
        ]);

        // Aggregate article stats
        const articleStatsAgg = await articleStatsCollection
            .aggregate([
                {
                    $group: {
                        _id: null,
                        totalViews: { $sum: '$views' },
                        totalLikes: { $sum: '$likes' },
                    },
                },
            ])
            .toArray();

        // Aggregate page stats
        const pageStatsAgg = await pageStatsCollection
            .aggregate([
                {
                    $group: {
                        _id: null,
                        totalViews: { $sum: '$views' },
                        totalLikes: { $sum: '$likes' },
                    },
                },
            ])
            .toArray();

        const articleStats = articleStatsAgg[0] || { totalViews: 0, totalLikes: 0 };
        const pageStats = pageStatsAgg[0] || { totalViews: 0, totalLikes: 0 };

        const totalComments = await commentsCollection.countDocuments({ approved: true });
        const totalSubscribers = await subscribersCollection.countDocuments({ confirmed: true });

        return {
            totalViews: (articleStats.totalViews || 0) + (pageStats.totalViews || 0),
            totalLikes: (articleStats.totalLikes || 0) + (pageStats.totalLikes || 0),
            totalComments,
            totalSubscribers,
        };
    } catch (error) {
        console.error('Failed to fetch total stats', error);
        return {
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            totalSubscribers: 0,
        };
    }
}

/**
 * Get top articles by views
 */
async function getTopArticles(limit: number) {
    try {
        const [articleStatsCollection, contentCollection] = await Promise.all([
            getCollection<IArticleStats>(COLLECTIONS.articleStats),
            getCollection<IArticle>(COLLECTIONS.content),
        ]);

        const topStats = await articleStatsCollection
            .find({})
            .sort({ views: -1 })
            .limit(limit)
            .toArray();

        // Get article titles
        const articles = await Promise.all(
            topStats.map(async (stat) => {
                // Extract topicSlug and articleSlug from full path
                // Format: "topicSlug/articleSlug"
                const [topicSlug, articleSlug] = stat.slug.split('/');

                const article = await contentCollection.findOne({
                    type: 'article',
                    topicSlug,
                    slug: articleSlug,
                });

                return {
                    slug: stat.slug,
                    title: article?.title || stat.slug,
                    views: stat.views || 0,
                    likes: stat.likes || 0,
                };
            })
        );

        return articles;
    } catch (error) {
        console.error('Failed to fetch top articles', error);
        return [];
    }
}

/**
 * Get top pages by views
 */
async function getTopPages(limit: number) {
    try {
        const pageStatsCollection = await getCollection<IPageStats>(COLLECTIONS.pageStats);

        const topPages = await pageStatsCollection
            .find({})
            .sort({ views: -1 })
            .limit(limit)
            .toArray();

        return topPages.map((page) => ({
            slug: page.slug,
            views: page.views || 0,
            likes: page.likes || 0,
        }));
    } catch (error) {
        console.error('Failed to fetch top pages', error);
        return [];
    }
}

/**
 * Get recent activity (views, likes, comments)
 */
async function getRecentActivity(limit: number) {
    try {
        const [articleStatsCollection, commentsCollection, contentCollection] = await Promise.all([
            getCollection<IArticleStats>(COLLECTIONS.articleStats),
            getCollection<IComment>(COLLECTIONS.comments),
            getCollection<IArticle>(COLLECTIONS.content),
        ]);

        // Get recent views
        const recentViews = await articleStatsCollection
            .find({ lastViewedAt: { $exists: true } })
            .sort({ lastViewedAt: -1 })
            .limit(limit / 2)
            .toArray();

        // Get recent comments
        const recentComments = await commentsCollection
            .find({ approved: true })
            .sort({ createdAt: -1 })
            .limit(limit / 2)
            .toArray();

        // Combine and format
        const viewActivity = await Promise.all(
            recentViews.map(async (stat) => {
                const [topicSlug, articleSlug] = stat.slug.split('/');
                const article = await contentCollection.findOne({
                    type: 'article',
                    topicSlug,
                    slug: articleSlug,
                });

                return {
                    type: 'view' as const,
                    slug: stat.slug,
                    title: article?.title || stat.slug,
                    timestamp: formatTimestamp(stat.lastViewedAt),
                };
            })
        );

        const commentActivity = await Promise.all(
            recentComments.map(async (comment) => {
                const [topicSlug, articleSlug] = comment.articleSlug.split('/');
                const article = await contentCollection.findOne({
                    type: 'article',
                    topicSlug,
                    slug: articleSlug,
                });

                return {
                    type: 'comment' as const,
                    slug: comment.articleSlug,
                    title: article?.title || comment.articleSlug,
                    timestamp: formatTimestamp(comment.createdAt),
                };
            })
        );

        // Merge and sort by timestamp (most recent first)
        const allActivity = [...viewActivity, ...commentActivity]
            .sort((a, b) => {
                // Sort by actual date objects for accuracy
                const dateA = new Date(a.timestamp);
                const dateB = new Date(b.timestamp);
                return dateB.getTime() - dateA.getTime();
            })
            .slice(0, limit);

        return allActivity;
    } catch (error) {
        console.error('Failed to fetch recent activity', error);
        return [];
    }
}

/**
 * Get content counts (published vs drafts)
 */
async function getContentCounts() {
    try {
        const contentCollection = await getCollection<IArticle | INote | IProject>(COLLECTIONS.content);

        const [articles, notes, projects] = await Promise.all([
            contentCollection.countDocuments({ type: 'article', published: true }),
            contentCollection.countDocuments({ type: 'note', published: true }),
            contentCollection.countDocuments({ type: 'project', published: true }),
        ]);

        const [draftArticles, draftNotes, draftProjects] = await Promise.all([
            contentCollection.countDocuments({ type: 'article', published: false }),
            contentCollection.countDocuments({ type: 'note', published: false }),
            contentCollection.countDocuments({ type: 'project', published: false }),
        ]);

        return {
            publishedArticles: articles,
            draftArticles,
            publishedNotes: notes,
            draftNotes,
            publishedProjects: projects,
            draftProjects,
        };
    } catch (error) {
        console.error('Failed to fetch content counts', error);
        return {
            publishedArticles: 0,
            draftArticles: 0,
            publishedNotes: 0,
            draftNotes: 0,
            publishedProjects: 0,
            draftProjects: 0,
        };
    }
}

/**
 * Get engagement metrics
 */
async function getEngagementMetrics() {
    try {
        const [articleStatsCollection, commentsCollection] = await Promise.all([
            getCollection<IArticleStats>(COLLECTIONS.articleStats),
            getCollection<IComment>(COLLECTIONS.comments),
        ]);

        const statsAgg = await articleStatsCollection
            .aggregate([
                {
                    $group: {
                        _id: null,
                        totalViews: { $sum: '$views' },
                        totalLikes: { $sum: '$likes' },
                        articleCount: { $sum: 1 },
                    },
                },
            ])
            .toArray();

        const stats = statsAgg[0] || { totalViews: 0, totalLikes: 0, articleCount: 0 };

        const pendingComments = await commentsCollection.countDocuments({ approved: false });

        const avgViewsPerArticle = stats.articleCount > 0 ? stats.totalViews / stats.articleCount : 0;
        const avgLikesPerArticle = stats.articleCount > 0 ? stats.totalLikes / stats.articleCount : 0;
        const likeRate = stats.totalViews > 0 ? (stats.totalLikes / stats.totalViews) * 100 : 0;

        return {
            avgViewsPerArticle,
            avgLikesPerArticle,
            likeRate,
            pendingComments,
        };
    } catch (error) {
        console.error('Failed to fetch engagement metrics', error);
        return {
            avgViewsPerArticle: 0,
            avgLikesPerArticle: 0,
            likeRate: 0,
            pendingComments: 0,
        };
    }
}

/**
 * Get trend data (percentage change from last month)
 */
async function getTrendData() {
    try {
        // For now, return placeholder trends
        // TODO: Implement actual month-over-month calculation
        // This would require storing historical data or using timestamps

        return {
            viewsTrend: 0,
            likesTrend: 0,
            commentsTrend: 0,
            subscribersTrend: 0,
        };
    } catch (error) {
        console.error('Failed to fetch trend data', error);
        return {
            viewsTrend: 0,
            likesTrend: 0,
            commentsTrend: 0,
            subscribersTrend: 0,
        };
    }
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date?: Date): string {
    if (!date) return 'Unknown';

    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 30) {
        return new Date(date).toLocaleDateString();
    } else if (days > 0) {
        return `${days}d ago`;
    } else if (hours > 0) {
        return `${hours}h ago`;
    } else if (minutes > 0) {
        return `${minutes}m ago`;
    } else {
        return 'Just now';
    }
}

/**
 * Get empty analytics data (fallback)
 */
function getEmptyAnalyticsData(): IAnalyticsDashboardData {
    return {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalSubscribers: 0,
        viewsTrend: 0,
        likesTrend: 0,
        commentsTrend: 0,
        subscribersTrend: 0,
        topArticles: [],
        topPages: [],
        recentActivity: [],
        publishedArticles: 0,
        draftArticles: 0,
        publishedNotes: 0,
        draftNotes: 0,
        publishedProjects: 0,
        draftProjects: 0,
        avgViewsPerArticle: 0,
        avgLikesPerArticle: 0,
        likeRate: 0,
        pendingComments: 0,
    };
}
