import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { BlogForm } from '../BlogForm';

const NewBlogPage = (): React.ReactElement => {
    return (
        <div className='mx-auto max-w-6xl space-y-6 pb-6'>
            <div>
                <Link href='/admin/blogs' className='mb-4 inline-flex items-center gap-2 text-label text-muted-foreground transition-fast hover:text-foreground'>
                    <ArrowLeft className='size-4' />
                    Back to Blogs
                </Link>
                <h1 className='text-h1 text-foreground'>Create New Blog</h1>
                <p className='mt-1 text-regular text-muted-foreground'>Use the stepper to configure details, content, and SEO.</p>
            </div>

            <BlogForm />
        </div>
    );
};

export default NewBlogPage;
