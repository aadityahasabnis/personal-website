import { PROJECT_STATUS, type ProjectStatusType } from '@/constants/schemaConstants';
import { ArrowUpRight, ExternalLink, FolderOpen, Github } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { cn, formatDate } from '@/lib/utils';
import type { IPublicProjectListItem } from '@/server/new/public/content/project';

const MAX_VISIBLE_TECH_STACK = 4;

type TProjectCardVariant = 'default' | 'featured';

const toStatusPillClassName = (status: ProjectStatusType | null): string => {
    if (status === PROJECT_STATUS.LIVE) {
        return 'border-success/35 bg-success/15 text-success';
    }

    if (status === PROJECT_STATUS.IN_PROGRESS) {
        return 'border-warning/35 bg-warning/15 text-warning';
    }

    return 'border-border bg-background/85 text-muted-foreground';
};

export interface IProjectCardProps {
    project: IPublicProjectListItem;
    variant?: TProjectCardVariant;
    className?: string;
}

export const ProjectCard = ({ project, variant = 'default', className }: IProjectCardProps) => {
    const isFeatured = variant === 'featured';
    const visibleTechStack = project.techStack.slice(0, MAX_VISIBLE_TECH_STACK);
    const imageSizes = isFeatured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

    return (
        <article className={cn('relative h-full', className)}>
            <div
                className={cn(
                    'group relative flex h-full overflow-hidden rounded-xl border border-border bg-card shadow-none transition-base hover:border-primary/25 hover:shadow-md focus-within:border-primary/40 focus-within:shadow-glow-sm',
                    isFeatured ? 'flex-col md:flex-row' : 'flex-col',
                )}
            >
                <div className={cn('relative w-full shrink-0 overflow-hidden bg-muted', isFeatured ? 'h-56 md:h-auto md:w-[46%] lg:w-1/2' : 'h-52')}>
                    {project.coverImage ? (
                        <Image src={project.coverImage} alt={project.title} fill sizes={imageSizes} className='object-cover transition-slow group-hover:scale-105 group-focus-within:scale-105' />
                    ) : (
                        <div className='flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 to-primary/5'>
                            <FolderOpen className='size-10 text-muted-foreground' aria-hidden='true' />
                        </div>
                    )}

                    {project.status && (
                        <span
                            className={cn(
                                'absolute top-4 left-4 z-10 inline-flex items-center px-3 py-0.5 text-xs font-medium rounded-full border backdrop-blur-sm',
                                toStatusPillClassName(project.status),
                            )}
                        >
                            {project.status}
                        </span>
                    )}

                    <div className='absolute inset-0 opacity-0 bg-linear-to-t from-background/70 via-background/15 to-transparent transition-base group-hover:opacity-100 group-focus-within:opacity-100' />

                    <div className='absolute inset-x-0 bottom-0 z-10 flex items-center p-4 opacity-0 transition-base group-hover:opacity-100 group-focus-within:opacity-100'>
                        <Link
                            href={`/projects/${project.slug}`}
                            className='inline-flex items-center gap-1.5 px-3 py-1 text-small font-medium text-primary-foreground rounded-full bg-primary transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        >
                            See Details
                            <ArrowUpRight
                                className='size-4 transition-base group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-within:translate-x-0.5 group-focus-within:-translate-y-0.5'
                                aria-hidden='true'
                            />
                        </Link>
                    </div>
                </div>

                <div className={cn('relative flex flex-1 flex-col gap-3 p-6', isFeatured ? 'justify-center md:p-8' : '')}>
                    {project.publishedAt && (
                        <p className='text-small text-muted-foreground'>
                            <time dateTime={new Date(project.publishedAt).toISOString()}>{formatDate(project.publishedAt)}</time>
                        </p>
                    )}

                    <h2 className={cn('font-semibold leading-tight text-foreground transition-base hover:text-primary', isFeatured ? 'text-h2 md:text-h1' : 'text-h3')}>
                        <Link href={`/projects/${project.slug}`} className='focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                            {project.title}
                        </Link>
                    </h2>

                    <p className={cn('text-body leading-7 text-muted-foreground', isFeatured ? 'line-clamp-3 md:max-w-[56ch]' : 'line-clamp-2')}>{project.description}</p>

                    {visibleTechStack.length > 0 && (
                        <ul className='flex flex-wrap gap-2 pt-1' aria-label='Project tech stack'>
                            {visibleTechStack.map((tech) => (
                                <li key={`${project.id}-${tech}`}>
                                    <span className='inline-flex items-center px-2.5 py-1 text-label font-medium text-primary rounded-full bg-primary/8'>{tech}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className='flex flex-wrap items-center gap-3 pt-1'>
                        {project.githubUrl && (
                            <Link
                                href={project.githubUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-2 px-3 py-1.5 text-label font-medium text-foreground rounded-md border border-border bg-background transition-base hover:border-primary/40 hover:text-primary'
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
                                className='inline-flex items-center gap-2 px-3 py-1.5 text-label font-medium text-foreground rounded-md border border-border bg-background transition-base hover:border-primary/40 hover:text-primary'
                            >
                                <ExternalLink className='size-4' aria-hidden='true' />
                                <span>Live</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ProjectCard;
