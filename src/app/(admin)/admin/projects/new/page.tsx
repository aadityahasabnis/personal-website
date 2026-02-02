import Link from 'next/link';
import { ArrowLeft, FolderKanban } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin';
import { ProjectForm } from '../ProjectForm';

/**
 * Create New Project Page
 */

const NewProjectPage = (): React.ReactElement => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Create New Project"
                description="Showcase your work, skills, and accomplishments."
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
                <ProjectForm />
            </div>
        </div>
    );
};

export default NewProjectPage;
