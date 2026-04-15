import Image from 'next/image';
import Link from 'next/link';

import { BeamLine } from '@/components/common/BeamLine';
import { FadeIn } from '@/components/motion/FadeIn';
import { Pill } from '@/components/ui/pill';
import { cn, formatDate } from '@/lib/utils';
import { Calendar, ChevronRight, Clock } from 'lucide-react';

interface IBlogBreadcrumb {
    label: string;
    href: string;
}

interface IBlogHeaderProps {
    title: string;
    description: string;
    tags: string[];
    breadcrumbs?: IBlogBreadcrumb[];
    coverImage?: string | null;
    publishedAt?: string | null;
    readingTime?: number;
    updatedAt?: string | null;
    className?: string;
}

// =============================================================
// BlogHeader — header for individual blog post pages
// =============================================================
export const BlogHeader = ({ title, description, tags, breadcrumbs, coverImage, publishedAt, readingTime, updatedAt, className }: IBlogHeaderProps) => {
    const showUpdated = Boolean(updatedAt && publishedAt && new Date(updatedAt) > new Date(publishedAt));

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

            {/* Tags — above cover to avoid orphaned gap */}
            {tags.length > 0 && (
                <FadeIn direction='up' distance={10} duration={0.45} delay={0.13} trigger='always'>
                    <div className='flex flex-wrap gap-2 mb-4'>
                        {tags.slice(0, 6).map((tag) => (
                            <Pill key={tag} size='chip' variant='neutral'>
                                {tag}
                            </Pill>
                        ))}
                    </div>
                </FadeIn>
            )}

            {/* Cover Image */}
            {coverImage && (
                <FadeIn direction='up' distance={14} duration={0.45} delay={0.21} trigger='always'>
                    <div className='relative overflow-hidden mb-6 rounded-2xl border border-border'>
                        <div className='relative h-52 w-full md:h-72'>
                            <Image src={coverImage} alt={title} fill className='object-cover' sizes='(max-width: 768px) 100vw, 1024px' priority />
                        </div>
                    </div>
                </FadeIn>
            )}

            {/* Title */}
            <FadeIn direction='up' distance={16} duration={0.45} delay={0.29} trigger='always'>
                <h1 className='text-h1 font-semibold leading-tight tracking-tight text-foreground'>{title}</h1>
            </FadeIn>

            {/* Description */}
            <FadeIn direction='up' distance={12} duration={0.45} delay={0.37} trigger='always'>
                <p className='mt-3 text-body leading-relaxed text-muted-foreground'>{description}</p>
            </FadeIn>

            {/* Meta row */}
            <FadeIn direction='up' distance={10} duration={0.45} delay={0.45} trigger='always'>
                <div className='flex flex-wrap items-center gap-3 mt-5 text-small text-muted-foreground'>
                    {publishedAt && (
                        <span className='flex items-center gap-1.5'>
                            <Calendar className='size-3.5' aria-hidden='true' />
                            <time dateTime={new Date(publishedAt).toISOString()}>{formatDate(publishedAt)}</time>
                        </span>
                    )}
                    {typeof readingTime === 'number' && readingTime > 0 && (
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

export type { IBlogHeaderProps, IBlogBreadcrumb };
