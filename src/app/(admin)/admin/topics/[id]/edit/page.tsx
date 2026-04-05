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
        <div className='max-w-2xl mx-auto space-y-6'>
            <div>
                <Link href='/admin/topics' className='inline-flex items-center gap-2 mb-4 text-label text-muted-foreground transition-fast hover:text-foreground'>
                    <ArrowLeft className='size-4' />
                    Back to Topics
                </Link>
                <h1 className='text-h1 text-foreground'>Edit Topic</h1>
                <p className='mt-1 text-regular text-muted-foreground'>Update &ldquo;{topic.title}&rdquo; topic settings.</p>
            </div>

            {topic.contentCount > 0 && (
                <div className='flex items-start gap-3 p-4 rounded-lg border border-warning bg-warning/10 text-label text-warning'>
                    <AlertCircle className='size-5 shrink-0 mt-0.5' />
                    <div>
                        <p className='font-medium'>This topic has {topic.contentCount} article(s)</p>
                        <p className='mt-1 text-muted-foreground'>Changing the slug will update all article URLs. Make sure to set up redirects if needed.</p>
                    </div>
                </div>
            )}

            <div className='p-6 bg-card border border-border rounded-xl'>
                <TopicForm topic={topic} isEditing />
            </div>
        </div>
    );
};

export default EditTopicPage;
