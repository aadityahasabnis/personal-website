import { Suspense } from 'react';
import Link from 'next/link';
import { FileText, Plus, Clock, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    PageHeader,
    EmptyState,
    StatusBadge,
    DataTableActions,
    createEditAction,
    createDeleteAction,
    createTogglePublishedAction,
    createToggleFeaturedAction,
} from '@/components/admin';
import { getAllArticlesForAdmin } from '@/server/queries/admin';
import { getAllTopics } from '@/server/queries/topics';
import {
    deleteArticle,
    toggleArticlePublished,
    toggleArticleFeatured,
} from '@/server/actions/articles';
import { formatDate } from '@/lib/utils';
import type { IArticle, ITopic } from '@/interfaces';

/**
 * Articles Management Page
 * 
 * List, create, edit, and delete articles with topic organization
 */

interface IArticleRowProps {
    article: IArticle;
    topics: ITopic[];
}

const ArticleRow = ({ article, topics }: IArticleRowProps): React.ReactElement => {
    const topic = topics.find((t) => t.slug === article.topicSlug);

    // Server actions with error handling
    const handleDelete = async (): Promise<void> => {
        'use server';
        await deleteArticle(article.topicSlug, article.slug);
    };

    const handleTogglePublished = async (): Promise<void> => {
        'use server';
        await toggleArticlePublished(article.topicSlug, article.slug);
    };

    const handleToggleFeatured = async (): Promise<void> => {
        'use server';
        await toggleArticleFeatured(article.topicSlug, article.slug);
    };

    const actions = [
        createEditAction(`/admin/articles/${article.topicSlug}/${article.slug}/edit`),
        createTogglePublishedAction(article.published || false, handleTogglePublished),
        createToggleFeaturedAction(article.featured || false, handleToggleFeatured),
        createDeleteAction(handleDelete, `"${article.title}"`),
    ];

    return (
        <tr className="border-b transition-colors hover:bg-muted/50">
            <td className="p-4">
                <div className="min-w-0">
                    <Link
                        href={`/admin/articles/${article.topicSlug}/${article.slug}/edit`}
                        className="font-medium hover:underline line-clamp-1"
                    >
                        {article.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                        {article.description}
                    </p>
                </div>
            </td>

            <td className="p-4 text-sm">
                {topic ? (
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{topic.title}</span>
                        {article.subtopicSlug && (
                            <>
                                <span className="text-muted-foreground">/</span>
                                <span className="text-xs text-muted-foreground">
                                    {article.subtopicSlug}
                                </span>
                            </>
                        )}
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )}
            </td>

            <td className="p-4 text-center">
                <StatusBadge variant="published" value={article.published || false} />
            </td>

            <td className="p-4 text-center">
                <StatusBadge variant="featured" value={article.featured || false} />
            </td>

            <td className="p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readingTime || 0} min
                </div>
            </td>

            <td className="p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(article.updatedAt)}
                </div>
            </td>

            <td className="p-4">
                <DataTableActions actions={actions} itemName={`"${article.title}"`} />
            </td>
        </tr>
    );
};

const ArticlesTable = async (): Promise<React.ReactElement> => {
    const [articles, topics] = await Promise.all([
        getAllArticlesForAdmin(),
        getAllTopics(),
    ]);

    if (articles.length === 0) {
        return (
            <EmptyState
                icon={FileText}
                title="No articles yet"
                description="Start writing your first article to share knowledge with the world."
                actionLabel="Create Article"
                actionHref="/admin/articles/new"
            />
        );
    }

    return (
        <div className="rounded-xl border bg-card overflow-x-auto">
            <table className="w-full">
                <thead className="border-b bg-muted/50">
                    <tr>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Article
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Topic / Subtopic
                        </th>
                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">
                            Status
                        </th>
                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">
                            Featured
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Reading Time
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Last Updated
                        </th>
                        <th className="p-4 w-16"></th>
                    </tr>
                </thead>
                <tbody>
                    {articles.map((article) => (
                        <ArticleRow key={article.slug} article={article} topics={topics} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ArticlesPage = (): React.ReactElement => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Articles"
                description="Manage your blog posts, tutorials, and technical articles."
                icon={FileText}
                actions={
                    <Link href="/admin/articles/new">
                        <Button>
                            <Plus className="h-4 w-4" />
                            New Article
                        </Button>
                    </Link>
                }
            />

            {/* Articles Table */}
            <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
                <ArticlesTable />
            </Suspense>
        </div>
    );
};

export default ArticlesPage;
