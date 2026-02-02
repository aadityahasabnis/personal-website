import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin';
import { getNoteForEdit } from '@/server/queries/admin';
import { NoteForm } from '../../NoteForm';

interface IEditNotePageProps {
    params: Promise<{
        slug: string;
    }>;
}

/**
 * Edit Note Page
 */

const EditNotePage = async ({ params }: IEditNotePageProps): Promise<React.ReactElement> => {
    const { slug } = await params;
    const note = await getNoteForEdit(slug);

    if (!note) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title={`Edit: ${note.title}`}
                description="Update your note content and settings."
                icon={BookText}
                actions={
                    <Link href="/admin/notes">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Notes
                        </Button>
                    </Link>
                }
            />

            {/* Form */}
            <div className="rounded-xl border bg-card p-6">
                <NoteForm note={note} isEditing />
            </div>
        </div>
    );
};

export default EditNotePage;
