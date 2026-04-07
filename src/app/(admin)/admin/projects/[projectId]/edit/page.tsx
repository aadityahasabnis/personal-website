import ProjectForm from '@/app/(admin)/admin/projects/ProjectForm';
import { PageHeader } from '@/components/admin';
import { getProjectForEdit } from '@/server/new/admin/content/project/getProjects';
import { ArrowLeft, FolderKanban } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EditProjectPageProps {
    params: Promise<{
        projectId: string;
    }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
    const { projectId } = await params;
    const project = await getProjectForEdit(projectId);
    if (!project.success || !project.data) notFound();
    const projectData = project.data;

    return (
        <div className='mx-auto max-w-6xl space-y-6 pb-6'>
            <div className='flex items-center gap-4'>
                <Link href='/admin/projects' className='inline-flex items-center justify-center rounded-lg border bg-background p-2 hover:bg-muted transition-colors' aria-label='Back to projects'>
                    <ArrowLeft className='h-4 w-4' />
                </Link>
                <div className='flex-1'>
                    <PageHeader title={`Edit: ${projectData.title}`} description={`Last updated ${new Date(projectData.updatedAt).toLocaleDateString()}`} icon={FolderKanban} />
                </div>
            </div>

            <ProjectForm project={projectData} isEditing />
        </div>
    );
}
