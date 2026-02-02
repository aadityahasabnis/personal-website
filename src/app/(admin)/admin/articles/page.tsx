import { Suspense } from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/admin';
import { getAllArticlesForAdmin } from '@/server/queries/admin';
import { getAllTopics } from '@/server/queries/topics';
import { ArticlesTable } from './ArticlesTable';

/**
 * Articles Management Page
 * 
 * List, create, edit, and delete articles with topic organization
 * Features: Search, Filters, Bulk Actions, Infinite Scroll
 */

const ArticlesTableWrapper = async (): Promise<React.ReactElement> => {
    const [articles, topics] = await Promise.all([
        getAllArticlesForAdmin(),
        getAllTopics(),
    ]);

    return <ArticlesTable articles={articles} topics={topics} />;
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
                <ArticlesTableWrapper />
            </Suspense>
        </div>
    );
};

export default ArticlesPage;
