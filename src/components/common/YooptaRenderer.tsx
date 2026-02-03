/**
 * Yoopta Content Renderer
 *
 * Server-side renderer that converts Yoopta JSON content to SEO-friendly HTML.
 * This component handles all Yoopta v6 block types with proper styling.
 *
 * Features:
 * - SSR compatible
 * - SEO-friendly semantic HTML
 * - Lavender theme integration
 * - Supports all Yoopta v6 block types
 */

import React from "react";
import type { YooptaContentValue } from "@yoopta/editor";
import { cn } from "@/lib/utils";
import { CodeBlockClient } from "./CodeBlockClient";

// ===== TYPES =====

interface RendererProps {
  content: YooptaContentValue;
  className?: string;
}

interface YooptaBlock {
  id: string;
  type: string;
  value: YooptaElement[];
  meta: {
    order: number;
    depth: number;
    align?: "left" | "center" | "right";
  };
}

interface YooptaElement {
  id: string;
  type: string;
  children: YooptaNode[];
  props?: Record<string, unknown>;
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

type YooptaNode = TextNode | YooptaElement;

// ===== ELEMENT TYPE MAPPING =====
// Yoopta v6 uses different element type names than displayed
// This maps all possible variations to handler functions

const ELEMENT_TYPE_ALIASES: Record<string, string> = {
  // Paragraphs
  paragraph: "paragraph",
  Paragraph: "paragraph",

  // Headings
  "heading-one": "heading-one",
  HeadingOne: "heading-one",
  Heading1: "heading-one",
  h1: "heading-one",

  "heading-two": "heading-two",
  HeadingTwo: "heading-two",
  Heading2: "heading-two",
  h2: "heading-two",

  "heading-three": "heading-three",
  HeadingThree: "heading-three",
  Heading3: "heading-three",
  h3: "heading-three",

  // Lists
  "bulleted-list": "bulleted-list",
  BulletedList: "bulleted-list",
  ul: "bulleted-list",

  "numbered-list": "numbered-list",
  NumberedList: "numbered-list",
  ol: "numbered-list",

  "todo-list": "todo-list",
  TodoList: "todo-list",

  // List items
  "list-item": "list-item",
  "bulleted-list-item": "list-item",
  BulletedListItem: "list-item",

  "numbered-list-item": "numbered-list-item",
  NumberedListItem: "numbered-list-item",

  "todo-list-item": "todo-list-item",
  TodoListItem: "todo-list-item",

  // Block elements
  blockquote: "blockquote",
  Blockquote: "blockquote",

  code: "code",
  Code: "code",

  image: "image",
  Image: "image",

  video: "video",
  Video: "video",

  embed: "embed",
  Embed: "embed",

  divider: "divider",
  Divider: "divider",
  hr: "divider",

  callout: "callout",
  Callout: "callout",

  file: "file",
  File: "file",

  link: "link",
  Link: "link",

  // Tables
  table: "table",
  Table: "table",
  "table-row": "table-row",
  TableRow: "table-row",
  "table-data-cell": "table-data-cell",
  "table-cell": "table-data-cell",
  TableDataCell: "table-data-cell",
  TableCell: "table-data-cell",

  // Accordion
  "accordion-list": "accordion-list",
  AccordionList: "accordion-list",
  Accordion: "accordion-list",
  "accordion-list-item": "accordion-list-item",
  AccordionListItem: "accordion-list-item",
  "accordion-list-item-heading": "accordion-list-item-heading",
  AccordionListItemHeading: "accordion-list-item-heading",
  "accordion-list-item-content": "accordion-list-item-content",
  AccordionListItemContent: "accordion-list-item-content",
};

function normalizeElementType(type: string): string {
  return (
    ELEMENT_TYPE_ALIASES[type] ||
    type
      .toLowerCase()
      .replace(/([A-Z])/g, "-$1")
      .replace(/^-/, "")
  );
}

// ===== TEXT RENDERER =====

function renderText(node: unknown): React.ReactNode {
  if (typeof node === "string") {
    return node;
  }

  const textNode = node as TextNode;

  if ("text" in textNode) {
    let content: React.ReactNode = textNode.text;

    // Apply marks in order
    if (textNode.code) {
      content = (
        <code className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--border-color)] rounded text-[0.9em] font-mono text-[var(--accent)]">
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
      content = <s className="opacity-70">{content}</s>;
    }
    if (textNode.highlight) {
      content = (
        <mark
          className="px-1 py-0.5 rounded"
          style={{
            color: textNode.highlight.color,
            backgroundColor:
              textNode.highlight.backgroundColor || "oklch(0.85 0.18 90)",
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

function renderChildren(
  children: unknown[],
  getUniqueId?: (baseId: string) => string,
): React.ReactNode {
  if (!children || !Array.isArray(children)) return null;

  return children.map((child, index) => {
    if ("text" in (child as TextNode)) {
      return <React.Fragment key={index}>{renderText(child)}</React.Fragment>;
    }
    // Nested element
    return (
      <ElementRenderer
        key={index}
        element={child as YooptaElement}
        getUniqueId={getUniqueId}
      />
    );
  });
}

// ===== ELEMENT RENDERER =====

interface ElementRendererProps {
  element: YooptaElement;
  getUniqueId?: (baseId: string) => string;
}

function ElementRenderer({
  element,
  getUniqueId,
}: ElementRendererProps): React.ReactNode {
  const { type, children, props = {} } = element;
  const normalizedType = normalizeElementType(type);

  // Helper to generate heading ID with deduplication
  const getHeadingId = (text: string) => {
    const baseId = generateSlug(text);
    return getUniqueId ? getUniqueId(baseId) : baseId;
  };

  // Helper to render children with getUniqueId
  const renderChildrenWithId = (childNodes: unknown[]) => {
    return renderChildren(childNodes, getUniqueId);
  };

  switch (normalizedType) {
    // ===== PARAGRAPHS =====
    case "paragraph":
      return (
        <p className="leading-relaxed text-[var(--fg)]">
          {renderChildrenWithId(children)}
        </p>
      );

    // ===== HEADINGS =====
    case "heading-one":
      return (
        <h1
          id={getHeadingId(getTextContent(children))}
          className="text-3xl md:text-4xl font-bold mt-10 mb-4 text-[var(--fg)] scroll-mt-24 first:mt-0"
        >
          {renderChildrenWithId(children)}
        </h1>
      );
    case "heading-two":
      return (
        <h2
          id={getHeadingId(getTextContent(children))}
          className="text-2xl md:text-3xl font-bold mt-8 mb-3 text-[var(--fg)] scroll-mt-24"
        >
          {renderChildrenWithId(children)}
        </h2>
      );
    case "heading-three":
      return (
        <h3
          id={getHeadingId(getTextContent(children))}
          className="text-xl md:text-2xl font-semibold mt-6 mb-3 text-[var(--fg)] scroll-mt-24"
        >
          {renderChildrenWithId(children)}
        </h3>
      );

    // ===== BLOCKQUOTE =====
    case "blockquote":
      return (
        <blockquote className="my-6 border-l-4 border-[var(--accent)] bg-[var(--surface)] pl-6 pr-4 py-4 rounded-r-xl">
          <div className="text-[var(--fg-muted)] italic text-lg">
            {renderChildrenWithId(children)}
          </div>
        </blockquote>
      );

    // ===== LISTS =====
    case "bulleted-list":
      return (
        <ul className="my-4 list-disc pl-8">
          {renderChildrenWithId(children)}
        </ul>
      );
    case "numbered-list":
      return (
        <ol className="my-4 list-decimal pl-8">
          {renderChildrenWithId(children)}
        </ol>
      );
    case "todo-list":
      return (
        <ul className="my-4 space-y-3 list-none pl-0">
          {renderChildrenWithId(children)}
        </ul>
      );

    // ===== LIST ITEMS =====
    case "list-item":
      return (
        <li className="text-[var(--fg)] leading-relaxed">
          {renderChildrenWithId(children)}
        </li>
      );
    case "numbered-list-item":
      return (
        <li className="text-[var(--fg)] leading-relaxed">
          {renderChildrenWithId(children)}
        </li>
      );
    case "todo-list-item": {
      const checked = (props as { checked?: boolean }).checked;
      return (
        <li className="flex items-start gap-3">
          <div
            className={cn(
              "mt-1 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors",
              checked
                ? "bg-[var(--accent)] border-[var(--accent)]"
                : "border-[var(--border-color)]",
            )}
          >
            {checked && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <span
            className={cn(
              "flex-1 text-[var(--fg)]",
              checked && "line-through text-[var(--fg-muted)] opacity-60",
            )}
          >
            {renderChildrenWithId(children)}
          </span>
        </li>
      );
    }

    // ===== IMAGE =====
    case "image": {
      const imageProps = props as {
        src?: string;
        alt?: string;
        sizes?: { width: number; height: number };
      };
      if (!imageProps.src) return null;
      return (
        <figure className="my-8">
          <div className="rounded-xl overflow-hidden border border-[var(--border-color)]">
            <img
              src={imageProps.src}
              alt={imageProps.alt || ""}
              width={imageProps.sizes?.width}
              height={imageProps.sizes?.height}
              loading="lazy"
              className="w-full h-auto"
            />
          </div>
          {imageProps.alt && (
            <figcaption className="text-center text-sm text-[var(--fg-muted)] mt-3">
              {imageProps.alt}
            </figcaption>
          )}
        </figure>
      );
    }

    // ===== VIDEO =====
    case "video": {
      const videoProps = props as {
        src?: string;
        provider?: string;
      };
      if (!videoProps.src) return null;

      // Handle YouTube embeds
      const youtubeId = extractYouTubeId(videoProps.src);
      if (youtubeId) {
        return (
          <div className="my-8 rounded-xl overflow-hidden border border-[var(--border-color)]">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video"
              />
            </div>
          </div>
        );
      }

      // Handle Vimeo embeds
      const vimeoId = extractVimeoId(videoProps.src);
      if (vimeoId) {
        return (
          <div className="my-8 rounded-xl overflow-hidden border border-[var(--border-color)]">
            <div className="aspect-video">
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}`}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Vimeo video"
              />
            </div>
          </div>
        );
      }

      // Direct video
      return (
        <div className="my-8 rounded-xl overflow-hidden border border-[var(--border-color)]">
          <video src={videoProps.src} controls className="w-full" />
        </div>
      );
    }

    // ===== EMBED =====
    case "embed": {
      const embedProps = props as {
        src?: string;
        url?: string;
        provider?: {
          type?: string;
          id?: string;
          url?: string;
          embedUrl?: string;
        } | null;
      };

      const provider = embedProps.provider;
      const embedUrl =
        provider?.embedUrl || provider?.url || embedProps.src || embedProps.url;
      const providerType = provider?.type;

      if (!embedUrl) return null;

      // YouTube
      if (
        providerType === "youtube" ||
        embedUrl.includes("youtube.com") ||
        embedUrl.includes("youtu.be")
      ) {
        const videoId = extractYouTubeId(embedUrl);
        if (videoId) {
          return (
            <div className="my-8 rounded-xl overflow-hidden border border-[var(--border-color)]">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video"
                />
              </div>
            </div>
          );
        }
      }

      // Vimeo
      if (providerType === "vimeo" || embedUrl.includes("vimeo.com")) {
        const vimeoId = extractVimeoId(embedUrl);
        if (vimeoId) {
          return (
            <div className="my-8 rounded-xl overflow-hidden border border-[var(--border-color)]">
              <div className="aspect-video">
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoId}`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Vimeo video"
                />
              </div>
            </div>
          );
        }
      }

      // Instagram
      if (providerType === "instagram" || embedUrl.includes("instagram.com")) {
        const instagramId = extractInstagramId(embedUrl);
        if (instagramId) {
          return (
            <div className="my-8 flex justify-center">
              <iframe
                src={`https://www.instagram.com/p/${instagramId}/embed/captioned`}
                className="rounded-xl border border-[var(--border-color)]"
                style={{ width: "400px", minHeight: "620px" }}
                scrolling="no"
                allow="encrypted-media"
                title="Instagram post"
              />
            </div>
          );
        }
      }

      // Spotify
      if (providerType === "spotify" || embedUrl.includes("spotify.com")) {
        const spotifyData = extractSpotifyData(embedUrl);
        if (spotifyData) {
          const { type, id } = spotifyData;
          const height =
            type === "track" ? "142" : type === "episode" ? "232" : "352";
          return (
            <div className="my-8">
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

      // Twitter/X
      if (
        providerType === "twitter" ||
        embedUrl.includes("twitter.com") ||
        embedUrl.includes("x.com")
      ) {
        const tweetId = extractTwitterId(embedUrl);
        if (tweetId) {
          return (
            <div className="my-8 flex justify-center">
              <iframe
                src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark`}
                className="w-full max-w-[550px] rounded-xl border border-[var(--border-color)]"
                style={{ minHeight: "300px" }}
                allow="encrypted-media"
                title="Twitter post"
              />
            </div>
          );
        }
      }

      // Loom
      if (providerType === "loom" || embedUrl.includes("loom.com")) {
        const loomId = extractLoomId(embedUrl);
        if (loomId) {
          return (
            <div className="my-8 rounded-xl overflow-hidden border border-[var(--border-color)]">
              <div className="aspect-video">
                <iframe
                  src={`https://www.loom.com/embed/${loomId}`}
                  className="w-full h-full"
                  allowFullScreen
                  title="Loom video"
                />
              </div>
            </div>
          );
        }
      }

      // CodePen
      if (providerType === "codepen" || embedUrl.includes("codepen.io")) {
        return (
          <div className="my-8 rounded-xl overflow-hidden border border-[var(--border-color)]">
            <div className="aspect-video">
              <iframe
                src={embedUrl.replace("/pen/", "/embed/")}
                className="w-full h-full"
                allowFullScreen
                title="CodePen"
              />
            </div>
          </div>
        );
      }

      // CodeSandbox
      if (
        providerType === "codesandbox" ||
        embedUrl.includes("codesandbox.io")
      ) {
        return (
          <div className="my-8 rounded-xl overflow-hidden border border-[var(--border-color)]">
            <div className="aspect-video">
              <iframe
                src={embedUrl.replace("/s/", "/embed/")}
                className="w-full h-full"
                allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                title="CodeSandbox"
              />
            </div>
          </div>
        );
      }

      // Figma
      if (providerType === "figma" || embedUrl.includes("figma.com")) {
        return (
          <div className="my-8 rounded-xl overflow-hidden border border-[var(--border-color)]">
            <div className="aspect-video">
              <iframe
                src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(embedUrl)}`}
                className="w-full h-full"
                allowFullScreen
                title="Figma design"
              />
            </div>
          </div>
        );
      }

      // Default iframe
      return (
        <div className="my-8 rounded-xl overflow-hidden border border-[var(--border-color)]">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              title="Embedded content"
            />
          </div>
        </div>
      );
    }

    // ===== CODE =====
    case "code": {
      const codeProps = props as { language?: string; theme?: string };
      const codeText = getTextContent(children);
      const language = codeProps.language || "text";

      return (
        <CodeBlockClient language={language} code={codeText} />
      );
    }

    // ===== TABLE =====
    case "table":
      return (
        <div className="my-6 overflow-x-auto rounded-xl border border-[var(--border-color)]">
          <table className="w-full border-collapse">
            <tbody>{renderChildrenWithId(children)}</tbody>
          </table>
        </div>
      );
    case "table-row":
      return (
        <tr className="border-b border-[var(--border-color)] last:border-b-0">
          {renderChildrenWithId(children)}
        </tr>
      );
    case "table-data-cell": {
      const cellProps = props as {
        asHeader?: boolean;
        align?: "left" | "center" | "right";
      };
      const CellTag = cellProps.asHeader ? "th" : "td";
      return (
        <CellTag
          className={cn(
            "px-4 py-3 border-r border-[var(--border-color)] last:border-r-0",
            cellProps.asHeader &&
              "bg-[var(--surface)] font-semibold text-[var(--fg)]",
            !cellProps.asHeader && "text-[var(--fg)]",
            cellProps.align === "center" && "text-center",
            cellProps.align === "right" && "text-right",
          )}
        >
          {renderChildrenWithId(children)}
        </CellTag>
      );
    }

    // ===== DIVIDER =====
    case "divider":
      return (
        <hr className="my-10 border-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-40" />
      );

    // ===== CALLOUT =====
    case "callout": {
      const calloutProps = props as { theme?: string; type?: string };
      const calloutType = calloutProps.theme || calloutProps.type || "default";

      const styles: Record<
        string,
        { bg: string; border: string; icon: string }
      > = {
        default: {
          bg: "bg-[var(--surface)]",
          border: "border-[var(--accent)]",
          icon: "💡",
        },
        info: {
          bg: "bg-[oklch(0.95_0.03_250)] dark:bg-[oklch(0.20_0.05_250)]",
          border: "border-[oklch(0.60_0.15_250)]",
          icon: "ℹ️",
        },
        warning: {
          bg: "bg-[oklch(0.95_0.05_85)] dark:bg-[oklch(0.22_0.06_85)]",
          border: "border-[oklch(0.70_0.15_85)]",
          icon: "⚠️",
        },
        error: {
          bg: "bg-[oklch(0.95_0.03_25)] dark:bg-[oklch(0.20_0.06_25)]",
          border: "border-[oklch(0.60_0.18_25)]",
          icon: "❌",
        },
        success: {
          bg: "bg-[oklch(0.95_0.04_145)] dark:bg-[oklch(0.20_0.05_145)]",
          border: "border-[oklch(0.60_0.15_145)]",
          icon: "✅",
        },
      };

      const style = styles[calloutType] || styles.default;

      return (
        <div
          className={cn(
            "my-6 p-5 rounded-xl border-l-4",
            style.bg,
            style.border,
          )}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl" role="img" aria-hidden="true">
              {style.icon}
            </span>
            <div className="flex-1 text-[var(--fg)]">
              {renderChildrenWithId(children)}
            </div>
          </div>
        </div>
      );
    }

    // ===== ACCORDION =====
    case "accordion-list":
      return (
        <div className="my-6 space-y-3">{renderChildrenWithId(children)}</div>
      );
    case "accordion-list-item":
      return (
        <details className="group rounded-xl border border-[var(--border-color)] overflow-hidden">
          {renderChildrenWithId(children)}
        </details>
      );
    case "accordion-list-item-heading":
      return (
        <summary className="px-5 py-4 cursor-pointer font-medium text-[var(--fg)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors list-none flex items-center justify-between">
          <span>{renderChildrenWithId(children)}</span>
          <svg
            className="w-5 h-5 text-[var(--fg-muted)] transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
      );
    case "accordion-list-item-content":
      return (
        <div className="px-5 py-4 border-t border-[var(--border-color)] text-[var(--fg)]">
          {renderChildrenWithId(children)}
        </div>
      );

    // ===== FILE =====
    case "file": {
      const fileProps = props as {
        src?: string;
        name?: string;
        size?: number;
        format?: string;
      };
      if (!fileProps.src) return null;
      return (
        <a
          href={fileProps.src}
          download={fileProps.name}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "my-6 flex items-center gap-4 p-4",
            "rounded-xl border border-[var(--border-color)]",
            "bg-[var(--card-bg)]",
            "hover:bg-[var(--surface)] hover:border-[var(--border-hover)]",
            "transition-all duration-200 group",
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[var(--accent)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--fg)] truncate">
              {fileProps.name || "Download file"}
            </p>
            <p className="text-sm text-[var(--fg-muted)]">
              {fileProps.format?.toUpperCase()}
              {fileProps.size && ` • ${formatFileSize(fileProps.size)}`}
            </p>
          </div>
          <span className="text-sm font-medium text-[var(--accent)] group-hover:underline">
            Download
          </span>
        </a>
      );
    }

    // ===== LINK =====
    case "link": {
      const linkProps = props as { url?: string; title?: string };
      return (
        <a
          href={linkProps.url}
          title={linkProps.title}
          className="text-[var(--accent)] hover:underline font-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
          {renderChildrenWithId(children)}
        </a>
      );
    }

    // ===== DEFAULT FALLBACK =====
    default:
      console.warn(
        `Unknown element type: ${type} (normalized: ${normalizedType})`,
      );
      if (children && children.length > 0) {
        return <div>{renderChildrenWithId(children)}</div>;
      }
      return null;
  }
}

// ===== BLOCK RENDERER =====

interface BlockRendererProps {
  block: YooptaBlock;
  getUniqueId: (baseId: string) => string;
}

function BlockRenderer({
  block,
  getUniqueId,
}: BlockRendererProps): React.ReactNode {
  const { value, meta } = block;

  if (!value || !Array.isArray(value) || value.length === 0) {
    return null;
  }

  const alignClass =
    meta.align === "center"
      ? "text-center"
      : meta.align === "right"
        ? "text-right"
        : "";

  // Handle depth for nested blocks (indentation)
  const depthStyles =
    meta.depth > 0 ? { marginLeft: `${meta.depth * 1.5}rem` } : undefined;

  return (
    <div className={cn(alignClass)} style={depthStyles}>
      {value.map((element, index) => (
        <ElementRenderer
          key={`${block.id}-${index}`}
          element={element}
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
export function YooptaRenderer({
  content,
  className,
}: RendererProps): React.ReactNode {
  if (!content || typeof content !== "object") {
    return null;
  }

  // Sort blocks by order
  const sortedBlocks = Object.values(content).sort(
    (a, b) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0),
  ) as YooptaBlock[];

  // Create ID tracker for this render
  const getUniqueId = createIdTracker();

  return (
    <article className={cn("yoopta-rendered-content", "space-y-4", className)}>
      {sortedBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} getUniqueId={getUniqueId} />
      ))}
    </article>
  );
}

// ===== UTILITY FUNCTIONS =====

function getTextContent(children: unknown[]): string {
  if (!children || !Array.isArray(children)) return "";

  return children
    .map((child) => {
      if (typeof child === "string") return child;
      if ("text" in (child as TextNode)) return (child as TextNode).text;
      if ("children" in (child as { children: unknown[] })) {
        return getTextContent((child as { children: unknown[] }).children);
      }
      return "";
    })
    .join("");
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
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
  const patterns = [/vimeo\.com\/(\d+)/, /player\.vimeo\.com\/video\/(\d+)/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function extractInstagramId(url: string): string | null {
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
  const patterns = [
    /spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
    /open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
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
  const patterns = [/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function extractLoomId(url: string): string | null {
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
export async function renderToHtmlString(
  content: YooptaContentValue,
): Promise<string> {
  // Use React's renderToStaticMarkup for server-side rendering
  const ReactDOMServer = await import("react-dom/server");
  const element = <YooptaRenderer content={content} />;
  return ReactDOMServer.renderToStaticMarkup(element);
}

export default YooptaRenderer;
