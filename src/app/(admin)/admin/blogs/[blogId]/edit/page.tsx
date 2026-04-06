import BlogForm from '@/app/(admin)/admin/blogs/BlogForm';
import { PageHeader } from '@/components/admin';
import { getBlogForEdit } from '@/server/new/admin/content/blog/getBlogs';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EditBlogPageProps {
    params: Promise<{
        blogId: string;
    }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
    const { blogId } = await params;
    const blog = await getBlogForEdit(blogId);
    if (!blog.success || !blog.data) notFound();
    const blogData = blog.data;

    return (
        <div className='mx-auto max-w-6xl space-y-6 pb-6'>
            <div className='flex items-center gap-4'>
                <Link href='/admin/blogs' className='inline-flex items-center justify-center rounded-lg border bg-background p-2 hover:bg-muted transition-colors' aria-label='Back to blogs'>
                    <ArrowLeft className='h-4 w-4' />
                </Link>
                <div className='flex-1'>
                    <PageHeader title={`Edit: ${blogData.title}`} description={`Last updated ${new Date(blogData.updatedAt).toLocaleDateString()}`} icon={FileText} />
                </div>
            </div>

            <BlogForm blog={blogData} isEditing />
        </div>
    );
}
