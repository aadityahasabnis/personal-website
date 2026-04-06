import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import SubtopicForm from '@/app/(admin)/admin/subtopics/SubtopicForm';
import { getSubtopicForEdit } from '@/server/new/admin/subtopic/getSubtopics';
interface IEditSubtopicPageProps {
    params: Promise<{
        subtopicId: string;
    }>;
}

const EditSubtopicPage = async ({ params }: IEditSubtopicPageProps): Promise<React.ReactElement> => {
    const { subtopicId } = await params;

    const subtopic = await getSubtopicForEdit(subtopicId);
    if (!subtopic.success || !subtopic.data) notFound();

    const subtopicData = subtopic.data;

    return (
        <div className='mx-auto max-w-2xl space-y-6 pb-6'>
            <div>
                <Link href='/admin/subtopics' className='mb-4 inline-flex items-center gap-2 text-label text-muted-foreground transition-fast hover:text-foreground'>
                    <ArrowLeft className='size-4' />
                    Back to Subtopics
                </Link>
                <h1 className='text-h1 text-foreground'>Edit Subtopic</h1>
                <p className='mt-1 text-regular text-muted-foreground'>Update &ldquo;{subtopicData.title}&rdquo; subtopic settings.</p>
            </div>

            {subtopicData.contentCount > 0 && (
                <div className='flex items-start gap-3 rounded-lg border border-warning bg-warning/10 p-4 text-label text-warning'>
                    <AlertCircle className='mt-0.5 size-5 shrink-0' />
                    <div>
                        <p className='font-medium'>This subtopic has {subtopicData.contentCount} article(s)</p>
                        <p className='mt-1 text-muted-foreground'>Changing the slug will update all article URLs. Make sure to set up redirects if needed.</p>
                    </div>
                </div>
            )}

            <SubtopicForm subtopic={subtopicData} isEditing />
        </div>
    );
};

export default EditSubtopicPage;
