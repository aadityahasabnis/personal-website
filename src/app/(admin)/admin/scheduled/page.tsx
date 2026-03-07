import { Suspense } from 'react';
import { Clock, Calendar, FileText, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/admin';
import { ScheduledList } from './ScheduledList';
import { getScheduledContentForAdmin, getScheduledCount } from '@/server/queries/schedule';
import type { IContent } from '@/interfaces';

export const metadata = {
    title: 'Scheduled Content | Admin Dashboard',
    description: 'Manage scheduled content for publishing',
};

// Serialize content for client component
function serializeContent(content: IContent[]) {
    return content.map(c => ({
        ...c,
        _id: c._id?.toString(),
        publishedAt: c.publishedAt?.toISOString(),
        scheduledAt: c.scheduledAt?.toISOString(),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
    }));
}

export default async function ScheduledPage() {
    const [content, count] = await Promise.all([
        getScheduledContentForAdmin(),
        getScheduledCount(),
    ]);
    const serializedContent = serializeContent(content);

    const articles = serializedContent.filter(c => c.type === 'article');
    const notes = serializedContent.filter(c => c.type === 'note');

    return (
        <div className="space-y-6">
            <PageHeader
                title="Scheduled Content"
                description="View and manage content scheduled for future publication"
                icon={Clock}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Scheduled" value={count} icon={<Calendar className="h-5 w-5" />} color="blue" />
                <StatCard title="Articles" value={articles.length} icon={<FileText className="h-5 w-5" />} color="purple" />
                <StatCard title="Notes" value={notes.length} icon={<BookOpen className="h-5 w-5" />} color="amber" />
                <StatCard title="Next 7 Days" value={serializedContent.filter(c => {
                    if (!c.scheduledAt) return false;
                    const scheduled = new Date(c.scheduledAt);
                    const weekFromNow = new Date();
                    weekFromNow.setDate(weekFromNow.getDate() + 7);
                    return scheduled <= weekFromNow;
                }).length} icon={<Clock className="h-5 w-5" />} color="green" />
            </div>

            {/* Scheduled List */}
            <Suspense fallback={<ScheduledSkeleton />}>
                <ScheduledList content={serializedContent} />
            </Suspense>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'blue' | 'purple' | 'amber' | 'green';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-600',
        purple: 'bg-purple-500/10 text-purple-600',
        amber: 'bg-amber-500/10 text-amber-600',
        green: 'bg-green-500/10 text-green-600',
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

function ScheduledSkeleton() {
    return (
        <div className="rounded-lg border bg-card animate-pulse">
            <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="h-12 w-12 bg-muted rounded" />
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
