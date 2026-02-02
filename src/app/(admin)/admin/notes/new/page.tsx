import Link from 'next/link';
import { ArrowLeft, BookText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin';
import { NoteForm } from '../NoteForm';

/**
 * Create New Note Page
 */

const NewNotePage = (): React.ReactElement => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Create New Note"
                description="Add a quick, atomic piece of knowledge."
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
                <NoteForm />
            </div>
        </div>
    );
};

export default NewNotePage;
