import { SITE_CONFIG } from '@/constants/siteConstants';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { slugify } from '@/lib/utils';
import type { IFieldConfig } from '../FormWrapper';
import type { IFormData } from '../form';

export interface IBaseSeoFormContext {
    title?: string;
    description?: string;
    slug?: string;
    tags?: string[];
    coverImage?: string;
}

/**
 * Commonized SEO fields configuration generator.
 * Returns the standard layout for `seo.title`, `seo.description`, `seo.keywords`, etc.
 * 
 * @param formData The current form data used to build dynamic placeholder suggestions
 * @param canonicalBasePath The base path for canonical URL rendering (e.g. '/articles')
 */
export const getSeoFieldConfig = <TFormBody extends IFormData & IBaseSeoFormContext>(
    formData: TFormBody,
    canonicalBasePath: string
): Array<IFieldConfig<TFormBody>> => {
    // dynamically determine suggestions using the user's current input
    const derivedTitle = formData.title ? `${formData.title} — ${SITE_CONFIG.author.name}` : `SEO Title — ${SITE_CONFIG.author.name}`;
    const derivedSlug = formData.slug || (formData.title ? slugify(formData.title) : 'your-slug-here');
    const derivedCanonical = `${SITE_CONFIG.url}${canonicalBasePath}/${derivedSlug}`;
    const derivedTagsText = formData.tags && formData.tags.length > 0 ? formData.tags.join(', ') : 'Press enter to add SEO keywords';
    const derivedOgTitle = formData.title || 'Untitled Content';
    const derivedOgSubtitle = formData.description || 'Generated social preview image';
    const derivedOgImage = buildDynamicOgImageUrl({
        title: derivedOgTitle,
        subtitle: derivedOgSubtitle,
        tags: formData.tags ?? [],
    });

    return [
        {
            fieldtype: 'group',
            title: 'SEO Settings',
            subText: 'Override search engine metadata. Leave blank to inherit defaults from the fields above.',
            colsize: 'full',
            fields: [
                {
                    fieldtype: 'input',
                    name: 'seo.title',
                    label: 'SEO Title',
                    placeholder: derivedTitle,
                    hint: 'Max 70 chars. Appears in browser tab and search results.',
                    colsize: 'full',
                },
                {
                    fieldtype: 'textArea',
                    name: 'seo.description',
                    label: 'SEO Description',
                    placeholder: formData.description || 'A concise description...',
                    rows: 2,
                    hint: 'Max 160 chars. Shown in search result snippets.',
                    colsize: 'full',
                },
                {
                    fieldtype: 'tagInput',
                    name: 'seo.keywords',
                    label: 'SEO Keywords',
                    placeholder: derivedTagsText,
                    hint: 'Hit enter to add. Supplements topic tags.',
                    colsize: 'full',
                },
                {
                    fieldtype: 'input',
                    name: 'seo.ogImage',
                    label: 'OG Image URL',
                    placeholder: derivedOgImage,
                    type: 'url',
                    hint: 'Open Graph image (1200×630). Auto-generated via /api/og when left blank; custom URL overrides it.',
                    allowCopy: true,
                    colsize: 'full',
                },
                {
                    fieldtype: 'input',
                    name: 'seo.canonicalUrl',
                    label: 'Canonical URL',
                    placeholder: derivedCanonical,
                    type: 'url',
                    hint: 'Override canonical URL. Leave blank to auto-derive.',
                    allowCopy: true,
                    colsize: 'full',
                },
                {
                    fieldtype: 'toggle',
                    name: 'seo.noIndex',
                    label: 'No Index — exclude this page from search engines',
                    colsize: 'full',
                },
            ],
        },
    ];
};
