import Image from 'next/image';
import Link from 'next/link';

import { BeamLine } from '@/components/common/BeamLine';
import { FadeIn } from '@/components/motion/FadeIn';
import { Pill } from '@/components/ui/pill';
import { cn, formatDate } from '@/lib/utils';
import type { IPublicProjectDetail } from '@/server/new/public/content/project';
import { Calendar, ChevronRight, Clock, ExternalLink, Wrench } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

interface IProjectBreadcrumb {
    label: string;
    href: string;
}

interface IProjectHeaderProps {
    project: IPublicProjectDetail;
    breadcrumbs?: IProjectBreadcrumb[];
    className?: string;
}

// =============================================================
// ProjectHeader — header for individual project detail pages
// =============================================================
export const ProjectHeader = ({ project, breadcrumbs, className }: IProjectHeaderProps) => {
    const showUpdated = Boolean(project.updatedAt && project.publishedAt && new Date(project.updatedAt) > new Date(project.publishedAt));
    const allTags = Array.from(new Set([...(project.tags ?? []), ...(project.techStack ?? [])]));

    return (
        <header className={cn('mb-10', className)}>
            {/* Breadcrumbs — single line, last item truncates */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <FadeIn direction='up' distance={10} duration={0.45} delay={0.05} trigger='always'>
                    <nav className='flex items-center gap-1 mb-4 text-small text-muted-foreground overflow-hidden' aria-label='Breadcrumb' itemScope itemType='https://schema.org/BreadcrumbList'>
                        {breadcrumbs.map((crumb, index) => (
                            <span key={crumb.href} className='flex items-center gap-1 min-w-0' itemProp='itemListElement' itemScope itemType='https://schema.org/ListItem'>
                                {index > 0 && <ChevronRight className='size-3 shrink-0 text-muted-foreground/40' aria-hidden='true' />}
                                <Link
                                    href={crumb.href}
                                    itemProp='item'
                                    className={cn(
                                        'whitespace-nowrap transition-base',
                                        index === breadcrumbs.length - 1
                                            ? 'truncate font-medium text-foreground pointer-events-none min-w-0'
                                            : 'shrink-0 hover:text-primary hover:underline underline-offset-2',
                                    )}
                                >
                                    <span itemProp='name'>{crumb.label}</span>
                                </Link>
                                <meta itemProp='position' content={(index + 1).toString()} />
                            </span>
                        ))}
                    </nav>
                </FadeIn>
            )}

            {/* Tags & Tech Stack — above cover to avoid orphaned gap */}
            {allTags.length > 0 && (
                <FadeIn direction='up' distance={10} duration={0.45} delay={0.13} trigger='always'>
                    <div className='flex flex-wrap gap-2 mb-4'>
                        {allTags.slice(0, 8).map((tag) => (
                            <Pill key={tag} size='chip' variant='neutral'>
                                {tag}
                            </Pill>
                        ))}
                    </div>
                </FadeIn>
            )}

            {/* Cover Image */}
            {project.coverImage && (
                <FadeIn direction='up' distance={14} duration={0.45} delay={0.21} trigger='always'>
                    <div className='relative overflow-hidden mb-6 rounded-2xl border border-border'>
                        <div className='relative h-52 w-full md:h-72'>
                            <Image src={project.coverImage} alt={project.title} fill className='object-cover' sizes='(max-width: 768px) 100vw, 1024px' priority />
                        </div>
                    </div>
                </FadeIn>
            )}

            {/* Title */}
            <FadeIn direction='up' distance={16} duration={0.45} delay={0.29} trigger='always'>
                <h1 className='text-h1 font-semibold leading-tight tracking-tight text-foreground'>{project.title}</h1>
            </FadeIn>

            {/* Description */}
            <FadeIn direction='up' distance={12} duration={0.45} delay={0.37} trigger='always'>
                <p className='mt-3 text-body leading-relaxed text-muted-foreground'>{project.description}</p>
            </FadeIn>

            {/* Meta row */}
            <FadeIn direction='up' distance={10} duration={0.45} delay={0.45} trigger='always'>
                <div className='flex flex-wrap items-center gap-3 mt-5 text-small text-muted-foreground'>
                    {project.status && (
                        <span className='inline-flex items-center gap-1.5 px-3 py-1 text-label font-medium bg-card border border-border rounded-full'>
                            <Wrench className='size-3.5' aria-hidden='true' />
                            {project.status}
                        </span>
                    )}
                    {project.publishedAt && (
                        <span className='flex items-center gap-1.5'>
                            <Calendar className='size-3.5' aria-hidden='true' />
                            <time dateTime={new Date(project.publishedAt).toISOString()}>{formatDate(project.publishedAt)}</time>
                        </span>
                    )}
                    {typeof project.readingTime === 'number' && project.readingTime > 0 && (
                        <span className='flex items-center gap-1.5'>
                            <Clock className='size-3.5' aria-hidden='true' />
                            {project.readingTime} min read
                        </span>
                    )}
                    {showUpdated && <span className='text-label text-muted-foreground/70'>(Updated {formatDate(project.updatedAt)})</span>}
                </div>
            </FadeIn>

            {/* Action links */}
            {(project.githubUrl || project.liveUrl) && (
                <FadeIn direction='up' distance={10} duration={0.45} delay={0.53} trigger='always'>
                    <div className='flex flex-wrap items-center gap-3 mt-5'>
                        {project.githubUrl && (
                            <Link
                                href={project.githubUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-2 px-4 py-2 text-label font-medium text-foreground bg-card border border-border rounded-lg transition-base hover:text-primary hover:border-primary/40'
                            >
                                <FaGithub className='size-4' aria-hidden='true' />
                                Source
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
                                Live Demo
                            </Link>
                        )}
                    </div>
                </FadeIn>
            )}

            {/* Decorative beam separator */}
            <BeamLine className='mt-8' />
        </header>
    );
};

export type { IProjectHeaderProps, IProjectBreadcrumb };
