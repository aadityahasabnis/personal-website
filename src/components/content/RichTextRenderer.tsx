'use client';

import { useEffect, useRef } from 'react';

export interface RichTextRendererProps {
    html: string;
    className?: string;
}

const CLASS_PREFIX = 'cbr-content';

export const RichTextRenderer = ({ html, className }: RichTextRendererProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.querySelectorAll<HTMLPreElement>('pre').forEach((pre) => {
            if (pre.querySelector('.cbr-copy-btn')) return;
            const code = pre.querySelector('code');
            if (!code) return;
            const btn = document.createElement('button');
            btn.className = 'cbr-copy-btn';
            btn.textContent = 'Copy';
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(code.innerText).then(() => {
                    btn.textContent = 'Copied!';
                    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
                }).catch(() => {
                    btn.textContent = 'Failed';
                    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
                });
            });
            pre.appendChild(btn);
        });
    }, [html]);

    const outerClass = [CLASS_PREFIX, className].filter(Boolean).join(' ');

    return (
        <div
            ref={ref}
            className={outerClass}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};
