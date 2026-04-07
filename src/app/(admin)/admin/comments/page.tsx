import { MessageCircle } from 'lucide-react';
import { Suspense } from 'react';

import { PageHeader } from '@/components/admin';
import { DataTableSkeleton } from '@/components/admin/table';
import { getComments } from '@/server/new/admin/comments';
import { CommentsTable } from './CommentsTable';
import { COMMENTS_TABLE_SKELETON_PROPS } from './config';

const CommentsTableWrapper = async (): Promise<React.ReactElement> => {
    const response = await getComments();

    if (!response.success || !response.data) {
        return (
            <div className='flex h-64 items-center justify-center rounded-xl border border-dashed'>
                <p className='text-muted-foreground'>Failed to load comments</p>
            </div>
        );
    }

    return <CommentsTable initialData={response.data} initialTotal={response.pagination.total} />;
};

const CommentsPage = (): React.ReactElement => {
    return (
        <div className='space-y-6'>
            <PageHeader
                title='Comments'
                description='View and moderate comments on your content.'
                icon={MessageCircle}
            />

            <Suspense fallback={<DataTableSkeleton {...COMMENTS_TABLE_SKELETON_PROPS} />}>
                <CommentsTableWrapper />
            </Suspense>
        </div>
    );
};

export default CommentsPage;
