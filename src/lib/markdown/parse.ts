import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
export const parseMarkdown = async (markdown: string): Promise<string> => {
    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, {
            behavior: 'wrap',
            properties: {
                className: ['anchor-link'],
            },
        })
        .use(rehypeHighlight, {
            ignoreMissing: true,
            detect: true,
        })
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(markdown);

    return String(result);
};
