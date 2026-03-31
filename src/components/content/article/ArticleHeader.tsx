import Image from 'next/image';

import { BeamLine } from '@/components/common/BeamLine';
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
}

/**
 * ArticleHeader - Shared header for topic and article pages
 *
 * Keeps topic and article center-content visual language aligned.
 */
const ArticleHeader = ({ breadcrumbs, title, description, coverImage, contentCount, subtopicCount, readingTime, publishedAt, updatedAt, tags, className }: IArticleHeaderProps) => {
    return (
        <header className={cn('mb-12 pt-2', className)}>
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

            {/* Cover Image */}
            {coverImage && (
                <div className='relative overflow-hidden mb-8 rounded-2xl border border-border bg-card'>
                    <div className='relative h-48 w-full md:h-64'>
                        <Image src={coverImage} alt={title} fill className='object-cover' sizes='(max-width: 768px) 100vw, 1024px' priority />
                    </div>
                </div>
            )}

            {/* Tags Pills - Above Title */}
            {tags && tags.length > 0 && (
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
            )}

            {/* Title */}
            <h1 className='text-h1 font-semibold leading-tight text-foreground'>{title}</h1>

            {/* Description */}
            {description && <p className='mt-4 max-w-3xl text-h4 leading-relaxed text-muted-foreground'>{description}</p>}

            {/* Meta */}
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

            {/* Decorative Animated Beam Line */}
            <BeamLine className='mt-8' />
        </header>
    );
};

export { ArticleHeader };
export type { IArticleHeaderProps, IBreadcrumb };
