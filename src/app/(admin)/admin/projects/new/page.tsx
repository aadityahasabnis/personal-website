import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { ProjectForm } from '../ProjectForm';

const NewProjectPage = (): React.ReactElement => {
    return (
        <div className='mx-auto max-w-6xl space-y-6 pb-6'>
            <div>
                <Link href='/admin/projects' className='mb-4 inline-flex items-center gap-2 text-label text-muted-foreground transition-fast hover:text-foreground'>
                    <ArrowLeft className='size-4' />
                    Back to Projects
                </Link>
                <h1 className='text-h1 text-foreground'>Create New Project</h1>
                <p className='mt-1 text-regular text-muted-foreground'>Use the stepper to configure details, tech stack, and content.</p>
            </div>

            <ProjectForm />
        </div>
    );
};

export default NewProjectPage;
