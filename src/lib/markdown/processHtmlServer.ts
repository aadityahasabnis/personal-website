export interface ProcessHtmlServerOptions {
    enableCodeCopy?: boolean;
    enableChecklistStyles?: boolean;
    enableExternalLinks?: boolean;
}

const DEFAULT_OPTIONS: ProcessHtmlServerOptions = {
    enableCodeCopy: true,
    enableChecklistStyles: true,
    enableExternalLinks: true,
};

export function processHtmlServer(
    html: string,
    options: ProcessHtmlServerOptions = {}
): string {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let result = html;

    const editorClasses = [
        'cb-image-controls',
        'cb-image-placeholder',
        'cb-video-placeholder',
        'cb-image-resize-handle',
        'cb-callout-type-selector',
    ];

    for (const cls of editorClasses) {
        result = result.replace(
            new RegExp(
                `<[^>]+class="[^"]*\\b${cls}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/[a-z][a-z0-9]*>`,
                'gi'
            ),
            ''
        );
    }

    if (opts.enableCodeCopy) {
        result = result.replace(
            /<pre([^>]*)><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi,
            (_match, preAttrs: string, codeAttrs: string, content: string) => {
                let lang =
                    preAttrs.match(/data-language="([^"]*)"/i)?.[1] ||
                    codeAttrs.match(/language-(\w+)/i)?.[1] ||
                    '';

                if (lang) {
                    lang = lang.charAt(0).toUpperCase() + lang.slice(1);
                } else {
                    lang = 'Code';
                }

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

    if (opts.enableChecklistStyles) {
        result = result.replace(
            /<li([^>]*)>([\s\S]*?)<\/li>/gi,
            (match, attrs: string, content: string) => {
                if (
                    /type=["']checkbox["']/i.test(content) &&
                    /\bchecked\b/i.test(content)
                ) {
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

    if (opts.enableExternalLinks) {
        result = result.replace(/<a(\s[^>]*)>/gi, (match, attrs: string) => {
            if (/\btarget=/i.test(attrs)) {
                return match;
            }
            return `<a${attrs} target="_blank" rel="noopener noreferrer">`;
        });
    }

    return result;
}
