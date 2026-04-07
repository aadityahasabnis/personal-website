import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { PageHeader } from '@/components/admin';
import { DataTableSkeleton } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { getBlogs } from '@/server/new/admin/content/blog';
import { BlogsTable } from './BlogsTable';
import { BLOGS_TABLE_SKELETON_PROPS } from './config';

const BlogsTableWrapper = async (): Promise<React.ReactElement> => {
    const response = await getBlogs();

    if (!response.success || !response.data) {
        return (
            <div className='flex h-64 items-center justify-center rounded-xl border border-dashed'>
                <p className='text-muted-foreground'>Failed to load blogs</p>
            </div>
        );
    }

    return <BlogsTable initialData={response.data} initialTotal={response.pagination.total} />;
};

const BlogsPage = (): React.ReactElement => {
    return (
        <div className='space-y-6'>
            <PageHeader
                title='Blogs'
                description='Manage your personal blog posts and stories.'
                icon={FileText}
                actions={
                    <Link href='/admin/blogs/new'>
                        <Button>
                            <Plus className='h-4 w-4' />
                            New Blog
                        </Button>
                    </Link>
                }
            />

            <Suspense fallback={<DataTableSkeleton {...BLOGS_TABLE_SKELETON_PROPS} />}>
                <BlogsTableWrapper />
            </Suspense>
        </div>
    );
};

export default BlogsPage;
