import { PageHeaderSkeleton, ProjectsGridSkeleton } from '@/components/feedback/Skeleton';

/**
 * Loading skeleton for projects listing page
 */
const ProjectsLoading = () => {
    return (
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 md:py-32">
            <PageHeaderSkeleton />
            <ProjectsGridSkeleton />
        </div>
    );
};

export default ProjectsLoading;
