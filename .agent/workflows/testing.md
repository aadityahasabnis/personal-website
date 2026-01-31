---
description: Run tests and verify code quality
---

# Testing Workflow

Run the test suite for AadityaHasabnis.site.

## Test Types

| Type | Tool | Location |
|------|------|----------|
| Unit | Vitest | `src/**/*.test.ts` |
| Component | Vitest + RTL | `src/components/**/*.test.tsx` |
| E2E | Playwright | `tests/e2e/*.spec.ts` |

## Steps

### 1. Run All Tests

// turbo
```bash
pnpm test
```

### 2. Run Tests in Watch Mode (Development)

```bash
pnpm test:watch
```

Tests re-run on file changes.

### 3. Run with Coverage

// turbo
```bash
pnpm test:coverage
```

Coverage report generated in `coverage/` directory.

### 4. Run E2E Tests

First, ensure the dev server is running:

```bash
pnpm dev
```

Then run E2E tests:

// turbo
```bash
pnpm test:e2e
```

### 5. Run E2E in Headed Mode (Debug)

```bash
pnpm test:e2e:headed
```

Browser opens for visual debugging.

## Writing Tests

### Component Test Example

```typescript
// src/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './button';

describe('Button', () => {
    it('renders children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });
});
```

### Server Action Test Example

```typescript
// src/server/actions/like.test.ts
import { describe, it, expect, vi } from 'vitest';
import { likePost } from './like';

describe('likePost', () => {
    it('increments like count', async () => {
        // Mock database
        const result = await likePost('test-slug');
        expect(result).toBeGreaterThan(0);
    });
});
```

## Test Commands Summary

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all unit tests |
| `pnpm test:watch` | Watch mode |
| `pnpm test:coverage` | With coverage report |
| `pnpm test:e2e` | Run Playwright tests |
| `pnpm test:e2e:headed` | E2E with browser UI |

## Success Criteria

- [ ] All tests pass
- [ ] Coverage > 80%
- [ ] No flaky tests
- [ ] E2E covers critical paths
