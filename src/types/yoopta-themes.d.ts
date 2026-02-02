/**
 * Type declarations for @yoopta/themes-shadcn submodule imports
 * 
 * These modules export UI elements for each plugin.
 * We import from submodules to AVOID global CSS injection from the main package.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Generic element render type
type ElementRender = {
    render: React.FC<any>;
};

type ElementMap = Record<string, ElementRender>;

declare module '@yoopta/themes-shadcn/accordion' {
    export const AccordionUI: {
        accordion: ElementRender;
        'accordion-list': ElementRender;
        'accordion-list-item': ElementRender;
        'accordion-list-item-content': ElementRender;
        'accordion-list-item-heading': ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/blockquote' {
    export const BlockquoteUI: {
        blockquote: ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/callout' {
    export const CalloutUI: {
        callout: ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/carousel' {
    export const CarouselUI: {
        'carousel-container': ElementRender;
        'carousel-list-item': ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/code' {
    export const CodeUI: {
        code: ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/code-group' {
    export const CodeGroupUI: {
        'code-group-container': ElementRender;
        'code-group-list': ElementRender;
        'code-group-item-heading': ElementRender;
        'code-group-content': ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/divider' {
    export const DividerUI: {
        divider: ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/embed' {
    export const EmbedUI: {
        embed: ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/file' {
    export const FileUI: {
        file: ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/headings' {
    export const HeadingsUI: {
        HeadingOne: {
            'heading-one': ElementRender;
        };
        HeadingTwo: {
            'heading-two': ElementRender;
        };
        HeadingThree: {
            'heading-three': ElementRender;
        };
    };
}

declare module '@yoopta/themes-shadcn/image' {
    export const ImageUI: {
        image: ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/link' {
    export const LinkUI: {
        link: ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/lists' {
    export const ListsUI: {
        BulletedList: {
            'bulleted-list': ElementRender;
        };
        NumberedList: {
            'numbered-list': ElementRender;
        };
        TodoList: {
            'todo-list': ElementRender;
        };
    };
}

declare module '@yoopta/themes-shadcn/mention' {
    export const MentionUI: ElementMap;
    export const MentionDropdown: React.FC<any>;
}

declare module '@yoopta/themes-shadcn/paragraph' {
    export const ParagraphUI: {
        paragraph: ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/steps' {
    export const StepsUI: {
        'step-container': ElementRender;
        'step-list': ElementRender;
        'step-list-item': ElementRender;
        'step-list-item-heading': ElementRender;
        'step-list-item-content': ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/table' {
    export const TableUI: {
        table: ElementRender;
        'table-row': ElementRender;
        'table-data-cell': ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/table-of-contents' {
    export const TableOfContentsUI: ElementMap;
}

declare module '@yoopta/themes-shadcn/tabs' {
    export const TabsUI: {
        'tabs-container': ElementRender;
        'tabs-list': ElementRender;
        'tabs-item-heading': ElementRender;
        'tabs-item-content': ElementRender;
    };
}

declare module '@yoopta/themes-shadcn/video' {
    export const VideoUI: {
        video: ElementRender;
    };
}
