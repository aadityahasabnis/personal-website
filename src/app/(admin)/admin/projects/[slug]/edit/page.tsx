import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FolderKanban } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin';
import { getProjectForEdit } from '@/server/queries/admin';
import { ProjectForm } from '../../ProjectForm';

interface IEditProjectPageProps {
    params: Promise<{
        slug: string;
    }>;
}

/**
 * Edit Project Page
 */

const EditProjectPage = async ({ params }: IEditProjectPageProps): Promise<React.ReactElement> => {
    const { slug } = await params;
    const project = await getProjectForEdit(slug);

    if (!project) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title={`Edit: ${project.title}`}
                description="Update your project details and settings."
                icon={FolderKanban}
                actions={
                    <Link href="/admin/projects">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Projects
                        </Button>
                    </Link>
                }
            />

            {/* Form */}
            <div className="rounded-xl border bg-card p-6">
                <ProjectForm project={project} isEditing />
            </div>
        </div>
    );
};

export default EditProjectPage;
