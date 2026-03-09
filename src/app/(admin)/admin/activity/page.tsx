import { Suspense } from 'react';
import { Activity, Calendar, TrendingUp, Clock } from 'lucide-react';
import { PageHeader } from '@/components/admin';
import { ActivityFeed } from './ActivityFeed';
import { getAllActivityForAdmin, getActivityStats } from '@/server/queries/activity';
import type { IActivityLog } from '@/interfaces/schema';

export const metadata = {
    title: 'Activity Log | Admin Dashboard',
    description: 'View recent activity and changes',
};

// Serialize activity for client component
function serializeActivity(logs: IActivityLog[]) {
    return logs.map(log => ({
        ...log,
        _id: log._id?.toString(),
        userId: log.userId?.toString(),
        createdAt: log.createdAt.toISOString(),
    }));
}

export default async function ActivityPage() {
    const [logs, stats] = await Promise.all([
        getAllActivityForAdmin(100),
        getActivityStats(),
    ]);
    const serializedLogs = serializeActivity(logs);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Activity Log"
                description="Track all changes and actions in your admin panel"
                icon={Activity}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Activities" value={stats.total} icon={<Activity className="h-5 w-5" />} color="blue" />
                <StatCard title="Today" value={stats.today} icon={<Calendar className="h-5 w-5" />} color="green" />
                <StatCard title="This Week" value={stats.thisWeek} icon={<TrendingUp className="h-5 w-5" />} color="purple" />
                <StatCard title="Creates" value={stats.byAction.create || 0} icon={<Clock className="h-5 w-5" />} color="amber" />
            </div>

            {/* Activity Feed */}
            <Suspense fallback={<ActivitySkeleton />}>
                <ActivityFeed logs={serializedLogs} />
            </Suspense>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'amber';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-600',
        green: 'bg-green-500/10 text-green-600',
        purple: 'bg-purple-500/10 text-purple-600',
        amber: 'bg-amber-500/10 text-amber-600',
    };

    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{title}</p>
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

function ActivitySkeleton() {
    return (
        <div className="rounded-lg border bg-card animate-pulse">
            <div className="p-6 space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="h-10 w-10 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/2" />
                            <div className="h-3 bg-muted rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
