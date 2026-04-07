import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import TopicForm from '@/app/(admin)/admin/topics/TopicForm';
import { getTopicForEdit } from '@/server/new/admin/topic/getTopics';

interface IEditTopicPageProps {
    params: Promise<{
        id: string;
    }>;
}

const EditTopicPage = async ({ params }: IEditTopicPageProps): Promise<React.ReactElement> => {
    const { id } = await params;
    const result = await getTopicForEdit(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const topic = result.data;

    return (
        <div className='mx-auto max-w-2xl space-y-6 pb-6'>
            <div>
                <Link href='/admin/topics' className='mb-4 inline-flex items-center gap-2 text-label text-muted-foreground transition-fast hover:text-foreground'>
                    <ArrowLeft className='size-4' />
                    Back to Topics
                </Link>
                <h1 className='text-h1 text-foreground'>Edit Topic</h1>
                <p className='mt-1 text-regular text-muted-foreground'>Update &ldquo;{topic.title}&rdquo; topic settings.</p>
            </div>

            {topic.contentCount > 0 && (
                <div className='flex items-start gap-3 rounded-lg border border-warning bg-warning/10 p-4 text-label text-warning'>
                    <AlertCircle className='mt-0.5 size-5 shrink-0' />
                    <div>
                        <p className='font-medium'>This topic has {topic.contentCount} article(s)</p>
                        <p className='mt-1 text-muted-foreground'>Changing the slug will update all article URLs. Make sure to set up redirects if needed.</p>
                    </div>
                </div>
            )}

            <TopicForm topic={topic} isEditing />
        </div>
    );
};

export default EditTopicPage;
