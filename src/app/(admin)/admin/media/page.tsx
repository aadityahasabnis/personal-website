import { Suspense } from 'react';
import { ImageIcon, Film, FileText, HardDrive } from 'lucide-react';
import { PageHeader } from '@/components/admin';
import { MediaLibrary } from './MediaLibrary';
import { getAllMediaForAdmin, getTotalStorageUsed } from '@/server/queries/media';
import type { IMedia } from '@/interfaces/schema';

export const metadata = {
    title: 'Media Library | Admin Dashboard',
    description: 'Manage uploaded media files',
};

// Serialize media for client component
function serializeMedia(media: IMedia[]) {
    return media.map(m => ({
        ...m,
        _id: m._id?.toString(),
        uploadedBy: m.uploadedBy?.toString(),
        createdAt: m.createdAt.toISOString(),
    }));
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default async function MediaPage() {
    const [media, totalStorage] = await Promise.all([
        getAllMediaForAdmin(),
        getTotalStorageUsed(),
    ]);
    const serializedMedia = serializeMedia(media);

    const images = serializedMedia.filter(m => m.mimeType.startsWith('image/'));
    const videos = serializedMedia.filter(m => m.mimeType.startsWith('video/'));
    const documents = serializedMedia.filter(m => !m.mimeType.startsWith('image/') && !m.mimeType.startsWith('video/'));

    return (
        <div className="space-y-6">
            <PageHeader
                title="Media Library"
                description="Upload and manage images, videos, and documents"
                icon={ImageIcon}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Images" value={images.length} icon={<ImageIcon className="h-5 w-5" />} color="blue" />
                <StatCard title="Videos" value={videos.length} icon={<Film className="h-5 w-5" />} color="purple" />
                <StatCard title="Documents" value={documents.length} icon={<FileText className="h-5 w-5" />} color="amber" />
                <StatCard title="Storage Used" value={formatBytes(totalStorage)} icon={<HardDrive className="h-5 w-5" />} color="green" isText />
            </div>

            {/* Media Library */}
            <Suspense fallback={<MediaSkeleton />}>
                <MediaLibrary media={serializedMedia} />
            </Suspense>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: 'blue' | 'purple' | 'amber' | 'green';
    isText?: boolean;
}

function StatCard({ title, value, icon, color, isText }: StatCardProps) {
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
            <p className={isText ? 'text-xl font-bold' : 'text-2xl font-bold'}>{value}</p>
        </div>
    );
}

function MediaSkeleton() {
    return (
        <div className="rounded-lg border bg-card animate-pulse">
            <div className="p-6 space-y-4">
                <div className="h-10 bg-muted rounded w-full" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-muted rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}
