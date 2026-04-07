import { Mail, Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { PageHeader } from '@/components/admin';
import { DataTableSkeleton } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { getNewsletters } from '@/server/new/admin/newsletter';
import { NewslettersTable } from './NewslettersTable';
import { NEWSLETTERS_TABLE_SKELETON_PROPS } from './config';

// =============================================================
// Async Table Wrapper for SSR Data Loading
// =============================================================

const NewslettersTableWrapper = async (): Promise<React.ReactElement> => {
    const response = await getNewsletters();

    if (!response.success || !response.data) {
        return (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed">
                <p className="text-muted-foreground">Failed to load newsletters</p>
            </div>
        );
    }

    return (
        <NewslettersTable
            initialData={response.data}
            initialTotal={response.pagination.total}
        />
    );
};

// =============================================================
// Page Header Actions
// =============================================================

const HeaderActions = (): React.ReactElement => (
    <Button asChild>
        <Link href="/admin/newsletters/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Newsletter
        </Link>
    </Button>
);

// =============================================================
// Newsletters Page
// =============================================================

const NewslettersPage = (): React.ReactElement => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Newsletters"
                description="Create and send newsletters to your subscribers."
                icon={Mail}
                actions={<HeaderActions />}
            />

            <Suspense fallback={<DataTableSkeleton {...NEWSLETTERS_TABLE_SKELETON_PROPS} />}>
                <NewslettersTableWrapper />
            </Suspense>
        </div>
    );
};

export default NewslettersPage;
