'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { FileText, BookOpen, Clock, X, Eye, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { cancelSchedule, publishScheduledContent } from '@/server/actions/schedule';

// ===== TYPES =====

type SerializedContent = {
    _id?: string;
    type: 'article' | 'series' | 'note' | 'log' | 'page';
    slug: string;
    title: string;
    description: string;
    scheduledAt?: string;
    createdAt: string;
    updatedAt: string;
};

interface IScheduledListProps {
    content: SerializedContent[];
}

// ===== COMPONENT =====

export function ScheduledList({ content }: IScheduledListProps): React.ReactElement {
    const router = useRouter();
    const [isPublishing, setIsPublishing] = useState(false);

    const handleCancel = useCallback(async (id: string) => {
        await cancelSchedule(id);
        router.refresh();
    }, [router]);

    const handlePublishAll = useCallback(async () => {
        setIsPublishing(true);
        await publishScheduledContent();
        setIsPublishing(false);
        router.refresh();
    }, [router]);

    if (content.length === 0) {
        return (
            <div className="rounded-lg border bg-card p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No Scheduled Content</h3>
                <p className="mt-2 text-muted-foreground">
                    Schedule articles or notes to be published automatically in the future
                </p>
            </div>
        );
    }

    // Group by date
    const grouped = content.reduce((acc, item) => {
        if (!item.scheduledAt) return acc;
        const date = format(new Date(item.scheduledAt), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {} as Record<string, SerializedContent[]>);

    return (
        <div className="space-y-6">
            {/* Publish All Button */}
            {content.some(c => c.scheduledAt && new Date(c.scheduledAt) <= new Date()) && (
                <div className="flex justify-end">
                    <Button onClick={handlePublishAll} disabled={isPublishing}>
                        <Eye className="h-4 w-4 mr-2" />
                        {isPublishing ? 'Publishing...' : 'Publish Ready Content'}
                    </Button>
                </div>
            )}

            {/* Timeline */}
            {Object.entries(grouped)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, items]) => (
                    <div key={date} className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-sm font-medium text-muted-foreground px-2">
                                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                            </span>
                            <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="space-y-2">
                            {items.map((item) => (
                                <ScheduledItem
                                    key={item._id}
                                    item={item}
                                    onCancel={() => handleCancel(item._id!)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
        </div>
    );
}

function ScheduledItem({ item, onCancel }: { item: SerializedContent; onCancel: () => void }) {
    const Icon = item.type === 'article' ? FileText : BookOpen;
    const scheduledDate = item.scheduledAt ? new Date(item.scheduledAt) : null;
    const isPast = scheduledDate && scheduledDate <= new Date();

    return (
        <div className={cn(
            'flex items-center gap-4 p-4 rounded-lg border bg-card',
            isPast && 'border-amber-500/50 bg-amber-500/5'
        )}>
            {/* Icon */}
            <div className={cn(
                'p-2 rounded-lg',
                item.type === 'article' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
            )}>
                <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{item.title}</span>
                    {isPast && (
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">
                            Ready to publish
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {scheduledDate && (
                        <>
                            <span>{format(scheduledDate, 'h:mm a')}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(scheduledDate, { addSuffix: true })}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Actions */}
            <Button variant="ghost" size="icon" onClick={onCancel} title="Cancel schedule">
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
