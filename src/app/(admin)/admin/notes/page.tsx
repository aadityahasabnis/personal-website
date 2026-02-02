import { Suspense } from 'react';
import Link from 'next/link';
import { BookText, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/admin';
import { getAllNotesForAdmin } from '@/server/queries/admin';
import { NotesTable } from './NotesTable';

/**
 * Notes Management Page
 * 
 * List, create, edit, and delete notes
 * Features: Search, Filters, Bulk Actions, Infinite Scroll
 */

const NotesTableWrapper = async (): Promise<React.ReactElement> => {
    const notes = await getAllNotesForAdmin();

    return <NotesTable notes={notes} />;
};

const NotesPage = (): React.ReactElement => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Notes"
                description="Quick, atomic pieces of knowledge and insights."
                icon={BookText}
                actions={
                    <Link href="/admin/notes/new">
                        <Button>
                            <Plus className="h-4 w-4" />
                            New Note
                        </Button>
                    </Link>
                }
            />

            {/* Notes Table */}
            <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
                <NotesTableWrapper />
            </Suspense>
        </div>
    );
};

export default NotesPage;
