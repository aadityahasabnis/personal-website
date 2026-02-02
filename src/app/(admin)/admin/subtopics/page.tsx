import { Suspense } from 'react';
import Link from 'next/link';
import { Layers, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/admin';
import { getAllSubtopicsForAdmin } from '@/server/queries/admin';
import { getAllTopics } from '@/server/queries/topics';
import { SubtopicsTable } from './SubtopicsTable';

/**
 * Subtopics Management Page
 * 
 * List, create, edit, and delete subtopics organized by parent topic
 * Features: Search, Filters, Bulk Actions, Infinite Scroll
 */

const SubtopicsTableWrapper = async (): Promise<React.ReactElement> => {
    const [subtopics, topics] = await Promise.all([
        getAllSubtopicsForAdmin(),
        getAllTopics(),
    ]);

    return <SubtopicsTable subtopics={subtopics} topics={topics} />;
};

const SubtopicsPage = (): React.ReactElement => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Subtopics"
                description="Organize your content with subtopics within each main topic."
                icon={Layers}
                actions={
                    <Link href="/admin/subtopics/new">
                        <Button>
                            <Plus className="h-4 w-4" />
                            New Subtopic
                        </Button>
                    </Link>
                }
            />

            {/* Subtopics Table */}
            <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
                <SubtopicsTableWrapper />
            </Suspense>
        </div>
    );
};

export default SubtopicsPage;
