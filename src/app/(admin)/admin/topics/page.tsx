import { Suspense } from 'react';
import Link from 'next/link';
import { Layers, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/admin';
import { getAllTopics } from '@/server/queries/topics';
import { TopicsTable } from './TopicsTable';

/**
 * Topics Management Page
 *
 * List, create, edit, and delete topics for the article hierarchy
 * Features: Search, Filters, Bulk Actions, Drag & Drop Reordering, Infinite Scroll
 */

const TopicsTableWrapper = async (): Promise<React.ReactElement> => {
    const topics = await getAllTopics();

    return <TopicsTable topics={topics} />;
};

const TopicsPage = (): React.ReactElement => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Topics"
                description="Manage topics to organize your articles into categories."
                icon={Layers}
                actions={
                    <Link href="/admin/topics/new">
                        <Button>
                            <Plus className="h-4 w-4" />
                            New Topic
                        </Button>
                    </Link>
                }
            />

            {/* Topics Table */}
            <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
                <TopicsTableWrapper />
            </Suspense>
        </div>
    );
};

export default TopicsPage;
