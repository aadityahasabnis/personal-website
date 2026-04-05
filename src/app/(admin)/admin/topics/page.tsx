import { Suspense } from 'react';
import Link from 'next/link';
import { Layers, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/admin';
import { getTopics } from '@/server/new/admin/topic';
import { TopicsTable } from './TopicsTable';

/**
 * Topics Management Page
 *
 * List, create, edit, and delete topics for the article hierarchy
 * Features: Search, Filters, Bulk Actions, Drag & Drop Reordering, Pagination
 */

const TopicsTableWrapper = async (): Promise<React.ReactElement> => {
    const response = await getTopics();

    if (!response.success || !response.data) {
        return (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed">
                <p className="text-muted-foreground">Failed to load topics</p>
            </div>
        );
    }

    return <TopicsTable initialData={response.data} />;
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
