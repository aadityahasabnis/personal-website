# Form System Usage

This form layer is config-driven and built for server-action-first flows.

## 1) ActionForm (recommended)

Use `ActionForm` when you want built-in `useFormOperations` state tracking plus `useAction` submission.

```tsx
'use client';

import { ActionForm, type IFieldConfig } from '@/components/form';
import type { IFormData } from '@/components/form/form';
import { createArticle } from '@/server/new/admin/content/createArticle';

interface IArticleForm extends IFormData {
    title: string;
    summary: string;
    category: string;
    published: boolean;
    body: string;
}

const fields: Array<IFieldConfig<IArticleForm>> = [
    {
        fieldtype: 'input',
        name: 'title',
        label: 'Title',
        placeholder: 'Post title',
        required: true,
        colsize: 3,
    },
    {
        fieldtype: 'select',
        name: 'category',
        label: 'Category',
        placeholder: 'Pick category',
        colsize: 3,
        options: [
            { label: 'Engineering', value: 'engineering' },
            { label: 'Writing', value: 'writing' },
        ],
    },
    {
        fieldtype: 'textArea',
        name: 'summary',
        label: 'Summary',
        rows: 4,
        colsize: 'full',
    },
    {
        fieldtype: 'authorly',
        name: 'body',
        label: 'Content',
        minHeight: '560px',
        colsize: 'full',
    },
    {
        fieldtype: 'toggle',
        name: 'published',
        label: 'Publish immediately',
        colsize: 2,
    },
];

export default function ArticleCreateForm() {
    return (
        <ActionForm<IArticleForm, { id: string }>
            action={createArticle}
            initialData={{
                title: '',
                summary: '',
                category: '',
                published: false,
                body: '',
            }}
            fields={fields}
            submitLabel='Create Article'
            cancelLabel='Reset'
            onSuccess={() => {
                // toast / route push
            }}
            onError={({ message }) => {
                // toast error
                console.error(message);
            }}
        />
    );
}
```

## 2) Dynamic Field Config

Pass a function to `fields` when form config depends on current values.

```tsx
fields={(formData) => [
    {
        fieldtype: 'input',
        name: 'title',
        label: 'Title',
        colsize: 3,
    },
    {
        fieldtype: 'input',
        name: 'canonicalUrl',
        label: 'Canonical URL',
        hidden: !formData?.isCanonical,
        colsize: 3,
    },
]}
```

## 3) Supported fieldtype values

- `input`
- `textArea`
- `select`
- `checkbox`
- `toggle`
- `authorly` (RichTextEditor field)
- `divider`
- `group`

## 4) Manual mode (FormWrapper)

If you need complete submission control, use `FormWrapper` directly with your own submit handler and `useFormOperations`.
