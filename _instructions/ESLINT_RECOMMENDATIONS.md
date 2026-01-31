# ESLint Rules Recommendations for AadityaHasabnis.site

## Executive Summary
Comprehensive ESLint configuration for a content-first personal portfolio built with Next.js 16, React 19, and TypeScript.

---

## Installation Required

```bash
pnpm add -D eslint @eslint/js typescript-eslint
pnpm add -D eslint-plugin-react eslint-plugin-react-hooks
pnpm add -D eslint-plugin-import eslint-plugin-jsx-a11y
pnpm add -D eslint-plugin-tailwindcss
pnpm add -D @next/eslint-plugin-next
```

---

## ESLint Configuration (eslint.config.mjs)

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import pluginImport from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tailwindcss from 'eslint-plugin-tailwindcss';
import nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname
            }
        }
    },
    {
        plugins: {
            react,
            'react-hooks': reactHooks,
            import: pluginImport,
            'jsx-a11y': jsxA11y,
            tailwindcss,
            '@next/next': nextPlugin
        },
        
        rules: {
            // ========================================
            // PHASE 1: CRITICAL (Immediate)
            // ========================================
            
            // Console & Debugging
            'no-console': ['error', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
            
            // TypeScript Strict
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/explicit-function-return-type': ['error', {
                allowExpressions: true,
                allowTypedFunctionExpressions: true
            }],
            '@typescript-eslint/consistent-type-imports': ['error', {
                prefer: 'type-imports'
            }],
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            
            // React
            'react/jsx-key': ['error', { checkFragmentShorthand: true }],
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error',
            
            // ========================================
            // PHASE 2: HIGH PRIORITY
            // ========================================
            
            // Import Organization
            'import/order': ['error', {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    ['parent', 'sibling'],
                    'index'
                ],
                pathGroups: [
                    { pattern: 'react', group: 'builtin', position: 'before' },
                    { pattern: 'next/**', group: 'builtin', position: 'after' },
                    { pattern: '@/**', group: 'internal' }
                ],
                'newlines-between': 'always',
                alphabetize: { order: 'asc', caseInsensitive: true }
            }],
            'import/no-duplicates': 'error',
            
            // Tailwind CSS
            'tailwindcss/classnames-order': 'warn',
            'tailwindcss/no-contradicting-classname': 'error',
            'tailwindcss/enforces-shorthand': 'warn',
            
            // ========================================
            // PHASE 3: MEDIUM PRIORITY
            // ========================================
            
            // Type Safety
            '@typescript-eslint/no-unsafe-assignment': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            
            // Complexity
            'complexity': ['error', 15],
            'max-depth': ['error', 4],
            'max-lines-per-function': ['warn', { 
                max: 100, 
                skipBlankLines: true, 
                skipComments: true 
            }],
            
            // ========================================
            // PHASE 4: POLISH
            // ========================================
            
            // Accessibility
            'jsx-a11y/alt-text': 'error',
            'jsx-a11y/anchor-is-valid': 'error',
            
            // Security
            'no-eval': 'error',
            'react/no-danger': 'warn',
            
            // Next.js
            '@next/next/no-img-element': 'error',
            '@next/next/no-html-link-for-pages': 'error'
        }
    },
    {
        // Apply to specific file patterns
        files: ['**/*.tsx'],
        rules: {
            // React component specific rules
            'react/jsx-pascal-case': 'error'
        }
    },
    {
        // Ignore patterns
        ignores: [
            '.next/**',
            'node_modules/**',
            '*.config.*'
        ]
    }
);
```

---

## TypeScript Configuration (tsconfig.json)

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "lib": ["dom", "dom.iterable", "ES2022"],
        "allowJs": true,
        "skipLibCheck": true,
        "strict": true,
        "noEmit": true,
        "esModuleInterop": true,
        "module": "ESNext",
        "moduleResolution": "bundler",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "jsx": "preserve",
        "incremental": true,
        "plugins": [{ "name": "next" }],
        "noUncheckedIndexedAccess": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "exactOptionalPropertyTypes": true,
        "paths": {
            "@/*": ["./src/*"]
        }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
}
```

---

## Critical Issues & Fixes

### 1. No `any` Types

❌ **BAD:**
```typescript
const data: any = await fetch(...);
```

✅ **GOOD:**
```typescript
interface IApiResponse {
    success: boolean;
    data: IArticle[];
}
const response: IApiResponse = await fetch(...);
```

### 2. Explicit Return Types

❌ **BAD:**
```typescript
export const getArticle = async (slug: string) => {
    // ...
};
```

✅ **GOOD:**
```typescript
export const getArticle = async (slug: string): Promise<IArticle | null> => {
    // ...
};
```

### 3. Type Imports

❌ **BAD:**
```typescript
import { IArticle } from '@/interfaces/content';
```

✅ **GOOD:**
```typescript
import { type IArticle } from '@/interfaces/content';
```

### 4. Console Statements

❌ **BAD:**
```typescript
console.log('Debug:', data);
```

✅ **GOOD:**
```typescript
// Remove or use proper logging
if (process.env.NODE_ENV === 'development') {
    console.info('Debug:', data);
}
```

### 5. Server Actions

❌ **BAD:**
```typescript
export const likePost = async (slug: string) => {
    // Missing 'use server' directive
};
```

✅ **GOOD:**
```typescript
'use server';

export const likePost = async (slug: string): Promise<number> => {
    // ...
};
```

---

## Tailwind CSS Best Practices

### Class Ordering (Automatic with Plugin)

```tsx
// ✅ Ordered by plugin
<div className="flex items-center justify-between gap-4 p-6 bg-white rounded-lg shadow-md">

// ❌ Unordered (plugin will fix)
<div className="p-6 flex shadow-md bg-white justify-between rounded-lg items-center gap-4">
```

### Use Shorthand Classes

```tsx
// ✅ Shorthand
<div className="size-10 inset-0">  // size = width + height, inset = top/right/bottom/left

// ❌ Verbose
<div className="h-10 w-10 top-0 right-0 bottom-0 left-0">
```

### Avoid Arbitrary Values

```tsx
// ✅ Use design tokens
<div className="p-4 text-sm text-gray-600">

// ❌ Avoid arbitrary values
<div className="p-[17px] text-[13px] text-[#666]">
```

---

## Migration Strategy

### Week 1: Foundation
1. Install all ESLint plugins
2. Enable strict TypeScript
3. Fix all `any` types
4. Add explicit return types

### Week 2: Import & Style
1. Enable import ordering
2. Enable Tailwind plugin
3. Fix class ordering issues
4. Resolve duplicate imports

### Week 3: Quality
1. Enable complexity rules
2. Fix high-complexity functions
3. Add accessibility rules
4. Final cleanup

---

## Success Metrics

- ✅ Zero ESLint errors
- ✅ Zero TypeScript errors
- ✅ No `any` types in codebase
- ✅ No `console.log` in production
- ✅ < 5 warnings per 1000 LOC
- ✅ 100% accessibility compliance

---

## Package.json Scripts

```json
{
    "scripts": {
        "dev": "next dev --turbopack",
        "build": "next build",
        "start": "next start",
        "lint": "eslint . --max-warnings 0",
        "lint:fix": "eslint . --fix",
        "type-check": "tsc --noEmit",
        "check": "pnpm lint && pnpm type-check"
    }
}
```

---

*Generated: 2026-01-31*  
*Project: AadityaHasabnis.site*
