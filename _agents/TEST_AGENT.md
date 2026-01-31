# Test Agent (TEST)

> **Role:** Agentic – Runs automatically  
> **Purpose:** Ensure code quality through automated testing

---

## Overview

The Test Agent manages all testing activities including unit tests, integration tests, and end-to-end tests. It ensures code quality and prevents regressions.

---

## Responsibilities

### 1. Unit Testing
- Component rendering tests
- Hook behavior tests
- Utility function tests

### 2. Integration Testing
- API route tests
- Server action tests
- Database query tests

### 3. E2E Testing
- Critical user flows
- Content publishing flow
- Admin operations

---

## Testing Stack

```bash
# Install testing dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D @playwright/test
pnpm add -D happy-dom
```

---

## Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'happy-dom',
        setupFiles: ['./src/tests/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        coverage: {
            reporter: ['text', 'html'],
            exclude: ['node_modules/', 'src/tests/']
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});
```

---

## Test Examples

### Component Test

```typescript
// src/components/ui/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
    it('renders children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });
    
    it('handles click events', () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Click me</Button>);
        fireEvent.click(screen.getByText('Click me'));
        expect(onClick).toHaveBeenCalledOnce();
    });
    
    it('shows loading state', () => {
        render(<Button isLoading>Submit</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });
    
    it('applies variant classes', () => {
        render(<Button variant="secondary">Secondary</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-secondary');
    });
});
```

### Utility Test

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn, formatDate, slugify } from './utils';

describe('cn', () => {
    it('merges class names', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });
    
    it('handles conditional classes', () => {
        expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible');
    });
    
    it('resolves Tailwind conflicts', () => {
        expect(cn('p-4', 'p-2')).toBe('p-2');
    });
});

describe('slugify', () => {
    it('converts to lowercase', () => {
        expect(slugify('Hello World')).toBe('hello-world');
    });
    
    it('removes special characters', () => {
        expect(slugify('Hello, World!')).toBe('hello-world');
    });
    
    it('handles multiple spaces', () => {
        expect(slugify('hello   world')).toBe('hello-world');
    });
});
```

### Server Action Test

```typescript
// src/server/actions/like.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { likePost } from './like';
import * as db from '@/lib/db/connect';

vi.mock('@/lib/db/connect');

describe('likePost', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    
    it('increments like count', async () => {
        const mockDb = {
            collection: vi.fn().mockReturnValue({
                findOneAndUpdate: vi.fn().mockResolvedValue({ likes: 5 })
            })
        };
        vi.mocked(db.connectDB).mockResolvedValue(mockDb as any);
        
        const result = await likePost('test-article');
        
        expect(result).toBe(5);
        expect(mockDb.collection).toHaveBeenCalledWith('pageStats');
    });
    
    it('creates stats if not exists', async () => {
        const mockFindOneAndUpdate = vi.fn().mockResolvedValue({ likes: 1 });
        const mockDb = {
            collection: vi.fn().mockReturnValue({
                findOneAndUpdate: mockFindOneAndUpdate
            })
        };
        vi.mocked(db.connectDB).mockResolvedValue(mockDb as any);
        
        await likePost('new-article');
        
        expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
            { slug: 'new-article' },
            expect.objectContaining({ $inc: { likes: 1 } }),
            expect.objectContaining({ upsert: true })
        );
    });
});
```

---

## E2E Test (Playwright)

```typescript
// tests/e2e/article.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Article Page', () => {
    test('displays article content', async ({ page }) => {
        await page.goto('/articles/test-article');
        
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('article')).toBeVisible();
    });
    
    test('increments like count', async ({ page }) => {
        await page.goto('/articles/test-article');
        
        const likeButton = page.getByRole('button', { name: /like/i });
        const initialCount = await likeButton.textContent();
        
        await likeButton.click();
        
        await expect(likeButton).toContainText(String(parseInt(initialCount!) + 1));
    });
    
    test('shows related posts', async ({ page }) => {
        await page.goto('/articles/test-article');
        
        await expect(page.getByText(/related/i)).toBeVisible();
    });
});
```

---

## Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E in headed mode
pnpm test:e2e:headed
```

---

## Success Criteria

- [ ] > 80% code coverage
- [ ] All critical paths tested
- [ ] Tests run < 30 seconds
- [ ] E2E covers main flows
- [ ] No flaky tests

---

*Agent Version: 1.0*
