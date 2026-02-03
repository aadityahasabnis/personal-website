/**
 * Custom Element Renderers for Yoopta Editor
 *
 * Professional upload UI for Image, Video, and File blocks
 * with lavender theme integration and premium UX.
 */

"use client";

import React, { useRef, useState, useCallback } from "react";
import { useYooptaEditor, Elements, Blocks } from "@yoopta/editor";
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Loader2,
  X,
  AlertCircle,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImage, uploadVideo, uploadFile } from "./plugins";

// Types
interface RenderElementProps {
  element: {
    id: string;
    type: string;
    children: unknown[];
    props?: Record<string, unknown>;
  };
  attributes: Record<string, unknown>;
  children: React.ReactNode;
  blockId: string;
}

// ===== SHARED STYLES =====

const uploadContainerStyles = cn(
  "my-4 rounded-xl overflow-hidden",
  "border-2 border-dashed",
  "border-[var(--border-color)]",
  "bg-[var(--surface)]",
  "hover:border-[var(--accent)] hover:bg-[var(--surface-hover)]",
  "transition-all duration-200 ease-out",
  "cursor-pointer",
);

const uploadContentStyles = cn(
  "flex flex-col items-center justify-center gap-3",
  "p-8 min-h-[180px]",
);

const iconContainerStyles = cn(
  "w-14 h-14 rounded-2xl",
  "bg-[var(--accent-subtle)]",
  "flex items-center justify-center",
  "transition-transform duration-200",
  "group-hover:scale-110",
);

const primaryButtonStyles = cn(
  "px-4 py-2 rounded-lg",
  "bg-[var(--accent)] text-[var(--accent-fg)]",
  "font-medium text-sm",
  "flex items-center gap-2",
  "hover:opacity-90",
  "transition-all duration-150",
  "active:scale-[0.98]",
);

const secondaryButtonStyles = cn(
  "px-4 py-2 rounded-lg",
  "bg-[var(--surface)] text-[var(--fg)]",
  "border border-[var(--border-color)]",
  "font-medium text-sm",
  "flex items-center gap-2",
  "hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)]",
  "transition-all duration-150",
);

const deleteButtonStyles = cn(
  "absolute top-3 right-3 p-2",
  "bg-[var(--error)] text-white",
  "rounded-full shadow-lg",
  "opacity-0 group-hover:opacity-100",
  "transition-opacity duration-200",
  "hover:scale-110 active:scale-95",
  "z-10",
);

// ===== IMAGE ELEMENT =====

export const ImageElement = ({
  element,
  attributes,
  children,
  blockId,
}: RenderElementProps) => {
  const editor = useYooptaEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("Image must be less than 10MB");
        return;
      }

      setLoading(true);
      setError(null);
      setProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      try {
        const result = await uploadImage(file);
        setProgress(100);

        Elements.updateElement(editor, {
          blockId,
          type: "image",
          props: {
            id: result.id,
            src: result.src,
            alt: result.alt || file.name.replace(/\.[^/.]+$/, ""),
            sizes: result.sizes,
          },
        });
      } catch (err) {
        console.error("Image upload failed:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Upload failed. Please try again.",
        );
      } finally {
        clearInterval(progressInterval);
        setLoading(false);
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [editor, blockId],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDelete = useCallback(() => {
    Blocks.deleteBlock(editor, { blockId, focus: true });
  }, [editor, blockId]);

  const imageProps = element.props as {
    src?: string;
    alt?: string;
    sizes?: { width: number; height: number };
  };

  // If image is uploaded, show it
  if (imageProps?.src) {
    return (
      <div
        {...attributes}
        contentEditable={false}
        className="my-4 group relative"
      >
        <div className="relative rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--surface)]">
          <img
            src={imageProps.src}
            alt={imageProps.alt || ""}
            width={imageProps.sizes?.width}
            height={imageProps.sizes?.height}
            className="w-full h-auto object-contain"
            loading="lazy"
          />
          <button
            type="button"
            onClick={handleDelete}
            className={deleteButtonStyles}
            title="Delete image"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
        {imageProps.alt && (
          <p className="mt-2 text-center text-sm text-[var(--fg-muted)]">
            {imageProps.alt}
          </p>
        )}
        {children}
      </div>
    );
  }

  // Show upload UI
  return (
    <div {...attributes} contentEditable={false}>
      <div
        className={cn(
          uploadContainerStyles,
          "group",
          isDragging &&
            "border-[var(--accent)] bg-[var(--accent-subtle)] scale-[1.01]",
          loading && "pointer-events-none opacity-80",
        )}
        onClick={() => !loading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className={uploadContentStyles}>
          {loading ? (
            <>
              <div className={cn(iconContainerStyles, "animate-pulse")}>
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--fg)]">
                  Uploading...
                </p>
                <div className="mt-2 w-48 h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] transition-all duration-200 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  {progress}%
                </p>
              </div>
            </>
          ) : error ? (
            <>
              <div className={cn(iconContainerStyles, "bg-[var(--error)]/10")}>
                <AlertCircle className="h-6 w-6 text-[var(--error)]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--error)]">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setError(null);
                  }}
                  className="mt-2 text-sm text-[var(--accent)] hover:underline"
                >
                  Try again
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={iconContainerStyles}>
                <ImageIcon className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--fg)]">
                  {isDragging ? "Drop image here" : "Click or drag to upload"}
                </p>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  PNG, JPG, GIF, WebP up to 10MB
                </p>
              </div>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {children}
    </div>
  );
};

// ===== VIDEO ELEMENT =====

export const VideoElement = ({
  element,
  attributes,
  children,
  blockId,
}: RenderElementProps) => {
  const editor = useYooptaEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/")) {
        setError("Please select a video file");
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        setError("Video must be less than 100MB");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await uploadVideo(file);

        Elements.updateElement(editor, {
          blockId,
          type: "video",
          props: {
            id: result.id,
            src: result.src,
            sizes: result.sizes,
          },
        });
      } catch (err) {
        console.error("Video upload failed:", err);
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [editor, blockId],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;

    Elements.updateElement(editor, {
      blockId,
      type: "video",
      props: {
        src: urlInput.trim(),
        provider: urlInput.includes("youtube")
          ? "youtube"
          : urlInput.includes("vimeo")
            ? "vimeo"
            : "custom",
      },
    });
    setShowUrlInput(false);
    setUrlInput("");
  }, [urlInput, editor, blockId]);

  const handleDelete = useCallback(() => {
    Blocks.deleteBlock(editor, { blockId, focus: true });
  }, [editor, blockId]);

  const videoProps = element.props as {
    src?: string;
    provider?: string;
    sizes?: { width: number; height: number };
  };

  // If video is set, show it
  if (videoProps?.src) {
    // Check for YouTube
    const youtubeId = extractYouTubeId(videoProps.src);
    if (youtubeId) {
      return (
        <div
          {...attributes}
          contentEditable={false}
          className="my-4 group relative"
        >
          <div className="relative rounded-xl overflow-hidden border border-[var(--border-color)] aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              type="button"
              onClick={handleDelete}
              className={deleteButtonStyles}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
          {children}
        </div>
      );
    }

    // Check for Vimeo
    const vimeoId = extractVimeoId(videoProps.src);
    if (vimeoId) {
      return (
        <div
          {...attributes}
          contentEditable={false}
          className="my-4 group relative"
        >
          <div className="relative rounded-xl overflow-hidden border border-[var(--border-color)] aspect-video">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
            <button
              type="button"
              onClick={handleDelete}
              className={deleteButtonStyles}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
          {children}
        </div>
      );
    }

    // Direct video file
    return (
      <div
        {...attributes}
        contentEditable={false}
        className="my-4 group relative"
      >
        <div className="relative rounded-xl overflow-hidden border border-[var(--border-color)]">
          <video
            src={videoProps.src}
            controls
            className="w-full"
            width={videoProps.sizes?.width}
            height={videoProps.sizes?.height}
          />
          <button
            type="button"
            onClick={handleDelete}
            className={deleteButtonStyles}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
        {children}
      </div>
    );
  }

  // Show upload UI
  return (
    <div {...attributes} contentEditable={false}>
      <div
        className={cn(
          uploadContainerStyles,
          "group",
          isDragging && "border-[var(--accent)] bg-[var(--accent-subtle)]",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className={uploadContentStyles}>
          {loading ? (
            <>
              <div className={cn(iconContainerStyles, "animate-pulse")}>
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
              </div>
              <p className="text-sm font-medium text-[var(--fg)]">
                Uploading video...
              </p>
            </>
          ) : error ? (
            <>
              <div className={cn(iconContainerStyles, "bg-[var(--error)]/10")}>
                <AlertCircle className="h-6 w-6 text-[var(--error)]" />
              </div>
              <p className="text-sm font-medium text-[var(--error)]">{error}</p>
            </>
          ) : showUrlInput ? (
            <div className="w-full max-w-md space-y-4 px-4">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste YouTube, Vimeo, or video URL..."
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "bg-[var(--card-bg)] text-[var(--fg)]",
                  "border border-[var(--border-color)]",
                  "focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20",
                  "placeholder:text-[var(--fg-muted)]",
                  "outline-none transition-all",
                )}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                autoFocus
              />
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className={primaryButtonStyles}
                >
                  <CheckCircle2 size={16} />
                  Embed Video
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(false)}
                  className={secondaryButtonStyles}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={iconContainerStyles}>
                <Video className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--fg)]">
                  {isDragging ? "Drop video here" : "Add a video"}
                </p>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Upload a file or embed from YouTube/Vimeo
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className={primaryButtonStyles}
                >
                  <Upload size={16} />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUrlInput(true);
                  }}
                  className={secondaryButtonStyles}
                >
                  <LinkIcon size={16} />
                  Embed URL
                </button>
              </div>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {children}
    </div>
  );
};

// ===== FILE ELEMENT =====

export const FileElement = ({
  element,
  attributes,
  children,
  blockId,
}: RenderElementProps) => {
  const editor = useYooptaEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      if (file.size > 50 * 1024 * 1024) {
        setError("File must be less than 50MB");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await uploadFile(file);

        Elements.updateElement(editor, {
          blockId,
          type: "file",
          props: {
            id: result.id,
            src: result.src,
            name: result.name,
            size: result.size,
            format: result.format,
          },
        });
      } catch (err) {
        console.error("File upload failed:", err);
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [editor, blockId],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDelete = useCallback(() => {
    Blocks.deleteBlock(editor, { blockId, focus: true });
  }, [editor, blockId]);

  const fileProps = element.props as {
    src?: string;
    name?: string;
    size?: number;
    format?: string;
  };

  // If file is uploaded, show it
  if (fileProps?.src) {
    return (
      <div
        {...attributes}
        contentEditable={false}
        className="my-4 group relative"
      >
        <a
          href={fileProps.src}
          download={fileProps.name}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-4 p-4",
            "rounded-xl border border-[var(--border-color)]",
            "bg-[var(--card-bg)]",
            "hover:bg-[var(--surface)] hover:border-[var(--border-hover)]",
            "transition-all duration-200",
          )}
        >
          <div className={cn(iconContainerStyles, "w-12 h-12")}>
            <FileText className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--fg)] truncate">
              {fileProps.name || "File"}
            </p>
            <p className="text-sm text-[var(--fg-muted)]">
              {fileProps.format?.toUpperCase()}
              {fileProps.size && ` • ${formatFileSize(fileProps.size)}`}
            </p>
          </div>
          <span className="text-sm text-[var(--accent)] font-medium">
            Download
          </span>
        </a>
        <button
          type="button"
          onClick={handleDelete}
          className={deleteButtonStyles}
        >
          <X size={14} strokeWidth={2.5} />
        </button>
        {children}
      </div>
    );
  }

  // Show upload UI
  return (
    <div {...attributes} contentEditable={false}>
      <div
        className={cn(
          uploadContainerStyles,
          "group",
          isDragging && "border-[var(--accent)] bg-[var(--accent-subtle)]",
          loading && "pointer-events-none opacity-80",
        )}
        onClick={() => !loading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className={cn(uploadContentStyles, "min-h-[140px]")}>
          {loading ? (
            <>
              <div className={cn(iconContainerStyles, "animate-pulse")}>
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
              </div>
              <p className="text-sm font-medium text-[var(--fg)]">
                Uploading file...
              </p>
            </>
          ) : error ? (
            <>
              <div className={cn(iconContainerStyles, "bg-[var(--error)]/10")}>
                <AlertCircle className="h-6 w-6 text-[var(--error)]" />
              </div>
              <p className="text-sm font-medium text-[var(--error)]">{error}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setError(null);
                }}
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Try again
              </button>
            </>
          ) : (
            <>
              <div className={iconContainerStyles}>
                <FileText className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--fg)]">
                  {isDragging ? "Drop file here" : "Click or drag to upload"}
                </p>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  PDF, Word, Excel, or other documents up to 50MB
                </p>
              </div>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {children}
    </div>
  );
};

// ===== UTILITY FUNCTIONS =====

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ===== EXPORT ELEMENT CONFIGS =====

export const CustomImageRender = ImageElement;
export const CustomVideoRender = VideoElement;
export const CustomFileRender = FileElement;
