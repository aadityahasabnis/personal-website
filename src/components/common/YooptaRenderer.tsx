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

interface ElementRendererProps extends ElementProps {
    getUniqueId?: (baseId: string) => string;
}

function ElementRenderer({ element, getUniqueId }: ElementRendererProps): React.ReactNode {
    const { type, children, props = {} } = element;

    // Helper to generate heading ID with deduplication
    const getHeadingId = (text: string) => {
        const baseId = generateSlug(text);
        return getUniqueId ? getUniqueId(baseId) : baseId;
    };

    // Helper to render children with getUniqueId
    const renderChildrenWithId = (childNodes: unknown[]) => {
        return childNodes.map((child, index) => {
            if ('text' in (child as TextNode)) {
                return <React.Fragment key={index}>{renderText(child)}</React.Fragment>;
            }
            // Nested element
            return <ElementRenderer key={index} element={child as ElementProps['element']} getUniqueId={getUniqueId} />;
        });
    };

    switch (type) {
        // Paragraphs
        case 'paragraph':
            return <p className="leading-relaxed">{renderChildrenWithId(children)}</p>;

        // Headings - reduced top margin, added spacing
        case 'heading-one':
            return (
                <h1 
                    id={getHeadingId(getTextContent(children))} 
                    className="text-3xl font-bold mt-6 mb-3 scroll-mt-20"
                >
                    {renderChildrenWithId(children)}
                </h1>
            );
        case 'heading-two':
            return (
                <h2 
                    id={getHeadingId(getTextContent(children))} 
                    className="text-2xl font-bold mt-5 mb-2 scroll-mt-20"
                >
                    {renderChildrenWithId(children)}
                </h2>
            );
        case 'heading-three':
            return (
                <h3 
                    id={getHeadingId(getTextContent(children))} 
                    className="text-xl font-semibold mt-4 mb-2 scroll-mt-20"
                >
                    {renderChildrenWithId(children)}
                </h3>
            );

        // Blockquote - Lavender themed
        case 'blockquote':
            return (
                <blockquote className="border-l-4 border-[oklch(0.65_0.20_285)] bg-[oklch(0.96_0.02_285)] dark:bg-[oklch(0.20_0.04_285)] pl-5 pr-4 py-3 my-4 rounded-r-lg">
                    <div className="text-[oklch(0.35_0.03_285)] dark:text-[oklch(0.80_0.02_285)] italic">
                        {renderChildrenWithId(children)}
                    </div>
                </blockquote>
            );

        // Lists - Properly styled with native bullets/numbers
        case 'bulleted-list':
            return (
                <ul className="my-3 ml-6 space-y-1.5 list-disc" style={{ listStyleType: 'disc' }}>
                    {renderChildrenWithId(children)}
                </ul>
            );
        case 'numbered-list':
            return (
                <ol className="my-3 ml-6 space-y-1.5 list-decimal" style={{ listStyleType: 'decimal' }}>
                    {renderChildrenWithId(children)}
                </ol>
            );
        case 'todo-list':
            return (
                <ul className="my-3 space-y-2 list-none">
                    {renderChildrenWithId(children)}
                </ul>
            );
        case 'list-item':
            return (
                <li className="pl-1" style={{ display: 'list-item' }}>
                    {renderChildrenWithId(children)}
                </li>
            );
        case 'numbered-list-item':
            return (
                <li className="pl-1" style={{ display: 'list-item' }}>
                    {renderChildrenWithId(children)}
                </li>
            );
        case 'todo-list-item': {
            const checked = (props as { checked?: boolean }).checked;
            return (
                <li className="flex items-start gap-3">
                    <div className={cn(
                        "mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                        checked 
                            ? "bg-[oklch(0.55_0.20_285)] border-[oklch(0.55_0.20_285)]" 
                            : "border-[oklch(0.75_0.08_285)] dark:border-[oklch(0.40_0.06_285)]"
                    )}>
                        {checked && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <span className={cn("flex-1", checked && "line-through text-[var(--fg-muted)] opacity-70")}>
                        {renderChildrenWithId(children)}
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
                <figure className="my-4">
                    <img
                        src={imageProps.src}
                        alt={imageProps.alt || ''}
                        width={imageProps.sizes?.width}
                        height={imageProps.sizes?.height}
                        loading="lazy"
                        className="rounded-lg max-w-full h-auto mx-auto"
                    />
                    {imageProps.alt && (
                        <figcaption className="text-center text-sm text-[var(--fg-muted)] mt-2">
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
                      <div className="my-4 aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&showinfo=0&fs=0&iv_load_policy=3&disablekb=1`}
                          className="w-full h-full rounded-lg"
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen={false}
                          title="Video"
                          rel="0" 
                        />
                      </div>
                    );
                }
            }
            
            return (
                <div className="my-4">
                    <video
                        src={videoProps.src}
                        controls
                        className="w-full rounded-lg"
                    />
                </div>
            );
        }

        // Embed - handle various embed providers
        case 'embed': {
            const embedProps = props as { 
                src?: string; 
                url?: string;
                provider?: {
                    type?: string;
                    id?: string;
                    url?: string;
                    embedUrl?: string;
                } | null;
                sizes?: { width: number; height: number };
            };
            
            // Get the URL from provider object or direct src/url props
            const provider = embedProps.provider;
            const embedUrl = provider?.embedUrl || provider?.url || embedProps.src || embedProps.url;
            const providerType = provider?.type;
            
            if (!embedUrl) return null;
            
            // Handle YouTube embeds
            if (providerType === 'youtube' || embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
                const videoId = extractYouTubeId(embedUrl);
                if (videoId) {
                    return (
                        <div className="my-4 aspect-video">
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                className="w-full h-full rounded-lg"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="YouTube video"
                            />
                        </div>
                    );
                }
            }
            
            // Handle Vimeo embeds
            if (providerType === 'vimeo' || embedUrl.includes('vimeo.com')) {
                const vimeoId = extractVimeoId(embedUrl);
                if (vimeoId) {
                    return (
                        <div className="my-4 aspect-video">
                            <iframe
                                src={`https://player.vimeo.com/video/${vimeoId}`}
                                className="w-full h-full rounded-lg"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                                title="Vimeo video"
                            />
                        </div>
                    );
                }
            }
            
            // Handle Instagram embeds - Full post with caption, centered
            if (providerType === 'instagram' || embedUrl.includes('instagram.com')) {
                const instagramId = extractInstagramId(embedUrl);
                if (instagramId) {
                    return (
                        <div className="my-6 flex justify-center">
                            <iframe
                                src={`https://www.instagram.com/p/${instagramId}/embed/captioned`}
                                className="rounded-xl border border-[var(--border-color)]"
                                style={{ width: '440px', minHeight: '680px' }}
                                scrolling="no"
                                frameBorder="0"
                                allow="encrypted-media"
                                title="Instagram post"
                            />
                        </div>
                    );
                }
            }
            
            // Handle Spotify embeds
            if (providerType === 'spotify' || embedUrl.includes('spotify.com') || embedUrl.includes('open.spotify')) {
                const spotifyData = extractSpotifyData(embedUrl);
                if (spotifyData) {
                    const { type, id } = spotifyData;
                    // Different heights for different content types
                    const height = type === 'track' ? '152' : type === 'episode' ? '232' : '352';
                    return (
                        <div className="my-4">
                            <iframe
                                src={`https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`}
                                className="w-full rounded-xl border-0"
                                style={{ height: `${height}px` }}
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                title={`Spotify ${type}`}
                            />
                        </div>
                    );
                }
            }
            
            // Handle Twitter/X embeds
            if (providerType === 'twitter' || embedUrl.includes('twitter.com') || embedUrl.includes('x.com')) {
                const tweetId = extractTwitterId(embedUrl);
                if (tweetId) {
                    return (
                        <div className="my-4">
                            <div className="max-w-[550px] mx-auto">
                                <iframe
                                    src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark`}
                                    className="w-full rounded-lg border border-[var(--border-color)]"
                                    style={{ minHeight: '300px', height: 'auto' }}
                                    allow="encrypted-media"
                                    title="Twitter/X post"
                                />
                            </div>
                        </div>
                    );
                }
            }
            
            // Handle CodePen embeds
            if (providerType === 'codepen' || embedUrl.includes('codepen.io')) {
                return (
                    <div className="my-4 aspect-video">
                        <iframe
                            src={embedUrl.replace('/pen/', '/embed/')}
                            className="w-full h-full rounded-lg border border-[var(--border-color)]"
                            allowFullScreen
                            title="CodePen"
                        />
                    </div>
                );
            }
            
            // Handle CodeSandbox embeds
            if (providerType === 'codesandbox' || embedUrl.includes('codesandbox.io')) {
                return (
                    <div className="my-4 aspect-video">
                        <iframe
                            src={embedUrl.replace('/s/', '/embed/')}
                            className="w-full h-full rounded-lg border border-[var(--border-color)]"
                            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                            title="CodeSandbox"
                        />
                    </div>
                );
            }
            
            // Handle Figma embeds
            if (providerType === 'figma' || embedUrl.includes('figma.com')) {
                return (
                    <div className="my-4 aspect-video">
                        <iframe
                            src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(embedUrl)}`}
                            className="w-full h-full rounded-lg border border-[var(--border-color)]"
                            allowFullScreen
                            title="Figma design"
                        />
                    </div>
                );
            }
            
            // Handle Loom embeds
            if (providerType === 'loom' || embedUrl.includes('loom.com')) {
                const loomId = extractLoomId(embedUrl);
                if (loomId) {
                    return (
                        <div className="my-4 aspect-video">
                            <iframe
                                src={`https://www.loom.com/embed/${loomId}`}
                                className="w-full h-full rounded-lg"
                                frameBorder="0"
                                allowFullScreen
                                title="Loom video"
                            />
                        </div>
                    );
                }
            }
            
            // Handle SoundCloud embeds
            if (providerType === 'soundcloud' || embedUrl.includes('soundcloud.com')) {
                return (
                    <div className="my-4">
                        <iframe
                            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(embedUrl)}&color=%238b5cf6&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
                            className="w-full rounded-lg border-0"
                            style={{ height: '166px' }}
                            allow="autoplay"
                            title="SoundCloud"
                        />
                    </div>
                );
            }
            
            // Handle Google Maps embeds
            if (providerType === 'google-maps' || embedUrl.includes('google.com/maps') || embedUrl.includes('maps.google.com')) {
                return (
                    <div className="my-4 aspect-video">
                        <iframe
                            src={embedUrl}
                            className="w-full h-full rounded-lg border border-[var(--border-color)]"
                            style={{ minHeight: '400px' }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Google Maps"
                        />
                    </div>
                );
            }
            
            // Default iframe for other embeds
            return (
                <div className="my-4 aspect-video">
                    <iframe
                        src={embedUrl}
                        className="w-full h-full rounded-lg border border-[var(--border-color)]"
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
                <pre className="my-3 p-4 bg-[oklch(0.15_0.02_285)] rounded-lg overflow-x-auto">
                    <code data-language={codeProps.language || 'text'} className="text-sm font-mono text-[oklch(0.9_0.01_285)]">
                        {codeText}
                    </code>
                </pre>
            );
        }

        // Table
        case 'table':
            return (
                <div className="my-4 overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                        <tbody>{renderChildrenWithId(children)}</tbody>
                    </table>
                </div>
            );
        case 'table-row':
            return <tr className="border-b border-border">{renderChildrenWithId(children)}</tr>;
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
                    {renderChildrenWithId(children)}
                </CellTag>
            );
        }

        // Divider - Lavender themed
        case 'divider':
            return <hr className="my-8 border-t-2 border-[oklch(0.85_0.08_285)] dark:border-[oklch(0.35_0.06_285)]" />;

        // Callout - Lavender themed
        case 'callout': {
            const calloutProps = props as { theme?: string; type?: string };
            const calloutType = calloutProps.theme || calloutProps.type || 'default';
            
            // Lavender-based color scheme
            const styles: Record<string, string> = {
                default: 'bg-[oklch(0.96_0.02_285)] dark:bg-[oklch(0.20_0.04_285)] border-l-4 border-[oklch(0.65_0.18_285)]',
                info: 'bg-[oklch(0.95_0.03_250)] dark:bg-[oklch(0.20_0.05_250)] border-l-4 border-[oklch(0.60_0.15_250)]',
                warning: 'bg-[oklch(0.95_0.05_85)] dark:bg-[oklch(0.22_0.06_85)] border-l-4 border-[oklch(0.70_0.15_85)]',
                error: 'bg-[oklch(0.95_0.03_25)] dark:bg-[oklch(0.20_0.06_25)] border-l-4 border-[oklch(0.60_0.18_25)]',
                success: 'bg-[oklch(0.95_0.04_145)] dark:bg-[oklch(0.20_0.05_145)] border-l-4 border-[oklch(0.60_0.15_145)]',
            };
            
            return (
                <div className={cn('my-4 p-4 rounded-r-lg', styles[calloutType] || styles.default)}>
                    {renderChildrenWithId(children)}
                </div>
            );
        }

        // Accordion
        case 'accordion-list':
            return <div className="my-4 space-y-2">{renderChildrenWithId(children)}</div>;
        case 'accordion-list-item':
            return <details className="border rounded-lg">{renderChildrenWithId(children)}</details>;
        case 'accordion-list-item-heading':
            return (
                <summary className="px-4 py-3 cursor-pointer font-medium hover:bg-muted">
                    {renderChildrenWithId(children)}
                </summary>
            );
        case 'accordion-list-item-content':
            return <div className="px-4 py-3 border-t">{renderChildrenWithId(children)}</div>;

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
                    {renderChildrenWithId(children)}
                </a>
            );
        }

        // Default fallback
        default:
            if (children && children.length > 0) {
                return <div>{renderChildrenWithId(children)}</div>;
            }
            return null;
    }
}

// ===== BLOCK RENDERER =====

interface BlockRendererProps extends BlockProps {
    getUniqueId: (baseId: string) => string;
}

function BlockRenderer({ block, getUniqueId }: BlockRendererProps): React.ReactNode {
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
                    getUniqueId={getUniqueId}
                />
            ))}
        </div>
    );
}

// ===== MAIN RENDERER =====

// Track used heading IDs to handle duplicates
function createIdTracker() {
    const usedIds = new Set<string>();
    return function getUniqueId(baseId: string): string {
        if (!usedIds.has(baseId)) {
            usedIds.add(baseId);
            return baseId;
        }
        let counter = 1;
        while (usedIds.has(`${baseId}-${counter}`)) {
            counter++;
        }
        const uniqueId = `${baseId}-${counter}`;
        usedIds.add(uniqueId);
        return uniqueId;
    };
}

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

    // Create ID tracker for this render
    const getUniqueId = createIdTracker();

    return (
        <article className={cn('prose prose-neutral dark:prose-invert max-w-none', className)}>
            {sortedBlocks.map((block) => (
                <BlockRenderer key={block.id} block={block} getUniqueId={getUniqueId} />
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

function extractVimeoId(url: string): string | null {
    const patterns = [
        /vimeo\.com\/(\d+)/,
        /player\.vimeo\.com\/video\/(\d+)/,
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
    }
    
    return null;
}

function extractInstagramId(url: string): string | null {
    // Match Instagram post, reel, or tv URLs
    const patterns = [
        /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
        /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
        /instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
    }
    
    return null;
}

function extractSpotifyData(url: string): { type: string; id: string } | null {
    // Match Spotify track, album, playlist, episode, show URLs
    const patterns = [
        /spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
        /open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
        /spotify\.com\/embed\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1] && match?.[2]) {
            return { type: match[1], id: match[2] };
        }
    }
    
    return null;
}

function extractTwitterId(url: string): string | null {
    // Match Twitter/X status URLs
    const patterns = [
        /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
    }
    
    return null;
}

function extractLoomId(url: string): string | null {
    // Match Loom video URLs
    const patterns = [
        /loom\.com\/share\/([a-zA-Z0-9]+)/,
        /loom\.com\/embed\/([a-zA-Z0-9]+)/,
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
