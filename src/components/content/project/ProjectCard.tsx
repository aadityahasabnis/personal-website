import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { IPublicProjectListItem } from '@/server/new/public/content/project';

import { ProjectMeta } from './ProjectMeta';

export interface IProjectCardProps {
    project: IPublicProjectListItem;
    featured?: boolean;
}

export const ProjectCard = ({ project, featured = false }: IProjectCardProps) => {
    return (
        <article className='relative group'>
            <div className='relative overflow-hidden bg-card border border-border rounded-2xl transition-base hover:border-primary/40'>
                <div className='relative overflow-hidden aspect-video bg-muted'>
                    {project.coverImage ? (
                        <Image src={project.coverImage} alt={project.title} fill className='object-cover transition-base group-hover:scale-[1.02]' sizes='(max-width: 768px) 100vw, 50vw' />
                    ) : (
                        <div className='absolute inset-0 flex items-center justify-center'>
                            <span className='text-5xl font-light text-muted-foreground' aria-hidden='true'>
                                {project.title.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>

                <div className='p-6'>
                    {project.tags.length > 0 && (
                        <div className='flex flex-wrap gap-2 mb-4'>
                            {project.tags.slice(0, 4).map((tag) => (
                                <span key={tag} className='inline-flex items-center px-2.5 py-1 text-label font-medium text-primary bg-primary/10 border border-primary/20 rounded-md'>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <h2 className='text-h3 font-medium text-foreground'>
                        <Link href={`/projects/${project.slug}`} className='transition-base hover:text-primary'>
                            {project.title}
                        </Link>
                    </h2>
                    <p className='mt-3 text-body text-muted-foreground'>{project.description}</p>

                    <ProjectMeta className='mt-4' status={project.status} publishedAt={project.publishedAt} updatedAt={project.updatedAt} readingTime={project.readingTime} />

                    <div className='flex flex-wrap items-center gap-3 mt-5'>
                        {project.githubUrl && (
                            <Link
                                href={project.githubUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-2 px-3 py-1.5 text-label font-medium text-foreground bg-background border border-border rounded-md transition-base hover:text-primary hover:border-primary/40'
                            >
                                <Github className='size-4' aria-hidden='true' />
                                <span>Code</span>
                            </Link>
                        )}

                        {project.liveUrl && (
                            <Link
                                href={project.liveUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-2 px-3 py-1.5 text-label font-medium text-foreground bg-background border border-border rounded-md transition-base hover:text-primary hover:border-primary/40'
                            >
                                <ExternalLink className='size-4' aria-hidden='true' />
                                <span>Live</span>
                            </Link>
                        )}

                        {featured && <span className='inline-flex items-center px-2.5 py-1 text-label font-medium text-foreground bg-muted border border-border rounded-md'>Featured</span>}
                    </div>
                </div>

                <ArrowUpRight className='absolute top-4 right-4 size-4 text-muted-foreground transition-base group-hover:text-primary' aria-hidden='true' />
            </div>
        </article>
    );
};

export default ProjectCard;
