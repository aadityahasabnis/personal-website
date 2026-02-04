import { Suspense } from 'react';
import { Users, UserPlus, Mail, Download, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/admin';
import { SubscribersTable } from './SubscribersTable';
import { getAllSubscribersForAdmin } from '@/server/queries/subscribers';
import type { ISubscriber } from '@/interfaces';

export const metadata = {
    title: 'Subscribers | Admin Dashboard',
    description: 'Manage newsletter subscribers',
};

// Helper to serialize subscribers for client component
function serializeSubscribers(subscribers: ISubscriber[]) {
    return subscribers.map(sub => ({
        ...sub,
        _id: sub._id?.toString(),
        subscribedAt: sub.subscribedAt.toISOString(),
        unsubscribedAt: sub.unsubscribedAt?.toISOString(),
        createdAt: sub.createdAt?.toISOString(),
        updatedAt: sub.updatedAt?.toISOString(),
    }));
}

export default async function SubscribersPage() {
    const subscribers = await getAllSubscribersForAdmin();
    const serializedSubscribers = serializeSubscribers(subscribers);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Subscribers"
                description="Manage newsletter subscribers and export email lists"
                icon={Users}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Subscribers"
                    value={serializedSubscribers.filter(s => s.confirmed).length}
                    icon={<Users className="h-5 w-5" />}
                    color="blue"
                />
                <StatCard
                    title="Pending Confirmation"
                    value={serializedSubscribers.filter(s => !s.confirmed).length}
                    icon={<Mail className="h-5 w-5" />}
                    color="amber"
                />
                <StatCard
                    title="Unsubscribed"
                    value={serializedSubscribers.filter(s => s.unsubscribedAt).length}
                    icon={<Trash2 className="h-5 w-5" />}
                    color="red"
                />
            </div>

            {/* Subscribers Table */}
            <Suspense fallback={<TableSkeleton />}>
                <SubscribersTable subscribers={serializedSubscribers} />
            </Suspense>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'blue' | 'amber' | 'red';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-600',
        amber: 'bg-amber-500/10 text-amber-600',
        red: 'bg-red-500/10 text-red-600',
    };

    return (
        <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">{title}</p>
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="rounded-lg border bg-card animate-pulse">
            <div className="p-6 space-y-4">
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
            </div>
        </div>
    );
}
