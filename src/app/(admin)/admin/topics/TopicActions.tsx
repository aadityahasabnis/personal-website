'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Star,
    StarOff,
    ExternalLink,
    Loader2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ITopic } from '@/interfaces';
import {
    toggleTopicPublished,
    toggleTopicFeatured,
    deleteTopic,
} from '@/server/actions/topics';

interface ITopicActionsProps {
    topic: ITopic;
}

export const TopicActions = ({ topic }: ITopicActionsProps): React.ReactElement => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleTogglePublished = (): void => {
        startTransition(async () => {
            await toggleTopicPublished(topic.slug);
            router.refresh();
            setIsOpen(false);
        });
    };

    const handleToggleFeatured = (): void => {
        startTransition(async () => {
            await toggleTopicFeatured(topic.slug);
            router.refresh();
            setIsOpen(false);
        });
    };

    const handleDelete = (): void => {
        startTransition(async () => {
            await deleteTopic(topic.slug, true); // cascade delete
            router.refresh();
            setShowDeleteConfirm(false);
            setIsOpen(false);
        });
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                    'hover:bg-muted text-muted-foreground hover:text-foreground',
                    isOpen && 'bg-muted text-foreground'
                )}
                disabled={isPending}
            >
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <MoreHorizontal className="h-4 w-4" />
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)} 
                    />
                    
                    <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border bg-popover p-1 shadow-lg">
                        {/* Edit */}
                        <Link
                            href={`/admin/topics/${topic.slug}/edit`}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Link>

                        {/* View on site */}
                        <Link
                            href={`/articles/${topic.slug}`}
                            target="_blank"
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <ExternalLink className="h-4 w-4" />
                            View on site
                        </Link>

                        <div className="my-1 border-t" />

                        {/* Toggle Published */}
                        <button
                            onClick={handleTogglePublished}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                            disabled={isPending}
                        >
                            {topic.published ? (
                                <>
                                    <EyeOff className="h-4 w-4" />
                                    Unpublish
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4" />
                                    Publish
                                </>
                            )}
                        </button>

                        {/* Toggle Featured */}
                        <button
                            onClick={handleToggleFeatured}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                            disabled={isPending}
                        >
                            {topic.featured ? (
                                <>
                                    <StarOff className="h-4 w-4" />
                                    Remove from featured
                                </>
                            ) : (
                                <>
                                    <Star className="h-4 w-4" />
                                    Mark as featured
                                </>
                            )}
                        </button>

                        <div className="my-1 border-t" />

                        {/* Delete */}
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        ) : (
                            <div className="p-2">
                                <p className="mb-2 text-xs text-muted-foreground">
                                    Delete topic and all its articles?
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 rounded-md border px-2 py-1 text-xs hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 rounded-md bg-destructive px-2 py-1 text-xs text-destructive-foreground hover:bg-destructive/90 transition-colors"
                                        disabled={isPending}
                                    >
                                        {isPending ? 'Deleting...' : 'Confirm'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
