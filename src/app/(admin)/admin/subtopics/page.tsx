import { Suspense } from 'react';
import Link from 'next/link';
import { Layers, Plus, Calendar } from 'lucide-react';

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
} from '@/components/admin';
import { getAllSubtopicsForAdmin } from '@/server/queries/admin';
import { getAllTopics } from '@/server/queries/topics';
import {
    deleteSubtopic,
    toggleSubtopicPublished,
} from '@/server/actions/subtopics';
import { formatDate } from '@/lib/utils';
import type { ISubtopic, ITopic } from '@/interfaces';

/**
 * Subtopics Management Page
 * 
 * List, create, edit, and delete subtopics organized by parent topic
 */

interface ISubtopicRowProps {
    subtopic: ISubtopic;
    topic?: ITopic;
}

const SubtopicRow = ({ subtopic, topic }: ISubtopicRowProps): React.ReactElement => {
    // Server actions
    const handleDelete = async (): Promise<void> => {
        'use server';
        await deleteSubtopic(subtopic.topicSlug, subtopic.slug);
    };

    const handleTogglePublished = async (): Promise<void> => {
        'use server';
        await toggleSubtopicPublished(subtopic.topicSlug, subtopic.slug);
    };

    const actions = [
        createEditAction(`/admin/subtopics/${subtopic.topicSlug}/${subtopic.slug}/edit`),
        createTogglePublishedAction(subtopic.published || false, handleTogglePublished),
        createDeleteAction(handleDelete, `"${subtopic.title}"`),
    ];

    return (
        <tr className="border-b transition-colors hover:bg-muted/50">
            <td className="p-4">
                <div className="min-w-0">
                    <Link
                        href={`/admin/subtopics/${subtopic.topicSlug}/${subtopic.slug}/edit`}
                        className="font-medium hover:underline hover:text-accent line-clamp-1"
                    >
                        {subtopic.title}
                    </Link>
                    {subtopic.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                            {subtopic.description}
                        </p>
                    )}
                </div>
            </td>

            <td className="p-4 text-sm">
                {topic ? (
                    <Link 
                        href={`/admin/topics/${topic.slug}/edit`}
                        className="text-muted-foreground hover:text-accent transition-colors"
                    >
                        {topic.title}
                    </Link>
                ) : (
                    <span className="text-muted-foreground">{subtopic.topicSlug}</span>
                )}
            </td>

            <td className="p-4 text-center">
                <StatusBadge variant="published" value={subtopic.published || false} />
            </td>

            <td className="p-4 text-sm text-center text-muted-foreground">
                {subtopic.metadata?.articleCount || 0}
            </td>

            <td className="p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(subtopic.updatedAt)}
                </div>
            </td>

            <td className="p-4">
                <DataTableActions actions={actions} itemName={`"${subtopic.title}"`} />
            </td>
        </tr>
    );
};

const SubtopicsTable = async (): Promise<React.ReactElement> => {
    const [subtopics, topics] = await Promise.all([
        getAllSubtopicsForAdmin(),
        getAllTopics(),
    ]);

    if (subtopics.length === 0) {
        return (
            <EmptyState
                icon={Layers}
                title="No subtopics yet"
                description="Subtopics help organize articles within topics. Create your first subtopic to get started."
                actionLabel="Create Subtopic"
                actionHref="/admin/subtopics/new"
            />
        );
    }

    return (
        <div className="rounded-xl border bg-card overflow-x-auto">
            <table className="w-full">
                <thead className="border-b bg-muted/50">
                    <tr>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Subtopic
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Parent Topic
                        </th>
                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">
                            Status
                        </th>
                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">
                            Articles
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Last Updated
                        </th>
                        <th className="p-4 w-16"></th>
                    </tr>
                </thead>
                <tbody>
                    {subtopics.map((subtopic) => {
                        const topic = topics.find((t) => t.slug === subtopic.topicSlug);
                        return (
                            <SubtopicRow 
                                key={`${subtopic.topicSlug}-${subtopic.slug}`} 
                                subtopic={subtopic}
                                topic={topic}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
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
                <SubtopicsTable />
            </Suspense>
        </div>
    );
};

export default SubtopicsPage;
