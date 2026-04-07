import { FolderKanban, Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { PageHeader } from '@/components/admin';
import { DataTableSkeleton } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { getProjects } from '@/server/new/admin/content/project';
import { ProjectsTable } from './ProjectsTable';
import { PROJECTS_TABLE_SKELETON_PROPS } from './config';

/**
 * Projects Management Page
 * 
 * List, create, edit, and delete projects with advanced features:
 * - Search & Filters (by status, featured, tech stack)
 * - Bulk Actions (feature, unfeature, set status, delete)
 * - Multi-select with checkboxes
 */

const ProjectsTableWrapper = async (): Promise<React.ReactElement> => {
    const response = await getProjects();

    if (!response.success || !response.data) {
        return (
            <div className='flex h-64 items-center justify-center rounded-xl border border-dashed'>
                <p className='text-muted-foreground'>Failed to load projects</p>
            </div>
        );
    }

    return <ProjectsTable initialData={response.data} initialTotal={response.pagination.total} />;
};

const ProjectsPage = (): React.ReactElement => {
    return (
        <div className='space-y-6'>
            <PageHeader
                title='Projects'
                description='Showcase your work, skills, and accomplishments.'
                icon={FolderKanban}
                actions={
                    <Link href='/admin/projects/new'>
                        <Button>
                            <Plus className='h-4 w-4' />
                            New Project
                        </Button>
                    </Link>
                }
            />

            <Suspense fallback={<DataTableSkeleton {...PROJECTS_TABLE_SKELETON_PROPS} />}>
                <ProjectsTableWrapper />
            </Suspense>
        </div>
    );
};

export default ProjectsPage;
