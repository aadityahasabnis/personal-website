import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import SubtopicForm from '@/app/(admin)/admin/subtopics/SubtopicForm';
import { getSubtopicForEdit, getSubtopics } from '@/server/new/admin/subtopic/getSubtopics';
interface IEditSubtopicPageProps {
    params: Promise<{
        topicSlug: string;
        slug: string;
    }>;
}

const EditSubtopicPage = async ({ params }: IEditSubtopicPageProps): Promise<React.ReactElement> => {
    const { topicSlug, slug } = await params;

    // We need the subtopic ID. getSubtopicForEdit expects an ID.
    // For now, look up by topicSlug + slug via the getSubtopics query
    const result = await getSubtopics({ query: slug });

    if (!result.success || !result.data || result.data.length === 0) {
        notFound();
    }

    // Find exact match by topicSlug + slug
    const matched = result.data.find((s) => s.topicSlug === topicSlug && s.slug === slug);
    if (!matched) notFound();

    const editResult = await getSubtopicForEdit(matched.id);
    if (!editResult.success || !editResult.data) notFound();

    const subtopic = editResult.data;

    return (
        <div className='max-w-2xl mx-auto space-y-6'>
            <div>
                <Link href='/admin/subtopics' className='inline-flex items-center gap-2 mb-4 text-label text-muted-foreground transition-fast hover:text-foreground'>
                    <ArrowLeft className='size-4' />
                    Back to Subtopics
                </Link>
                <h1 className='text-h1 text-foreground'>Edit Subtopic</h1>
                <p className='mt-1 text-regular text-muted-foreground'>Update &ldquo;{subtopic.title}&rdquo; subtopic settings.</p>
            </div>

            {subtopic.contentCount > 0 && (
                <div className='flex items-start gap-3 p-4 rounded-lg border border-warning bg-warning/10 text-label text-warning'>
                    <AlertCircle className='size-5 shrink-0 mt-0.5' />
                    <div>
                        <p className='font-medium'>This subtopic has {subtopic.contentCount} article(s)</p>
                        <p className='mt-1 text-muted-foreground'>Changing the slug will update all article URLs. Make sure to set up redirects if needed.</p>
                    </div>
                </div>
            )}

            <div className='p-6 bg-card border border-border rounded-xl'>
                <SubtopicForm subtopic={subtopic} isEditing />
            </div>
        </div>
    );
};

export default EditSubtopicPage;
