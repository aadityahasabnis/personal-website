import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { SubtopicForm } from '../SubtopicForm';

const NewSubtopicPage = (): React.ReactElement => {
    return (
        <div className='max-w-2xl mx-auto space-y-6'>
            <div>
                <Link href='/admin/subtopics' className='inline-flex items-center gap-2 mb-4 text-label text-muted-foreground transition-fast hover:text-foreground'>
                    <ArrowLeft className='size-4' />
                    Back to Subtopics
                </Link>
                <h1 className='text-h1 text-foreground'>Create New Subtopic</h1>
                <p className='mt-1 text-regular text-muted-foreground'>Subtopics help organize articles within a topic.</p>
            </div>

            <div className='p-6 bg-card border border-border rounded-xl'>
                <SubtopicForm />
            </div>
        </div>
    );
};

export default NewSubtopicPage;
