/**
 * Yoopta Content Renderer
 * 
 * Server-side renderer that converts Yoopta JSON content to SEO-friendly HTML.
 * This component can be used for:
 * - SSR rendering of blog posts
 * - Generating cached HTML for fast delivery
 * - Email content generation
 */

import React from 'react';
import type { YooptaContentValue } from '@yoopta/editor';
import { cn } from '@/lib/utils';

// ===== TYPES =====

interface RendererProps {
    content: YooptaContentValue;
    className?: string;
}

interface BlockProps {
    block: {
        id: string;
        type: string;
        value: unknown[];
        meta: {
            order: number;
            depth: number;
            align?: 'left' | 'center' | 'right';
        };
    };
}

interface ElementProps {
    element: {
        id: string;
        type: string;
        children: unknown[];
        props?: Record<string, unknown>;
    };
}

interface TextNode {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
    highlight?: {
        color?: string;
        backgroundColor?: string;
    };
}

// ===== TEXT RENDERER =====

function renderText(node: unknown): React.ReactNode {
    if (typeof node === 'string') {
        return node;
    }

    const textNode = node as TextNode;
    
    if ('text' in textNode) {
        let content: React.ReactNode = textNode.text;

        // Apply marks in order
        if (textNode.code) {
            content = (
                <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono">
                    {content}
                </code>
            );
        }
        if (textNode.bold) {
            content = <strong className="font-semibold">{content}</strong>;
        }
        if (textNode.italic) {
            content = <em>{content}</em>;
        }
        if (textNode.underline) {
            content = <u>{content}</u>;
        }
        if (textNode.strike) {
            content = <s>{content}</s>;
        }
        if (textNode.highlight) {
            content = (
                <mark
                    style={{
                        color: textNode.highlight.color,
                        backgroundColor: textNode.highlight.backgroundColor || 'yellow',
                    }}
                >
                    {content}
                </mark>
            );
        }

        return content;
    }

    return null;
}

function renderChildren(children: unknown[]): React.ReactNode {
    return children.map((child, index) => {
        if ('text' in (child as TextNode)) {
            return <React.Fragment key={index}>{renderText(child)}</React.Fragment>;
        }
        // Nested element
        return <ElementRenderer key={index} element={child as ElementProps['element']} />;
    });
}

// ===== ELEMENT RENDERER =====

function ElementRenderer({ element }: ElementProps): React.ReactNode {
    const { type, children, props = {} } = element;

    switch (type) {
        // Paragraphs
        case 'paragraph':
            return <p className="mb-4 leading-relaxed">{renderChildren(children)}</p>;

        // Headings
        case 'heading-one':
            return (
                <h1 
                    id={generateSlug(getTextContent(children))} 
                    className="text-3xl font-bold mt-8 mb-4 scroll-mt-20"
                >
                    {renderChildren(children)}
                </h1>
            );
        case 'heading-two':
            return (
                <h2 
                    id={generateSlug(getTextContent(children))} 
                    className="text-2xl font-bold mt-6 mb-3 scroll-mt-20"
                >
                    {renderChildren(children)}
                </h2>
            );
        case 'heading-three':
            return (
                <h3 
                    id={generateSlug(getTextContent(children))} 
                    className="text-xl font-semibold mt-5 mb-2 scroll-mt-20"
                >
                    {renderChildren(children)}
                </h3>
            );

        // Blockquote
        case 'blockquote':
            return (
                <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground">
                    {renderChildren(children)}
                </blockquote>
            );

        // Lists
        case 'bulleted-list':
            return (
                <ul className="list-disc list-inside mb-4 space-y-1">
                    {renderChildren(children)}
                </ul>
            );
        case 'numbered-list':
            return (
                <ol className="list-decimal list-inside mb-4 space-y-1">
                    {renderChildren(children)}
                </ol>
            );
        case 'todo-list':
            return (
                <ul className="mb-4 space-y-2">
                    {renderChildren(children)}
                </ul>
            );
        case 'list-item':
            return <li className="ml-4">{renderChildren(children)}</li>;
        case 'todo-list-item': {
            const checked = (props as { checked?: boolean }).checked;
            return (
                <li className="flex items-start gap-2">
                    <input
                        type="checkbox"
                        checked={checked}
                        readOnly
                        className="mt-1"
                        aria-label={checked ? 'Completed' : 'Not completed'}
                    />
                    <span className={cn(checked && 'line-through text-muted-foreground')}>
                        {renderChildren(children)}
                    </span>
                </li>
            );
        }

        // Image
        case 'image': {
            const imageProps = props as {
                src?: string;
                alt?: string;
                sizes?: { width: number; height: number };
            };
            if (!imageProps.src) return null;
            return (
                <figure className="my-6">
                    <img
                        src={imageProps.src}
                        alt={imageProps.alt || ''}
                        width={imageProps.sizes?.width}
                        height={imageProps.sizes?.height}
                        loading="lazy"
                        className="rounded-lg max-w-full h-auto mx-auto"
                    />
                    {imageProps.alt && (
                        <figcaption className="text-center text-sm text-muted-foreground mt-2">
                            {imageProps.alt}
                        </figcaption>
                    )}
                </figure>
            );
        }

        // Video
        case 'video': {
            const videoProps = props as {
                src?: string;
                provider?: string;
            };
            if (!videoProps.src) return null;
            
            // Handle YouTube embeds
            if (videoProps.provider === 'youtube' || videoProps.src.includes('youtube.com') || videoProps.src.includes('youtu.be')) {
                const videoId = extractYouTubeId(videoProps.src);
                if (videoId) {
                    return (
                        <div className="my-6 aspect-video">
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                className="w-full h-full rounded-lg"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Video"
                            />
                        </div>
                    );
                }
            }
            
            return (
                <div className="my-6">
                    <video
                        src={videoProps.src}
                        controls
                        className="w-full rounded-lg"
                    />
                </div>
            );
        }

        // Embed
        case 'embed': {
            const embedProps = props as { src?: string };
            if (!embedProps.src) return null;
            return (
                <div className="my-6 aspect-video">
                    <iframe
                        src={embedProps.src}
                        className="w-full h-full rounded-lg border"
                        allowFullScreen
                        title="Embedded content"
                    />
                </div>
            );
        }

        // Code
        case 'code': {
            const codeProps = props as { language?: string };
            const codeText = getTextContent(children);
            return (
                <pre className="my-4 p-4 bg-[#1e1e1e] text-gray-100 rounded-lg overflow-x-auto">
                    <code data-language={codeProps.language || 'text'} className="text-sm font-mono">
                        {codeText}
                    </code>
                </pre>
            );
        }

        // Table
        case 'table':
            return (
                <div className="my-6 overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                        <tbody>{renderChildren(children)}</tbody>
                    </table>
                </div>
            );
        case 'table-row':
            return <tr className="border-b border-border">{renderChildren(children)}</tr>;
        case 'table-data-cell': {
            const cellProps = props as {
                asHeader?: boolean;
                align?: 'left' | 'center' | 'right';
            };
            const CellTag = cellProps.asHeader ? 'th' : 'td';
            return (
                <CellTag
                    className={cn(
                        'border border-border px-3 py-2',
                        cellProps.asHeader && 'bg-muted font-semibold',
                        cellProps.align === 'center' && 'text-center',
                        cellProps.align === 'right' && 'text-right'
                    )}
                >
                    {renderChildren(children)}
                </CellTag>
            );
        }

        // Divider
        case 'divider':
            return <hr className="my-8 border-t border-border" />;

        // Callout
        case 'callout': {
            const calloutProps = props as { type?: string };
            const calloutType = calloutProps.type || 'default';
            const styles: Record<string, string> = {
                default: 'bg-muted border-l-4 border-muted-foreground',
                info: 'bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500',
                warning: 'bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-500',
                error: 'bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500',
                success: 'bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500',
            };
            return (
                <div className={cn('my-4 p-4 rounded-r-lg', styles[calloutType])}>
                    {renderChildren(children)}
                </div>
            );
        }

        // Accordion
        case 'accordion-list':
            return <div className="my-4 space-y-2">{renderChildren(children)}</div>;
        case 'accordion-list-item':
            return <details className="border rounded-lg">{renderChildren(children)}</details>;
        case 'accordion-list-item-heading':
            return (
                <summary className="px-4 py-3 cursor-pointer font-medium hover:bg-muted">
                    {renderChildren(children)}
                </summary>
            );
        case 'accordion-list-item-content':
            return <div className="px-4 py-3 border-t">{renderChildren(children)}</div>;

        // File
        case 'file': {
            const fileProps = props as { src?: string; name?: string; size?: number };
            if (!fileProps.src) return null;
            return (
                <a
                    href={fileProps.src}
                    download={fileProps.name}
                    className="my-4 flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                    <span className="text-2xl">📎</span>
                    <span>
                        <span className="font-medium">{fileProps.name || 'Download file'}</span>
                        {fileProps.size && (
                            <span className="text-sm text-muted-foreground ml-2">
                                ({formatFileSize(fileProps.size)})
                            </span>
                        )}
                    </span>
                </a>
            );
        }

        // Link
        case 'link': {
            const linkProps = props as { url?: string; title?: string };
            return (
                <a
                    href={linkProps.url}
                    title={linkProps.title}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {renderChildren(children)}
                </a>
            );
        }

        // Default fallback
        default:
            if (children && children.length > 0) {
                return <div>{renderChildren(children)}</div>;
            }
            return null;
    }
}

// ===== BLOCK RENDERER =====

function BlockRenderer({ block }: BlockProps): React.ReactNode {
    const { value, meta } = block;
    
    if (!value || !Array.isArray(value) || value.length === 0) {
        return null;
    }

    const alignClass = meta.align === 'center' 
        ? 'text-center' 
        : meta.align === 'right' 
            ? 'text-right' 
            : '';
    
    const depthClass = meta.depth > 0 ? `ml-${Math.min(meta.depth * 4, 16)}` : '';

    return (
        <div className={cn(alignClass, depthClass)}>
            {value.map((element, index) => (
                <ElementRenderer 
                    key={`${block.id}-${index}`} 
                    element={element as ElementProps['element']} 
                />
            ))}
        </div>
    );
}

// ===== MAIN RENDERER =====

/**
 * Renders Yoopta content to SEO-friendly HTML
 */
export function YooptaRenderer({ content, className }: RendererProps): React.ReactNode {
    if (!content || typeof content !== 'object') {
        return null;
    }

    // Sort blocks by order
    const sortedBlocks = Object.values(content).sort(
        (a, b) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0)
    );

    return (
        <article className={cn('prose prose-neutral dark:prose-invert max-w-none', className)}>
            {sortedBlocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
            ))}
        </article>
    );
}

// ===== UTILITY FUNCTIONS =====

function getTextContent(children: unknown[]): string {
    return children
        .map((child) => {
            if (typeof child === 'string') return child;
            if ('text' in (child as TextNode)) return (child as TextNode).text;
            if ('children' in (child as { children: unknown[] })) {
                return getTextContent((child as { children: unknown[] }).children);
            }
            return '';
        })
        .join('');
}

function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
    }
    
    return null;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ===== EXPORT HTML STRING =====

/**
 * Convert Yoopta content to HTML string for SSR/caching
 * This is useful for pre-rendering and storing in database
 */
export async function renderToHtmlString(content: YooptaContentValue): Promise<string> {
    // Use React's renderToStaticMarkup for server-side rendering
    const ReactDOMServer = await import('react-dom/server');
    const element = <YooptaRenderer content={content} />;
    return ReactDOMServer.renderToStaticMarkup(element);
}

export default YooptaRenderer;
