import { Layers, Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { PageHeader } from '@/components/admin';
import { DataTableSkeleton } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { getTopics } from '@/server/new/admin/topic';
import { TopicsTable } from './TopicsTable';
import { TOPICS_TABLE_SKELETON_PROPS } from './config';

const TopicsTableWrapper = async (): Promise<React.ReactElement> => {
    const response = await getTopics();

    if (!response.success || !response.data) {
        return (
            <div className='flex h-64 items-center justify-center rounded-xl border border-dashed'>
                <p className='text-muted-foreground'>Failed to load topics</p>
            </div>
        );
    }

    return <TopicsTable initialData={response.data} initialTotal={response.pagination.total} />;
};

const TopicsPage = (): React.ReactElement => {
    return (
        <div className='space-y-6'>
            <PageHeader
                title='Topics'
                description='Manage topics to organize your articles into categories.'
                icon={Layers}
                actions={
                    <Link href='/admin/topics/new'>
                        <Button>
                            <Plus className='h-4 w-4' />
                            New Topic
                        </Button>
                    </Link>
                }
            />

            <Suspense fallback={<DataTableSkeleton {...TOPICS_TABLE_SKELETON_PROPS} />}>
                <TopicsTableWrapper />
            </Suspense>
        </div>
    );
};

export default TopicsPage;
