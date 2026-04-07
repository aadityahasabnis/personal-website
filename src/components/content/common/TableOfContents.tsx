'use client';

import type { ITocItem } from '@/lib/markdown';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

export type { ITocItem } from '@/lib/markdown';

export interface ITableOfContentsProps {
    headings: ITocItem[];
    className?: string;
    topOffset?: number;
}

const indent = (level: number) => `${(level - 2) * 0.75}rem`;

export const TableOfContents = ({ headings, className, topOffset = 80 }: ITableOfContentsProps) => {
    const [activeId, setActiveId] = useState<string>('');
    const [indicatorY, setIndicatorY] = useState(0);
    const [indicatorH, setIndicatorH] = useState(0);

    const rafRef = useRef<number | null>(null);
    const isClickingRef = useRef(false);
    const clickTargetRef = useRef<string>('');
    const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const listRef = useRef<HTMLUListElement>(null);
    const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

    const moveIndicator = useCallback((id: string) => {
        const li = itemRefs.current.get(id);
        if (!li) return;
        setIndicatorY(li.offsetTop);
        setIndicatorH(li.offsetHeight);
    }, []);

    const computeActive = useCallback((): string => {
        const line = topOffset + 100;
        let active = headings[0]?.id ?? '';
        for (const { id } of headings) {
            const el = document.getElementById(id);
            if (!el) continue;
            if (el.getBoundingClientRect().top <= line) {
                active = id;
            } else {
                break;
            }
        }
        return active;
    }, [headings, topOffset]);

    const unlock = useCallback(() => {
        if (!isClickingRef.current) return;
        isClickingRef.current = false;
        clickTargetRef.current = '';
        const id = computeActive();
        setActiveId(id);
        moveIndicator(id);
    }, [computeActive, moveIndicator]);

    useEffect(() => {
        if (headings.length === 0) return;

        const tick = () => {
            rafRef.current = null;

            if (isClickingRef.current) {
                const realActive = computeActive();
                if (realActive === clickTargetRef.current) {
                    isClickingRef.current = false;
                    clickTargetRef.current = '';
                    setActiveId(realActive);
                    moveIndicator(realActive);
                }
                return;
            }

            const id = computeActive();
            setActiveId(id);
            moveIndicator(id);
        };

        const id = computeActive();
        setActiveId(id);
        moveIndicator(id);

        const onScroll = () => {
            if (rafRef.current !== null) return;
            rafRef.current = requestAnimationFrame(tick);

            if (idleRef.current !== null) clearTimeout(idleRef.current);
            idleRef.current = setTimeout(unlock, 150);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('scrollend', unlock);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('scrollend', unlock);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            if (idleRef.current !== null) clearTimeout(idleRef.current);
        };
    }, [headings, computeActive, moveIndicator, unlock]);

    const scrollTo = useCallback(
        (id: string) => (e: React.MouseEvent) => {
            e.preventDefault();
            const el = document.getElementById(id);
            if (!el) return;

            const y = el.getBoundingClientRect().top + window.scrollY - topOffset - 8;

            isClickingRef.current = true;
            clickTargetRef.current = id;
            if (idleRef.current !== null) {
                clearTimeout(idleRef.current);
                idleRef.current = null;
            }

            window.scrollTo({ top: y, behavior: 'smooth' });

            setActiveId(id);
            moveIndicator(id);
        },
        [topOffset, moveIndicator],
    );

    if (headings.length === 0) return null;

    return (
        <nav className={cn('select-none', className)} aria-label='On this page'>
            <p className='mb-3 text-label font-semibold tracking-wide uppercase text-muted-foreground'>On this page</p>

            <div className='relative flex gap-3'>
                <div className='relative flex-none self-stretch w-px'>
                    <div
                        className='absolute inset-0 rounded-full'
                        style={{
                            background: 'linear-gradient(to bottom, var(--border-color) 0%, transparent 100%)',
                        }}
                    />
                    <div
                        aria-hidden
                        className='absolute left-1/2 w-0.75 rounded-full transition-[top,height] duration-300 ease-out -translate-x-1/2'
                        style={{
                            top: indicatorY,
                            height: indicatorH || 24,
                            background: 'linear-gradient(to bottom, var(--accent), oklch(from var(--accent) l c h / 0.4))',
                            boxShadow: '0 0 6px 1px oklch(from var(--accent) l c h / 0.35)',
                        }}
                    />
                </div>

                <ul ref={listRef} className='flex flex-col flex-1 gap-0.5 min-w-0'>
                    {headings.map(({ id, text, level }) => {
                        const isActive = activeId === id;
                        return (
                            <li
                                key={id}
                                ref={(el) => {
                                    if (el) itemRefs.current.set(id, el);
                                    else itemRefs.current.delete(id);
                                }}
                                style={{ paddingLeft: indent(level) }}
                            >
                                <a
                                    href={`#${id}`}
                                    onClick={scrollTo(id)}
                                    title={text}
                                    className={cn(
                                        'block py-1 text-label leading-snug truncate',
                                        'transition-colors duration-200',
                                        !isActive && 'text-muted-foreground hover:text-foreground',
                                        isActive && 'font-medium text-primary',
                                        level === 2 && 'font-[450]',
                                        level >= 3 && 'font-normal',
                                    )}
                                >
                                    {text}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
};

export default TableOfContents;
