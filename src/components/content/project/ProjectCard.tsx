import { PROJECT_STATUS, type ProjectStatusType } from '@/constants/schemaConstants';
import { ArrowUpRight, ExternalLink, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Pill } from '@/components/ui/pill';
import { cn, formatDate } from '@/lib/utils';
import type { IPublicProjectListItem } from '@/server/new/public/content/project';
import { FaGithub } from 'react-icons/fa';

const MAX_VISIBLE_TECH_STACK = 4;

type TProjectCardVariant = 'default' | 'featured';

const toStatusPillVariant = (status: ProjectStatusType | null): 'success' | 'warning' | 'neutral' => {
    if (status === PROJECT_STATUS.LIVE) {
        return 'success';
    }

    if (status === PROJECT_STATUS.IN_PROGRESS) {
        return 'warning';
    }

    return 'neutral';
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
    const detailHref = `/projects/${project.slug}`;

    return (
        <article className={cn('relative h-full', className)}>
            <div
                className={cn(
                    'group relative flex h-full overflow-hidden rounded-xl border border-border bg-card shadow-none transition-slow hover:border-primary/25 hover:shadow-md focus-within:border-primary/40 focus-within:shadow-glow-sm',
                    isFeatured ? 'flex-col md:flex-row' : 'flex-col',
                )}
            >
                <Link
                    href={detailHref}
                    aria-label={`Open project ${project.title}`}
                    className='absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                />

                <div className={cn('relative w-full shrink-0 overflow-hidden bg-muted', isFeatured ? 'h-56 md:h-auto md:w-[46%] lg:w-1/2' : 'h-52')}>
                    {project.coverImage ? (
                        <Image src={project.coverImage} alt={project.title} fill sizes={imageSizes} className='object-cover' />
                    ) : (
                        <div className='flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 to-primary/5'>
                            <FolderOpen className='size-10 text-muted-foreground' aria-hidden='true' />
                        </div>
                    )}

                    {project.status && (
                        <Pill variant={toStatusPillVariant(project.status)} size='status' className='absolute top-4 left-4 z-20 pointer-events-none backdrop-blur-sm'>
                            {project.status}
                        </Pill>
                    )}

                    <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-slow group-hover:opacity-100 group-focus-within:opacity-100' />

                    <div className='pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center p-4 opacity-0 transition-slow group-hover:opacity-100 group-focus-within:opacity-100'>
                        <Pill variant='default' size='cta' className='text-primary-foreground!'>
                            See Details
                            <ArrowUpRight
                                className='size-4 transition-slow group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-within:translate-x-0.5 group-focus-within:-translate-y-0.5'
                                aria-hidden='true'
                            />
                        </Pill>
                    </div>
                </div>

                <div className={cn('relative flex flex-1 flex-col gap-3 p-6', isFeatured ? 'justify-center md:p-8' : '')}>
                    {project.publishedAt && (
                        <p className='text-small text-muted-foreground'>
                            <time dateTime={new Date(project.publishedAt).toISOString()}>{formatDate(project.publishedAt)}</time>
                        </p>
                    )}

                    <h2 className={cn('text-foreground font-semibold leading-tight', isFeatured ? 'text-h2 md:text-h1' : 'text-h3')}>{project.title}</h2>

                    <p className={cn('text-body leading-7 text-muted-foreground', isFeatured ? 'line-clamp-3 md:max-w-[56ch]' : 'line-clamp-2')}>{project.description}</p>

                    {visibleTechStack.length > 0 && (
                        <ul className='flex flex-wrap gap-2 pt-1' aria-label='Project tech stack'>
                            {visibleTechStack.map((tech) => (
                                <li key={`${project.id}-${tech}`}>
                                    <Pill variant='subtle' size='chip'>
                                        {tech}
                                    </Pill>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className='relative z-20 flex flex-wrap items-center gap-3 pt-1'>
                        {project.githubUrl && (
                            <Link
                                href={project.githubUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-label font-medium text-foreground transition-base hover:border-primary/40 hover:text-primary'
                            >
                                <FaGithub className='size-4' aria-hidden='true' />
                                <span>Code</span>
                            </Link>
                        )}

                        {project.liveUrl && (
                            <Link
                                href={project.liveUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-label font-medium text-foreground transition-base hover:border-primary/40 hover:text-primary'
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
