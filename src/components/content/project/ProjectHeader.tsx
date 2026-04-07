import { ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';

import type { IPublicProjectDetail } from '@/server/new/public/content/project';

import { ProjectMeta } from './ProjectMeta';

interface IProjectHeaderProps {
    project: IPublicProjectDetail;
}

export const ProjectHeader = ({ project }: IProjectHeaderProps) => {
    return (
        <header className='mb-10'>
            {project.tags.length > 0 && (
                <div className='flex flex-wrap gap-2 mb-4'>
                    {project.tags.slice(0, 6).map((tag) => (
                        <span key={tag} className='inline-flex items-center px-2.5 py-1 text-label font-medium text-primary bg-primary/10 border border-primary/20 rounded-md'>
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <h1 className='text-display font-semibold leading-tight text-foreground'>{project.title}</h1>
            <p className='mt-4 max-w-3xl text-h4 text-muted-foreground'>{project.description}</p>

            <ProjectMeta className='mt-5' status={project.status} publishedAt={project.publishedAt} updatedAt={project.updatedAt} readingTime={project.readingTime} />

            <div className='flex flex-wrap items-center gap-3 mt-6'>
                {project.githubUrl && (
                    <Link
                        href={project.githubUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-2 px-4 py-2 text-label font-medium text-foreground bg-card border border-border rounded-lg transition-base hover:text-primary hover:border-primary/40'
                    >
                        <Github className='size-4' aria-hidden='true' />
                        <span>Source</span>
                    </Link>
                )}

                {project.liveUrl && (
                    <Link
                        href={project.liveUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-2 px-4 py-2 text-label font-medium text-foreground bg-card border border-border rounded-lg transition-base hover:text-primary hover:border-primary/40'
                    >
                        <ExternalLink className='size-4' aria-hidden='true' />
                        <span>Live Demo</span>
                    </Link>
                )}
            </div>
        </header>
    );
};

export type { IProjectHeaderProps };
