'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface ITocItem {
    id: string;
    text: string;
    level: number;
}

export interface ITableOfContentsProps {
    headings: ITocItem[];
    className?: string;
    /**
     * Distance (px) from the top of the viewport that counts as the "reading
     * line". Should equal the navbar height so a heading is considered active
     * once it scrolls just below the nav bar.
     * Default: 80  (matches `h-20` navbar)
     */
    topOffset?: number;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Indent per heading level: h2 = 0, h3 = 0.75rem, h4 = 1.5rem */
const indent = (level: number) => `${(level - 2) * 0.75}rem`;

// ─── component ────────────────────────────────────────────────────────────────

export const TableOfContents = ({
    headings,
    className,
    topOffset = 80,
}: ITableOfContentsProps) => {
    const [activeId, setActiveId] = useState<string>('');
    const [indicatorY, setIndicatorY] = useState(0);
    const [indicatorH, setIndicatorH] = useState(0);

    // rAF handle — coalesces scroll events into one paint
    const rafRef = useRef<number | null>(null);
    // When true, scroll-driven active detection is paused (click in progress)
    const isClickingRef = useRef(false);
    // The target heading id that a programmatic scroll is heading toward
    const clickTargetRef = useRef<string>('');
    // Idle timer used as `scrollend` fallback for browsers that don't support it
    const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const listRef = useRef<HTMLUListElement>(null);
    const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

    // ── indicator position ────────────────────────────────────────────────────
    const moveIndicator = useCallback((id: string) => {
        const li = itemRefs.current.get(id);
        if (!li) return;
        setIndicatorY(li.offsetTop);
        setIndicatorH(li.offsetHeight);
    }, []);

    // ── active heading (reading-line algorithm) ───────────────────────────────
    //
    // The active heading is the LAST one whose top edge has scrolled at or
    // above the reading line (topOffset + a small 8 px buffer).
    // This is the same algorithm GitHub, MDN, and Stripe use — there is no
    // ambiguous window; the transition is a single pixel.
    const computeActive = useCallback((): string => {
        const line = topOffset + 100;
        let active = headings[0]?.id ?? '';
        for (const { id } of headings) {
            const el = document.getElementById(id);
            if (!el) continue;
            if (el.getBoundingClientRect().top <= line) {
                active = id;
            } else {
                break; // DOM order — everything below is also below the line
            }
        }
        return active;
    }, [headings, topOffset]);

    // ── unlock: called when scrolling is truly finished ───────────────────────
    //
    // We use `scrollend` (Chrome 109+, Firefox 109+) when available, and fall
    // back to a 150 ms idle timer on older browsers.  Either way the lock
    // releases exactly when the scroll animation is over — not after a fixed
    // guess — so there is no race condition.
    const unlock = useCallback(() => {
        if (!isClickingRef.current) return;
        isClickingRef.current = false;
        clickTargetRef.current = '';
        // Re-sync to real scroll position now that we've landed
        const id = computeActive();
        setActiveId(id);
        moveIndicator(id);
    }, [computeActive, moveIndicator]);

    // ── scroll listener ───────────────────────────────────────────────────────
    useEffect(() => {
        if (headings.length === 0) return;

        const tick = () => {
            rafRef.current = null;

            if (isClickingRef.current) {
                // Scroll is in flight from a click.
                // Only update the indicator if the real scroll position has
                // already crossed the target heading — this gives a natural
                // "pill follows the page" feel without any jumping.
                const realActive = computeActive();
                if (realActive === clickTargetRef.current) {
                    // We've arrived — unlock immediately instead of waiting
                    isClickingRef.current = false;
                    clickTargetRef.current = '';
                    setActiveId(realActive);
                    moveIndicator(realActive);
                }
                // Otherwise stay silent — don't touch activeId
                return;
            }

            const id = computeActive();
            setActiveId(id);
            moveIndicator(id);
        };

        // Initial highlight on mount
        const id = computeActive();
        setActiveId(id);
        moveIndicator(id);

        const onScroll = () => {
            if (rafRef.current !== null) return;
            rafRef.current = requestAnimationFrame(tick);

            // ── scrollend fallback (fires ~150 ms after last scroll event) ──
            if (idleRef.current !== null) clearTimeout(idleRef.current);
            idleRef.current = setTimeout(unlock, 150);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        // `scrollend` is the authoritative signal on modern browsers
        window.addEventListener('scrollend', unlock);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('scrollend', unlock);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            if (idleRef.current !== null) clearTimeout(idleRef.current);
        };
    }, [headings, computeActive, moveIndicator, unlock]);

    // ── click handler ─────────────────────────────────────────────────────────
    const scrollTo = useCallback((id: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (!el) return;

        // Target scroll position: heading top minus navbar height minus a small gap
        const y = el.getBoundingClientRect().top + window.scrollY - topOffset - 8;

        // Mark that a programmatic scroll is in flight and remember the target.
        // The scroll listener will silently wait until we've arrived there.
        isClickingRef.current = true;
        clickTargetRef.current = id;
        // Clear any previous idle timer so it doesn't fire early
        if (idleRef.current !== null) { clearTimeout(idleRef.current); idleRef.current = null; }

        window.scrollTo({ top: y, behavior: 'smooth' });

        // Move the pill immediately — no waiting, instant visual feedback
        setActiveId(id);
        moveIndicator(id);
    }, [topOffset, moveIndicator]);

    if (headings.length === 0) return null;

    return (
        <nav className={cn('select-none', className)} aria-label="On this page">

            {/* ── title ─────────────────────────────────────────────────────── */}
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-subtle)]">
                On this page
            </p>

            {/* ── list + track ─────────────────────────────────────────────── */}
            <div className="relative flex gap-3">

                {/* ── left spine track ─────────────────────────────────────── */}
                <div className="relative flex-none w-px self-stretch">
                    {/* gradient base track */}
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background:
                                'linear-gradient(to bottom, var(--border-color) 0%, transparent 100%)',
                        }}
                    />
                    {/* glowing active pill */}
                    <div
                        aria-hidden
                        className="absolute left-1/2 -translate-x-1/2 w-[3px] rounded-full transition-[top,height] duration-300 ease-out"
                        style={{
                            top: indicatorY,
                            height: indicatorH || 24,
                            background:
                                'linear-gradient(to bottom, var(--accent), oklch(from var(--accent) l c h / 0.4))',
                            boxShadow: '0 0 6px 1px oklch(from var(--accent) l c h / 0.35)',
                        }}
                    />
                </div>

                {/* ── heading list ─────────────────────────────────────────── */}
                <ul ref={listRef} className="flex-1 flex flex-col gap-0.5 min-w-0">
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
                                        'block py-[3px] text-[11.5px] leading-snug truncate',
                                        'transition-colors duration-200',
                                        !isActive && 'text-[var(--fg-subtle)] hover:text-[var(--fg-muted)]',
                                        isActive && 'text-[var(--accent)] font-medium',
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
