'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    Plus, Pencil, Trash2, Eye, EyeOff, LogIn, Download, ArrowUpDown, Mail,
    FileText, BookOpen, FolderKanban, Layers, MessageSquare, Users, ImageIcon, Settings,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityAction, ActivityEntity } from '@/interfaces/schema';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// ===== TYPES =====

type SerializedActivityLog = {
    _id?: string;
    action: ActivityAction;
    entity: ActivityEntity;
    entityId?: string;
    entityTitle?: string;
    userId?: string;
    userEmail?: string;
    details?: Record<string, unknown>;
    createdAt: string;
};

interface IActivityFeedProps {
    logs: SerializedActivityLog[];
}

// ===== HELPERS =====

const actionIcons: Record<ActivityAction, LucideIcon> = {
    create: Plus,
    update: Pencil,
    delete: Trash2,
    publish: Eye,
    unpublish: EyeOff,
    login: LogIn,
    export: Download,
    reorder: ArrowUpDown,
};

const entityIcons: Record<ActivityEntity, LucideIcon> = {
    article: FileText,
    note: BookOpen,
    project: FolderKanban,
    topic: Layers,
    subtopic: Layers,
    comment: MessageSquare,
    subscriber: Users,
    media: ImageIcon,
    settings: Settings,
    user: Users,
    message: Mail,
};

const actionColors: Record<ActivityAction, string> = {
    create: 'bg-green-500/10 text-green-600 border-green-500/20',
    update: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    delete: 'bg-red-500/10 text-red-600 border-red-500/20',
    publish: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    unpublish: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    login: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    export: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    reorder: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
};

const actionLabels: Record<ActivityAction, string> = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    publish: 'Published',
    unpublish: 'Unpublished',
    login: 'Logged in',
    export: 'Exported',
    reorder: 'Reordered',
};

// ===== COMPONENT =====

export function ActivityFeed({ logs }: IActivityFeedProps): React.ReactElement {
    const [filter, setFilter] = useState<ActivityAction | 'all'>('all');
    const [entityFilter, setEntityFilter] = useState<ActivityEntity | 'all'>('all');

    const filteredLogs = logs.filter(log => {
        if (filter !== 'all' && log.action !== filter) return false;
        if (entityFilter !== 'all' && log.entity !== entityFilter) return false;
        return true;
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <Select
                    value={filter}
                    onValueChange={(value) => setFilter(value as ActivityAction | 'all')}
                >
                    <SelectTrigger className="h-9 w-[160px]">
                        <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        {Object.keys(actionLabels).map(action => (
                            <SelectItem key={action} value={action}>
                                {actionLabels[action as ActivityAction]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={entityFilter}
                    onValueChange={(value) => setEntityFilter(value as ActivityEntity | 'all')}
                >
                    <SelectTrigger className="h-9 w-[160px]">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.keys(entityIcons).map(entity => (
                            <SelectItem key={entity} value={entity} className="capitalize">
                                {entity.charAt(0).toUpperCase() + entity.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Activity List */}
            <div className="rounded-lg border bg-card divide-y">
                {filteredLogs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No activity found
                    </div>
                ) : (
                    filteredLogs.map((log) => (
                        <ActivityItem key={log._id} log={log} />
                    ))
                )}
            </div>
        </div>
    );
}

function ActivityItem({ log }: { log: SerializedActivityLog }) {
    const ActionIcon = actionIcons[log.action];
    const EntityIcon = entityIcons[log.entity];

    return (
        <div className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
            {/* Icon */}
            <div className={cn('p-2 rounded-lg border', actionColors[log.action])}>
                <ActionIcon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{actionLabels[log.action]}</span>
                    <span className="text-muted-foreground">{log.entity}</span>
                    {log.entityTitle && (
                        <>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-medium truncate max-w-[200px]">{log.entityTitle}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <EntityIcon className="h-3 w-3" />
                    {log.userEmail && <span>{log.userEmail}</span>}
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                </div>
            </div>
        </div>
    );
}
