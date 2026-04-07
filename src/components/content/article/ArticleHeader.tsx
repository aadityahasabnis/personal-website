import Image from 'next/image';

import { BeamLine } from '@/components/common/BeamLine';
import { FadeIn } from '@/components/motion/FadeIn';
import { cn, formatDate } from '@/lib/utils';
import { BookOpen, Calendar, ChevronRight, Clock, FileText } from 'lucide-react';
import Link from 'next/link';

interface IBreadcrumb {
    label: string;
    href: string;
}

interface IArticleHeaderProps {
    /** Breadcrumb trail */
    breadcrumbs: IBreadcrumb[];
    /** Article title */
    title: string;
    /** Article description */
    description?: string;
    /** Optional hero image */
    coverImage?: string | null;
    /** Optional content count for topic headers */
    contentCount?: number;
    /** Optional subtopic count for topic headers */
    subtopicCount?: number;
    /** Reading time in minutes */
    readingTime?: number;
    /** Published date */
    publishedAt?: Date | string;
    /** Updated date */
    updatedAt?: Date | string;
    /** Tags */
    tags?: string[];
    /** Additional className */
    className?: string;
    /** Base delay for staggered header animation */
    animationDelay?: number;
    /** Per-block stagger delay */
    animationStagger?: number;
    /** Duration of each fade-in block */
    animationDuration?: number;
}

/**
 * ArticleHeader - Shared header for topic and article pages
 *
 * Keeps topic and article center-content visual language aligned.
 */
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
    animationStagger = 0.1,
    animationDuration = 0.5,
}: IArticleHeaderProps) => {
    const breadcrumbsDelay = animationDelay;
    const coverDelay = breadcrumbsDelay + animationStagger;
    const tagsDelay = coverDelay + animationStagger;
    const titleDelay = tagsDelay + animationStagger;
    const descriptionDelay = titleDelay + animationStagger;
    const metaDelay = descriptionDelay + animationStagger;

    return (
        <header className={cn('mb-12', className)}>
            <FadeIn direction='up' distance={12} duration={animationDuration} delay={breadcrumbsDelay} trigger='always'>
                {/* Breadcrumbs */}
                <nav className='flex flex-wrap items-center gap-1.5 mb-6 text-small text-muted-foreground' aria-label='Breadcrumb' itemScope itemType='https://schema.org/BreadcrumbList'>
                    {breadcrumbs.map((crumb, index) => (
                        <span key={crumb.href} className='flex items-center gap-1.5' itemProp='itemListElement' itemScope itemType='https://schema.org/ListItem'>
                            {index > 0 && <ChevronRight className='size-3.5 shrink-0 text-muted-foreground/70' />}
                            <Link
                                href={crumb.href}
                                itemProp='item'
                                className={cn(
                                    'transition-base hover:text-primary',
                                    index === breadcrumbs.length - 1 ? 'max-w-85 truncate font-medium text-foreground' : 'hover:underline underline-offset-2',
                                )}
                            >
                                <span itemProp='name'>{crumb.label}</span>
                            </Link>
                            <meta itemProp='position' content={(index + 1).toString()} />
                        </span>
                    ))}
                </nav>
            </FadeIn>

            {/* Cover Image */}
            {coverImage && (
                <FadeIn direction='up' distance={16} duration={animationDuration} delay={coverDelay} trigger='always'>
                    <div className='relative overflow-hidden mb-8 rounded-2xl border border-border bg-card'>
                        <div className='relative h-48 w-full md:h-64'>
                            <Image src={coverImage} alt={title} fill className='object-cover' sizes='(max-width: 768px) 100vw, 1024px' priority />
                        </div>
                    </div>
                </FadeIn>
            )}

            {/* Tags Pills - Above Title */}
            {tags && tags.length > 0 && (
                <FadeIn direction='up' distance={14} duration={animationDuration} delay={tagsDelay} trigger='always'>
                    <div className='flex flex-wrap gap-2 mb-6'>
                        {tags.slice(0, 5).map((tag) => (
                            <span
                                key={tag}
                                className='inline-flex items-center px-3 py-1.5 rounded-full border border-primary/20 bg-primary/8 text-label font-medium uppercase tracking-wider text-primary'
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </FadeIn>
            )}

            {/* Title */}
            <FadeIn direction='up' distance={20} duration={animationDuration} delay={titleDelay} trigger='always'>
                <h1 className='text-h1 font-semibold leading-tight text-foreground'>{title}</h1>
            </FadeIn>

            {/* Description */}
            {description && (
                <FadeIn direction='up' distance={18} duration={animationDuration} delay={descriptionDelay} trigger='always'>
                    <p className='mt-4 text-h4 leading-relaxed text-muted-foreground'>{description}</p>
                </FadeIn>
            )}

            {/* Meta */}
            <FadeIn direction='up' distance={16} duration={animationDuration} delay={metaDelay} trigger='always'>
                <div className='flex flex-wrap items-center gap-4 mt-6 text-small text-muted-foreground'>
                    {typeof contentCount === 'number' && (
                        <span className='inline-flex items-center gap-1.5 px-3 py-1.5 text-label font-medium text-muted-foreground bg-card border border-border rounded-full'>
                            <FileText className='size-4' />
                            {contentCount} article{contentCount !== 1 ? 's' : ''}
                        </span>
                    )}
                    {typeof subtopicCount === 'number' && (
                        <span className='inline-flex items-center gap-1.5 px-3 py-1.5 text-label font-medium text-muted-foreground bg-card border border-border rounded-full'>
                            <BookOpen className='size-4' />
                            {subtopicCount} subtopic{subtopicCount !== 1 ? 's' : ''}
                        </span>
                    )}
                    {publishedAt && (
                        <span className='flex items-center gap-1.5'>
                            <Calendar className='size-4' />
                            <time dateTime={new Date(publishedAt).toISOString()}>{formatDate(publishedAt)}</time>
                        </span>
                    )}
                    {readingTime && (
                        <span className='flex items-center gap-1.5'>
                            <Clock className='size-4' />
                            {readingTime} min read
                        </span>
                    )}
                    {updatedAt && publishedAt && new Date(updatedAt) > new Date(publishedAt) && <span className='text-muted-foreground'>(Updated {formatDate(updatedAt)})</span>}
                </div>
            </FadeIn>

            {/* Decorative Animated Beam Line */}
            <BeamLine className='mt-8' />
        </header>
    );
};

export { ArticleHeader };
export type { IArticleHeaderProps, IBreadcrumb };
