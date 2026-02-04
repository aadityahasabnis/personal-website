'use client';

import { useState } from 'react';
import { 
    Bell,
    Check, 
    Mail, 
    MessageSquare, 
    Heart,
    UserPlus,
    TrendingUp,
    X,
    CheckCheck,
    type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    type: 'subscriber' | 'comment' | 'like' | 'mention' | 'system';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
}

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock notifications - in production, these would come from API/database
const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'subscriber',
        title: 'New subscriber',
        message: 'john@example.com subscribed to your newsletter',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        actionUrl: '/admin/subscribers',
    },
    {
        id: '2',
        type: 'like',
        title: 'Popular article',
        message: 'Your article "Getting Started with Next.js" reached 100 likes!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        actionUrl: '/admin/analytics',
    },
    {
        id: '3',
        type: 'system',
        title: 'Content published',
        message: 'Your article "Understanding TypeScript" was published successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
        actionUrl: '/admin/articles',
    },
    {
        id: '4',
        type: 'subscriber',
        title: 'New subscriber',
        message: 'sarah@example.com subscribed to your newsletter',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        read: true,
        actionUrl: '/admin/subscribers',
    },
];

const notificationIcons: Record<Notification['type'], LucideIcon> = {
    subscriber: UserPlus,
    comment: MessageSquare,
    like: Heart,
    mention: Mail,
    system: TrendingUp,
};

const notificationColors: Record<Notification['type'], string> = {
    subscriber: 'bg-blue-500/10 text-blue-600',
    comment: 'bg-green-500/10 text-green-600',
    like: 'bg-red-500/10 text-red-600',
    mention: 'bg-purple-500/10 text-purple-600',
    system: 'bg-amber-500/10 text-amber-600',
};

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-16 z-50 w-full max-w-md">
                <div className="m-4 rounded-xl border bg-card shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b p-4">
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            <h2 className="font-semibold">Notifications</h2>
                            {unreadCount > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs text-destructive-foreground">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 hover:bg-muted transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Actions */}
                    {notifications.length > 0 && (
                        <div className="flex items-center justify-between border-b px-4 py-2 text-xs">
                            <button
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className="flex items-center gap-1 text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                            >
                                <CheckCheck className="h-3 w-3" />
                                Mark all as read
                            </button>
                            <button
                                onClick={clearAll}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className="max-h-[500px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                    <Bell className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium">No notifications</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    You're all caught up!
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={markAsRead}
                                        onDelete={deleteNotification}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t p-3 text-center">
                            <button
                                onClick={onClose}
                                className="text-xs text-primary hover:underline"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
    const Icon = notificationIcons[notification.type];
    const colorClass = notificationColors[notification.type];

    return (
        <div
            className={cn(
                'group relative p-4 transition-colors hover:bg-muted/50',
                !notification.read && 'bg-primary/5'
            )}
        >
            <div className="flex gap-3">
                {/* Icon */}
                <div className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                    colorClass
                )}>
                    <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium line-clamp-1">
                            {notification.title}
                        </p>
                        {!notification.read && (
                            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary mt-1" />
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </p>
                </div>
            </div>

            {/* Actions (show on hover) */}
            <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!notification.read && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                        }}
                        className="rounded-md p-1.5 hover:bg-background transition-colors"
                        title="Mark as read"
                    >
                        <Check className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                    }}
                    className="rounded-md p-1.5 hover:bg-background transition-colors"
                    title="Delete"
                >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
            </div>
        </div>
    );
}
