'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ITocItem {
    id: string;
    text: string;
    level: number;
}

interface ITableOfContentsProps {
    className?: string;
}

/**
 * TableOfContents - Client Component that generates TOC from page headings
 * 
 * Scans the DOM for h2, h3, h4 elements and creates a navigation sidebar.
 * Highlights the current section based on scroll position.
 */
const TableOfContents = ({ className }: ITableOfContentsProps) => {
    const [headings, setHeadings] = useState<ITocItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        // Get all headings from the article
        const article = document.querySelector('article');
        if (!article) return;

        const elements = article.querySelectorAll('h2, h3, h4');
        const items: ITocItem[] = [];

        elements.forEach((element) => {
            const id = element.id;
            if (!id) return;

            items.push({
                id,
                text: element.textContent ?? '',
                level: parseInt(element.tagName[1], 10),
            });
        });

        setHeadings(items);
    }, []);

    useEffect(() => {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-20% 0% -35% 0%',
                threshold: 0,
            }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav
            className={cn('sticky top-24', className)}
            aria-label="Table of contents"
        >
            <h4 className="mb-4 text-sm font-semibold text-foreground">
                On this page
            </h4>
            <ul className="space-y-2">
                {headings.map(({ id, text, level }) => (
                    <li
                        key={id}
                        style={{ paddingLeft: `${(level - 2) * 0.75}rem` }}
                    >
                        <a
                            href={`#${id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(id)?.scrollIntoView({
                                    behavior: 'smooth',
                                });
                                setActiveId(id);
                            }}
                            className={cn(
                                'block text-sm transition-colors',
                                'hover:text-foreground',
                                activeId === id
                                    ? 'font-medium text-primary'
                                    : 'text-muted-foreground'
                            )}
                        >
                            {text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export { TableOfContents };
export type { ITableOfContentsProps, ITocItem };
