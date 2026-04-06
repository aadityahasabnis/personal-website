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
        <div className='max-w-2xl mx-auto space-y-6'>
            <div>
                <Link href='/admin/subtopics' className='inline-flex items-center gap-2 mb-4 text-label text-muted-foreground transition-fast hover:text-foreground'>
                    <ArrowLeft className='size-4' />
                    Back to Subtopics
                </Link>
                <h1 className='text-h1 text-foreground'>Edit Subtopic</h1>
                <p className='mt-1 text-regular text-muted-foreground'>Update &ldquo;{subtopicData.title}&rdquo; subtopic settings.</p>
            </div>

            {subtopicData.contentCount > 0 && (
                <div className='flex items-start gap-3 p-4 rounded-lg border border-warning bg-warning/10 text-label text-warning'>
                    <AlertCircle className='size-5 shrink-0 mt-0.5' />
                    <div>
                        <p className='font-medium'>This subtopic has {subtopicData.contentCount} article(s)</p>
                        <p className='mt-1 text-muted-foreground'>Changing the slug will update all article URLs. Make sure to set up redirects if needed.</p>
                    </div>
                </div>
            )}

            <div className='p-6 bg-card border border-border rounded-xl'>
                <SubtopicForm subtopic={subtopicData} isEditing />
            </div>
        </div>
    );
};

export default EditSubtopicPage;
