import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { PageHeader } from '@/components/admin';
import { DataTableSkeleton } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { getArticles } from '@/server/new/admin/content/article';
import { ArticlesTable } from './ArticlesTable';
import { ARTICLES_TABLE_SKELETON_PROPS } from './config';

const ArticlesTableWrapper = async (): Promise<React.ReactElement> => {
    const response = await getArticles();

    if (!response.success || !response.data) {
        return (
            <div className='flex h-64 items-center justify-center rounded-xl border border-dashed'>
                <p className='text-muted-foreground'>Failed to load articles</p>
            </div>
        );
    }

    return <ArticlesTable initialData={response.data} initialTotal={response.pagination.total} />;
};

const ArticlesPage = (): React.ReactElement => {
    return (
        <div className='space-y-6'>
            <PageHeader
                title='Articles'
                description='Manage your blog posts, tutorials, and technical articles.'
                icon={FileText}
                actions={
                    <Link href='/admin/articles/new'>
                        <Button>
                            <Plus className='h-4 w-4' />
                            New Article
                        </Button>
                    </Link>
                }
            />

            <Suspense fallback={<DataTableSkeleton {...ARTICLES_TABLE_SKELETON_PROPS} />}>
                <ArticlesTableWrapper />
            </Suspense>
        </div>
    );
};

export default ArticlesPage;
