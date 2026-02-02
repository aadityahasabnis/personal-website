import { Suspense } from 'react';
import Link from 'next/link';
import { FolderKanban, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/admin';
import { getAllProjectsForAdmin } from '@/server/queries/admin';
import { ProjectsTable } from './ProjectsTable';

/**
 * Projects Management Page
 * 
 * List, create, edit, and delete projects with advanced features:
 * - Search & Filters (by status, featured, tech stack)
 * - Bulk Actions (feature, unfeature, set status, delete)
 * - Drag & Drop Reordering
 * - Multi-select with checkboxes
 */

const ProjectsTableWrapper = async (): Promise<React.ReactElement> => {
    const projects = await getAllProjectsForAdmin();

    return <ProjectsTable projects={projects} />;
};

const ProjectsPage = (): React.ReactElement => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Projects"
                description="Showcase your work, skills, and accomplishments."
                icon={FolderKanban}
                actions={
                    <Link href="/admin/projects/new">
                        <Button>
                            <Plus className="h-4 w-4" />
                            New Project
                        </Button>
                    </Link>
                }
            />

            {/* Projects Table with Search, Filters, Bulk Actions, and Drag & Drop */}
            <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
                <ProjectsTableWrapper />
            </Suspense>
        </div>
    );
};

export default ProjectsPage;
