import { ListTree, Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { PageHeader } from '@/components/admin';
import { DataTableSkeleton } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { getSubtopics } from '@/server/new/admin/subtopic';
import { SubtopicsTable } from './SubtopicsTable';
import { SUBTOPICS_TABLE_SKELETON_PROPS } from './config';

const SubtopicsTableWrapper = async (): Promise<React.ReactElement> => {
    const response = await getSubtopics();

    if (!response.success || !response.data) {
        return (
            <div className='flex h-64 items-center justify-center rounded-xl border border-dashed'>
                <p className='text-muted-foreground'>Failed to load subtopics</p>
            </div>
        );
    }

    return <SubtopicsTable initialData={response.data} initialTotal={response.pagination.total} />;
};

const SubtopicsPage = (): React.ReactElement => {
    return (
        <div className='space-y-6'>
            <PageHeader
                title='Subtopics'
                description='Organize your content with subtopics within each main topic.'
                icon={ListTree}
                actions={
                    <Link href='/admin/subtopics/new'>
                        <Button>
                            <Plus className='h-4 w-4' />
                            New Subtopic
                        </Button>
                    </Link>
                }
            />

            <Suspense fallback={<DataTableSkeleton {...SUBTOPICS_TABLE_SKELETON_PROPS} />}>
                <SubtopicsTableWrapper />
            </Suspense>
        </div>
    );
};

export default SubtopicsPage;
