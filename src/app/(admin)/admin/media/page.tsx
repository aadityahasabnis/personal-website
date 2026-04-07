import { ImageIcon } from 'lucide-react';
import { Suspense } from 'react';

import { PageHeader } from '@/components/admin';
import { DataTableSkeleton } from '@/components/admin/table';
import { getMedia, getMediaStats } from '@/server/new/admin/media';

import { MEDIA_TABLE_SKELETON_PROPS } from './config';
import { MediaLibrary } from './MediaLibrary';

export const metadata = {
    title: 'Media Library | Admin Dashboard',
    description: 'Manage uploaded images, videos, and documents.',
};

const MediaLibraryWrapper = async (): Promise<React.ReactElement> => {
    const [mediaResponse, statsResponse] = await Promise.all([getMedia(), getMediaStats()]);

    if (!mediaResponse.success || !mediaResponse.data) {
        return (
            <div className='flex h-64 items-center justify-center rounded-xl border border-dashed'>
                <p className='text-muted-foreground'>Failed to load media library.</p>
            </div>
        );
    }

    const stats = statsResponse.success ? statsResponse.data : null;

    return <MediaLibrary initialData={mediaResponse.data} initialTotal={mediaResponse.pagination.total} stats={stats} />;
};

const MediaPageSkeleton = (): React.ReactElement => {
    return (
        <div className='space-y-5'>
            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={`media-stat-skeleton-${index}`} className='rounded-xl border border-border bg-card p-4'>
                        <div className='h-4 w-24 animate-pulse rounded bg-muted' />
                        <div className='mt-3 h-8 w-20 animate-pulse rounded bg-muted' />
                    </div>
                ))}
            </div>
            <DataTableSkeleton {...MEDIA_TABLE_SKELETON_PROPS} />
        </div>
    );
};

export default function MediaPage(): React.ReactElement {
    return (
        <div className='space-y-6'>
            <PageHeader title='Media Library' description='Upload, organize, and manage media assets for your content.' icon={ImageIcon} />

            <Suspense fallback={<MediaPageSkeleton />}>
                <MediaLibraryWrapper />
            </Suspense>
        </div>
    );
}
