import Image from 'next/image';
import Link from 'next/link';

import { BeamLine } from '@/components/common/BeamLine';
import { FadeIn } from '@/components/motion/FadeIn';
import { Pill } from '@/components/ui/pill';
import { cn, formatDate } from '@/lib/utils';
import { BookOpen, Calendar, ChevronRight, Clock, FileText } from 'lucide-react';

interface IBreadcrumb {
    label: string;
    href: string;
}

interface IArticleHeaderProps {
    breadcrumbs: IBreadcrumb[];
    title: string;
    description?: string;
    coverImage?: string | null;
    contentCount?: number;
    subtopicCount?: number;
    readingTime?: number;
    publishedAt?: Date | string;
    updatedAt?: Date | string;
    tags?: string[];
    className?: string;
    animationDelay?: number;
    animationStagger?: number;
    animationDuration?: number;
}

// =============================================================
// ArticleHeader — shared header for topic and article pages
// =============================================================
const ArticleHeader = ({
    breadcrumbs,
    title,
    description,
    coverImage,
    contentCount,
    subtopicCount,
    readingTime,
    publishedAt,
    updatedAt,
    tags,
    className,
    animationDelay = 0.05,
    animationStagger = 0.08,
    animationDuration = 0.45,
}: IArticleHeaderProps) => {
    let step = animationDelay;
    const d = {
        breadcrumbs: step,
        tags: (step += animationStagger),
        cover: (step += animationStagger),
        title: (step += animationStagger),
        description: (step += animationStagger),
        meta: (step += animationStagger),
    };

    const showUpdated = Boolean(updatedAt && publishedAt && new Date(updatedAt) > new Date(publishedAt));

    return (
        <header className={cn('mb-10', className)}>
            {/* Breadcrumbs — single line, last item truncates */}
            <FadeIn direction='up' distance={10} duration={animationDuration} delay={d.breadcrumbs} trigger='always'>
                <nav className='flex flex-wrap items-center gap-x-1 gap-y-1 mb-4 text-small text-muted-foreground' aria-label='Breadcrumb' itemScope itemType='https://schema.org/BreadcrumbList'>
                    {breadcrumbs.map((crumb, index) => (
                        <span key={crumb.href} className='flex items-center gap-1 min-w-0' itemProp='itemListElement' itemScope itemType='https://schema.org/ListItem'>
                            {index > 0 && <ChevronRight className='size-3 shrink-0 text-muted-foreground/40' aria-hidden='true' />}
                            <Link
                                href={crumb.href}
                                itemProp='item'
                                className={cn(
                                    'max-w-full whitespace-normal wrap-break-word transition-base',
                                    index === breadcrumbs.length - 1 ? 'font-medium text-foreground pointer-events-none min-w-0' : 'hover:text-primary hover:underline underline-offset-2',
                                )}
                            >
                                <span itemProp='name'>{crumb.label}</span>
                            </Link>
                            <meta itemProp='position' content={(index + 1).toString()} />
                        </span>
                    ))}
                </nav>
            </FadeIn>

            {/* Tags — above cover, so cover area isn't orphaned */}
            {tags && tags.length > 0 && (
                <FadeIn direction='up' distance={10} duration={animationDuration} delay={d.tags} trigger='always'>
                    <div className='flex flex-wrap gap-2 mb-4'>
                        {tags.slice(0, 5).map((tag) => (
                            <Pill key={tag} size='chip' variant='neutral'>
                                {tag}
                            </Pill>
                        ))}
                    </div>
                </FadeIn>
            )}

            {/* Cover Image */}
            {coverImage && (
                <FadeIn direction='up' distance={14} duration={animationDuration} delay={d.cover} trigger='always'>
                    <div className='relative overflow-hidden mb-6 rounded-2xl border border-border'>
                        <div className='relative h-52 w-full md:h-72'>
                            <Image src={coverImage} alt={title} fill className='object-cover' sizes='(max-width: 768px) 100vw, 1024px' priority />
                        </div>
                    </div>
                </FadeIn>
            )}

            {/* Title */}
            <FadeIn direction='up' distance={16} duration={animationDuration} delay={d.title} trigger='always'>
                <h1 className='text-h1 font-semibold leading-tight tracking-tight text-foreground'>{title}</h1>
            </FadeIn>

            {/* Description */}
            {description && (
                <FadeIn direction='up' distance={12} duration={animationDuration} delay={d.description} trigger='always'>
                    <p className='mt-3 text-body leading-relaxed text-muted-foreground'>{description}</p>
                </FadeIn>
            )}

            {/* Meta row */}
            <FadeIn direction='up' distance={10} duration={animationDuration} delay={d.meta} trigger='always'>
                <div className='flex flex-wrap items-center gap-3 mt-5 text-small text-muted-foreground'>
                    {typeof contentCount === 'number' && (
                        <span className='inline-flex items-center gap-1.5 px-3 py-1 text-label font-medium bg-card border border-border rounded-full'>
                            <FileText className='size-3.5' aria-hidden='true' />
                            {contentCount} article{contentCount !== 1 ? 's' : ''}
                        </span>
                    )}
                    {typeof subtopicCount === 'number' && (
                        <span className='inline-flex items-center gap-1.5 px-3 py-1 text-label font-medium bg-card border border-border rounded-full'>
                            <BookOpen className='size-3.5' aria-hidden='true' />
                            {subtopicCount} subtopic{subtopicCount !== 1 ? 's' : ''}
                        </span>
                    )}
                    {publishedAt && (
                        <span className='flex items-center gap-1.5'>
                            <Calendar className='size-3.5' aria-hidden='true' />
                            <time dateTime={new Date(publishedAt).toISOString()}>{formatDate(publishedAt)}</time>
                        </span>
                    )}
                    {readingTime && readingTime > 0 && (
                        <span className='flex items-center gap-1.5'>
                            <Clock className='size-3.5' aria-hidden='true' />
                            {readingTime} min read
                        </span>
                    )}
                    {showUpdated && updatedAt && <span className='text-label text-muted-foreground/70'>(Updated {formatDate(updatedAt)})</span>}
                </div>
            </FadeIn>

            {/* Decorative beam separator */}
            <BeamLine className='mt-8' />
        </header>
    );
};

export { ArticleHeader };
export type { IArticleHeaderProps, IBreadcrumb };
