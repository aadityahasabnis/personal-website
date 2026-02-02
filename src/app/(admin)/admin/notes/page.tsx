import { Suspense } from 'react';
import Link from 'next/link';
import { BookText, Plus, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    PageHeader,
    EmptyState,
    StatusBadge,
    DataTableActions,
    createEditAction,
    createDeleteAction,
    createTogglePublishedAction,
    createToggleFeaturedAction,
} from '@/components/admin';
import { getAllNotesForAdmin } from '@/server/queries/admin';
import {
    deleteNote,
    toggleNotePublished,
    toggleNoteFeatured,
} from '@/server/actions/notes';
import { formatDate } from '@/lib/utils';
import type { INote } from '@/interfaces';

/**
 * Notes Management Page
 * 
 * List, create, edit, and delete notes
 */

interface INoteRowProps {
    note: INote;
}

const NoteRow = ({ note }: INoteRowProps): React.ReactElement => {
    // Server actions
    const handleDelete = async (): Promise<void> => {
        'use server';
        await deleteNote(note.slug);
    };

    const handleTogglePublished = async (): Promise<void> => {
        'use server';
        await toggleNotePublished(note.slug);
    };

    const handleToggleFeatured = async (): Promise<void> => {
        'use server';
        await toggleNoteFeatured(note.slug);
    };

    const actions = [
        createEditAction(`/admin/notes/${note.slug}/edit`),
        createTogglePublishedAction(note.published || false, handleTogglePublished),
        createToggleFeaturedAction(note.featured || false, handleToggleFeatured),
        createDeleteAction(handleDelete, `"${note.title}"`),
    ];

    return (
        <tr className="border-b transition-colors hover:bg-muted/50">
            <td className="p-4">
                <div className="min-w-0">
                    <Link
                        href={`/admin/notes/${note.slug}/edit`}
                        className="font-medium hover:underline hover:text-accent line-clamp-1"
                    >
                        {note.title}
                    </Link>
                    {note.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                            {note.description}
                        </p>
                    )}
                </div>
            </td>

            <td className="p-4 text-center">
                <StatusBadge variant="published" value={note.published || false} />
            </td>

            <td className="p-4 text-center">
                <StatusBadge variant="featured" value={note.featured || false} />
            </td>

            <td className="p-4">
                {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {note.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                        {note.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                                +{note.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </td>

            <td className="p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(note.updatedAt)}
                </div>
            </td>

            <td className="p-4">
                <DataTableActions actions={actions} itemName={`"${note.title}"`} />
            </td>
        </tr>
    );
};

const NotesTable = async (): Promise<React.ReactElement> => {
    const notes = await getAllNotesForAdmin();

    if (notes.length === 0) {
        return (
            <EmptyState
                icon={BookText}
                title="No notes yet"
                description="Notes are quick, atomic pieces of knowledge. Create your first note to get started."
                actionLabel="Create Note"
                actionHref="/admin/notes/new"
            />
        );
    }

    return (
        <div className="rounded-xl border bg-card overflow-x-auto">
            <table className="w-full">
                <thead className="border-b bg-muted/50">
                    <tr>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Note
                        </th>
                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">
                            Status
                        </th>
                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">
                            Featured
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Tags
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Last Updated
                        </th>
                        <th className="p-4 w-16"></th>
                    </tr>
                </thead>
                <tbody>
                    {notes.map((note) => (
                        <NoteRow key={note.slug} note={note} />
                    ))}
                </tbody>
            </table>
        </div>
    );
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
                <NotesTable />
            </Suspense>
        </div>
    );
};

export default NotesPage;
