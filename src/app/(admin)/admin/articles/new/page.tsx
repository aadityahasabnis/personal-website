import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { ArticleForm } from '../ArticleForm';
const NewArticlePage = (): React.ReactElement => {
    return (
        <div className='max-w-6xl mx-auto space-y-6'>
            <div>
                <Link href='/admin/articles' className='inline-flex items-center gap-2 mb-4 text-label text-muted-foreground transition-fast hover:text-foreground'>
                    <ArrowLeft className='size-4' />
                    Back to Articles
                </Link>
                <h1 className='text-h1 text-foreground'>Create New Article</h1>
                <p className='mt-1 text-regular text-muted-foreground'>Use the stepper to configure taxonomy, details, content, and SEO.</p>
            </div>

            <div className='p-6 bg-card border border-border rounded-xl'>
                <ArticleForm />
            </div>
        </div>
    );
};

export default NewArticlePage;
