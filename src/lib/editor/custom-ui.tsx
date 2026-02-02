/**
 * Custom UI Components for Yoopta Editor
 * 
 * Enhanced upload placeholders for Image, Video, and File plugins
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomImageUI = (props: any) => {
    const { src, alt } = props.element.props || {};
    const { children, attributes } = props;
    
    if (!src) {
        // Upload placeholder
        return (
            <div 
                {...attributes}
                className="relative w-full rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface)]/80 transition-all cursor-pointer group"
                style={{ minHeight: '400px' }}
            >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8">
                    <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
                        <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-medium text-[var(--fg)]">Upload an image</p>
                        <p className="text-sm text-[var(--fg-muted)] mt-1">Click to browse or drag and drop</p>
                        <p className="text-xs text-[var(--fg-muted)] mt-2">PNG, JPG, GIF up to 10MB</p>
                    </div>
                </div>
                <div style={{ opacity: 0 }}>{children}</div>
            </div>
        );
    }
    
    // Rendered image
    return (
        <div {...attributes} className="relative group my-4">
            <img
                src={src}
                alt={alt || 'Image'}
                className="w-full h-auto rounded-xl border border-[var(--border-color)] shadow-sm"
                style={{
                    maxWidth: '100%',
                    height: 'auto',
                    minHeight: '300px',
                    objectFit: 'cover',
                }}
            />
            <div style={{ opacity: 0, height: 0, overflow: 'hidden' }}>{children}</div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomVideoUI = (props: any) => {
    const { src } = props.element.props || {};
    const { children, attributes } = props;
    
    if (!src) {
        // Upload placeholder
        return (
            <div 
                {...attributes}
                className="relative w-full rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface)]/80 transition-all cursor-pointer group"
                style={{ minHeight: '400px' }}
            >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8">
                    <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
                        <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-medium text-[var(--fg)]">Upload a video</p>
                        <p className="text-sm text-[var(--fg-muted)] mt-1">Click to browse or drag and drop</p>
                        <p className="text-xs text-[var(--fg-muted)] mt-2">MP4, WebM up to 100MB</p>
                    </div>
                </div>
                <div style={{ opacity: 0 }}>{children}</div>
            </div>
        );
    }
    
    // Rendered video
    return (
        <div {...attributes} className="relative group my-4">
            <video
                src={src}
                controls
                className="w-full rounded-xl border border-[var(--border-color)] shadow-sm"
                style={{
                    maxWidth: '100%',
                    height: 'auto',
                    minHeight: '300px',
                }}
            />
            <div style={{ opacity: 0, height: 0, overflow: 'hidden' }}>{children}</div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomFileUI = (props: any) => {
    const { src, name, format, size } = props.element.props || {};
    const { children, attributes } = props;
    
    if (!src) {
        // Upload placeholder
        return (
            <div 
                {...attributes}
                className="relative w-full rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface)]/80 transition-all cursor-pointer group"
                style={{ minHeight: '200px' }}
            >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8">
                    <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
                        <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-medium text-[var(--fg)]">Upload a file</p>
                        <p className="text-sm text-[var(--fg-muted)] mt-1">Click to browse or drag and drop</p>
                        <p className="text-xs text-[var(--fg-muted)] mt-2">Any file type up to 50MB</p>
                    </div>
                </div>
                <div style={{ opacity: 0 }}>{children}</div>
            </div>
        );
    }
    
    // Rendered file
    return (
        <div {...attributes} className="my-4">
            <a 
                href={src} 
                download={name}
                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] hover:bg-[var(--surface)]/80 hover:border-[var(--accent)] transition-all group"
            >
                <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
                    <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <p className="font-medium text-[var(--fg)]">{name || 'Download file'}</p>
                    <p className="text-sm text-[var(--fg-muted)]">
                        {format?.toUpperCase() || 'FILE'} {size ? `• ${(size / 1024 / 1024).toFixed(2)} MB` : ''}
                    </p>
                </div>
                <svg className="w-5 h-5 text-[var(--fg-muted)] group-hover:text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </a>
            <div style={{ opacity: 0, height: 0, overflow: 'hidden' }}>{children}</div>
        </div>
    );
};
