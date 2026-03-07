/**
 * Server-safe HTML processor for Authorly content.
 *
 * Replicates the regex-based path from authorly-editor's processHtml (the Jl function)
 * so we can process HTML at build/request time on the server without importing the
 * full authorly-editor bundle (which has browser-only dependencies).
 *
 * This eliminates the FOUC caused by client-side processing in useEffect.
 */

export interface ProcessHtmlServerOptions {
    /** Wrap <pre><code> in .cbr-code-wrapper with toolbar + copy button */
    enableCodeCopy?: boolean;
    /** Add .cbr-checked-item class to checked checklist items */
    enableChecklistStyles?: boolean;
    /** Add target="_blank" rel="noopener noreferrer" to links */
    enableExternalLinks?: boolean;
}

const DEFAULT_OPTIONS: ProcessHtmlServerOptions = {
    enableCodeCopy: true,
    enableChecklistStyles: true,
    enableExternalLinks: true,
};

/**
 * Process HTML server-side to match what authorly-editor's processHtml does.
 * Safe to run in Node.js — uses only regex/string manipulation.
 */
export function processHtmlServer(
    html: string,
    options: ProcessHtmlServerOptions = {}
): string {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let result = html;

    // 1. Remove editor-only UI elements (these shouldn't be in saved HTML, but clean up just in case)
    const editorClasses = [
        'cb-image-controls',
        'cb-image-placeholder',
        'cb-video-placeholder',
        'cb-image-resize-handle',
        'cb-callout-type-selector',
    ];

    for (const cls of editorClasses) {
        // Match elements with this class and remove them (including content)
        result = result.replace(
            new RegExp(
                `<[^>]+class="[^"]*\\b${cls}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/[a-z][a-z0-9]*>`,
                'gi'
            ),
            ''
        );
    }

    // 2. Wrap code blocks in .cbr-code-wrapper with toolbar
    if (opts.enableCodeCopy) {
        result = result.replace(
            /<pre([^>]*)><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi,
            (_match, preAttrs: string, codeAttrs: string, content: string) => {
                // Extract language from data-language or class="language-xxx"
                let lang =
                    preAttrs.match(/data-language="([^"]*)"/i)?.[1] ||
                    codeAttrs.match(/language-(\w+)/i)?.[1] ||
                    '';

                // Capitalize first letter for display, default to "Code"
                if (lang) {
                    lang = lang.charAt(0).toUpperCase() + lang.slice(1);
                } else {
                    lang = 'Code';
                }

                // Build the wrapper HTML
                // Note: onclick handler uses inline script for copy functionality
                return `<div class="cbr-code-wrapper">
  <div class="cbr-code-toolbar">
    <div class="cbr-code-toolbar-left">
      <div class="cbr-code-dots">
        <span class="cbr-code-dot cbr-code-dot-red"></span>
        <span class="cbr-code-dot cbr-code-dot-yellow"></span>
        <span class="cbr-code-dot cbr-code-dot-green"></span>
      </div>
      <span class="cbr-code-lang">${lang}</span>
    </div>
    <button class="cbr-code-copy" onclick="(function(btn){var code=btn.closest('.cbr-code-wrapper').querySelector('code');navigator.clipboard.writeText(code.textContent||'').then(function(){btn.textContent='Copied!';setTimeout(function(){btn.textContent='Copy';},2000);});})
(this)">Copy</button>
  </div>
  <pre class="cbr-code-block"${preAttrs}><code${codeAttrs}>${content}</code></pre>
</div>`;
            }
        );
    }

    // 3. Add .cbr-checked-item class to checked checklist items
    if (opts.enableChecklistStyles) {
        result = result.replace(
            /<li([^>]*)>([\s\S]*?)<\/li>/gi,
            (match, attrs: string, content: string) => {
                // Check if this is a checklist item with a checked checkbox
                if (
                    /type=["']checkbox["']/i.test(content) &&
                    /\bchecked\b/i.test(content)
                ) {
                    // Add cbr-checked-item class to existing classes or create class attr
                    if (/\bclass=["'][^"']*["']/i.test(attrs)) {
                        attrs = attrs.replace(
                            /class=["']([^"']*)["']/i,
                            'class="$1 cbr-checked-item"'
                        );
                    } else {
                        attrs = `${attrs} class="cbr-checked-item"`;
                    }
                    return `<li${attrs}>${content}</li>`;
                }
                return match;
            }
        );
    }

    // 4. Add target="_blank" rel="noopener noreferrer" to links without target
    if (opts.enableExternalLinks) {
        result = result.replace(/<a(\s[^>]*)>/gi, (match, attrs: string) => {
            // Skip if already has target attribute
            if (/\btarget=/i.test(attrs)) {
                return match;
            }
            return `<a${attrs} target="_blank" rel="noopener noreferrer">`;
        });
    }

    return result;
}
