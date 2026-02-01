import { Suspense } from 'react';
import Link from 'next/link';
import {
    Plus,
    Layers,
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Star,
    StarOff,
    GripVertical,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { getAllTopics } from '@/server/queries/topics';
import { formatDate } from '@/lib/utils';
import type { ITopic } from '@/interfaces';

import { TopicActions } from './TopicActions';

/**
 * Topics Management Page
 *
 * List, create, edit, and delete topics for the article hierarchy
 */

interface ITopicRowProps {
    topic: ITopic;
}

const TopicRow = ({ topic }: ITopicRowProps): React.ReactElement => {
    return (
        <tr className="border-b transition-colors hover:bg-muted/50">
            <td className="p-4 w-8">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            </td>
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Layers className="h-5 w-5" />
                    </div>
                    <div>
                        <Link 
                            href={`/admin/topics/${topic.slug}/edit`}
                            className="font-medium hover:underline"
                        >
                            {topic.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">/{topic.slug}</p>
                    </div>
                </div>
            </td>
            <td className="p-4 text-center">
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium">
                    {topic.metadata?.articleCount ?? 0}
                </span>
            </td>
            <td className="p-4 text-center">
                {topic.published ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        <Eye className="h-3 w-3" />
                        Published
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        <EyeOff className="h-3 w-3" />
                        Draft
                    </span>
                )}
            </td>
            <td className="p-4 text-center">
                {topic.featured ? (
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500 mx-auto" />
                ) : (
                    <StarOff className="h-4 w-4 text-muted-foreground mx-auto" />
                )}
            </td>
            <td className="p-4 text-sm text-muted-foreground">
                {formatDate(topic.updatedAt)}
            </td>
            <td className="p-4">
                <TopicActions topic={topic} />
            </td>
        </tr>
    );
};

const TopicsTable = async (): Promise<React.ReactElement> => {
    const topics = await getAllTopics();

    if (topics.length === 0) {
        return (
            <div className="rounded-xl border bg-card p-12 text-center">
                <Layers className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No topics yet</h3>
                <p className="mt-2 text-muted-foreground">
                    Create your first topic to organize your articles.
                </p>
                <Link
                    href="/admin/topics/new"
                    className={cn(
                        'mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2',
                        'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
                    )}
                >
                    <Plus className="h-4 w-4" />
                    Create Topic
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full">
                <thead className="border-b bg-muted/50">
                    <tr>
                        <th className="p-4 w-8"></th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Topic</th>
                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">Articles</th>
                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">Status</th>
                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">Featured</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Updated</th>
                        <th className="p-4 w-16"></th>
                    </tr>
                </thead>
                <tbody>
                    {topics.map((topic) => (
                        <TopicRow key={topic.slug} topic={topic} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TopicsPage = (): React.ReactElement => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Topics</h1>
                    <p className="text-muted-foreground">
                        Manage topics to organize your articles into categories.
                    </p>
                </div>
                <Link
                    href="/admin/topics/new"
                    className={cn(
                        'inline-flex items-center gap-2 rounded-lg px-4 py-2',
                        'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
                    )}
                >
                    <Plus className="h-4 w-4" />
                    New Topic
                </Link>
            </div>

            {/* Topics Table */}
            <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
                <TopicsTable />
            </Suspense>
        </div>
    );
};

export default TopicsPage;
