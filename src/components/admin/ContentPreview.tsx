'use client';

import { useEffect, useState } from 'react';
import { parseMarkdown } from '@/lib/markdown/parse';
import { extractHeadings, type ITocItem } from '@/lib/markdown/toc';
import { cn } from '@/lib/utils';
import { Eye, List } from 'lucide-react';

interface ContentPreviewProps {
    markdown: string;
    className?: string;
}

export const ContentPreview = ({ markdown, className }: ContentPreviewProps) => {
    const [html, setHtml] = useState('');
    const [toc, setToc] = useState<ITocItem[]>([]);
    const [showToc, setShowToc] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const processMarkdown = async () => {
            if (!markdown.trim()) {
                setHtml('');
                setToc([]);
                return;
            }

            setIsLoading(true);
            
            try {
                // Parse markdown to HTML
                const parsedHtml = await parseMarkdown(markdown);
                
                // Extract TOC from markdown
                const headings = extractHeadings(markdown);

                if (isMounted) {
                    setHtml(parsedHtml);
                    setToc(headings);
                }
            } catch (error) {
                console.error('Failed to parse markdown:', error);
                if (isMounted) {
                    setHtml('<p class="text-destructive">Failed to render preview</p>');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        // Debounce the markdown processing
        const timeoutId = setTimeout(processMarkdown, 300);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [markdown]);

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className={cn('flex gap-4 h-full', className)}>
            {/* Table of Contents */}
            {showToc && toc.length > 0 && (
                <div className="w-56 flex-shrink-0 space-y-2">
                    <div className="sticky top-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium mb-3">
                            <List className="h-4 w-4" />
                            <span>Table of Contents</span>
                        </div>
                        <nav className="space-y-1 text-sm">
                            {toc.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToHeading(item.id)}
                                    className={cn(
                                        'block w-full text-left px-2 py-1 rounded hover:bg-muted transition-colors',
                                        'text-muted-foreground hover:text-foreground'
                                    )}
                                    style={{
                                        paddingLeft: `${(item.level - 1) * 12 + 8}px`,
                                    }}
                                >
                                    {item.text}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Preview Content */}
            <div className="flex-1 min-w-0">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b pb-2 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Eye className="h-4 w-4" />
                        <span>Preview</span>
                    </div>
                    {toc.length > 0 && (
                        <button
                            onClick={() => setShowToc(!showToc)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showToc ? 'Hide' : 'Show'} TOC
                        </button>
                    )}
                </div>

                <div className="border rounded-lg p-6 bg-background min-h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-sm text-muted-foreground">
                                Rendering preview...
                            </div>
                        </div>
                    ) : html ? (
                        <article
                            className="prose prose-sm max-w-none dark:prose-invert
                                prose-headings:scroll-mt-20
                                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                                prose-pre:bg-muted prose-pre:border
                                prose-img:rounded-lg prose-img:shadow-md
                                prose-table:border prose-th:border prose-td:border"
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <Eye className="h-12 w-12 mb-3 opacity-20" />
                            <p className="text-sm">Start writing to see preview</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
