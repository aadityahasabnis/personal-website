# Scaffold Agent (SCAFFOLD)

> **Role:** Agentic – Runs automatically  
> **Purpose:** Initialize project structure, dependencies, and configuration files

---

## Overview

The Scaffold Agent creates the initial project skeleton. It sets up the Next.js project, installs dependencies, creates the folder structure, and configures all tooling (TypeScript, ESLint, Tailwind, etc.).

---

## Responsibilities

### 1. Project Initialization
- Create Next.js 16 project with App Router
- Configure TypeScript strict mode
- Set up Tailwind CSS 4

### 2. Folder Structure
- Create all directories as per `PROJECT_STRUCTURE.md`
- Set up route groups `(public)` and `(admin)`
- Create placeholder files

### 3. Dependencies
- Install production dependencies
- Install dev dependencies
- Configure package.json scripts

### 4. Configuration
- Set up `tsconfig.json` with strict settings
- Create `eslint.config.mjs`
- Configure `tailwind.config.ts`
- Set up `next.config.ts`

---

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `PROJECT_STRUCTURE.md` | Docs | Required folder structure |
| `ESLINT_RECOMMENDATIONS.md` | Docs | ESLint configuration |
| `package.json` template | Reference | Dependencies list |

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| Project skeleton | Directory | Complete folder structure |
| Config files | Various | TS, ESLint, Tailwind, Next configs |
| `package.json` | JSON | Dependencies and scripts |
| Base components | TSX | Button, Card, Input primitives |

---

## Workflow

```
1. CREATE project
   npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --turbopack

2. CONFIGURE TypeScript
   - Update tsconfig.json with strict settings
   - Add path aliases (@/*)
   - Enable noUncheckedIndexedAccess

3. CONFIGURE ESLint
   - Install plugins (import, jsx-a11y, tailwindcss)
   - Create eslint.config.mjs
   - Set up import ordering

4. CONFIGURE Tailwind
   - Set up CSS variables
   - Configure typography plugin
   - Add animate plugin

5. CREATE folder structure
   src/
   ├── app/(public)/
   ├── app/(admin)/
   ├── components/ui/
   ├── lib/
   ├── server/
   ├── hooks/
   ├── interfaces/
   └── constants/

6. CREATE base components
   - Button, Card, Input, Badge
   - Basic layout components

7. VALIDATE
   - Run type-check
   - Run lint
   - Run build
```

---

## Script: scaffold.js

```javascript
#!/usr/bin/env node
/**
 * Scaffold Agent Script
 * Creates the project structure and initial configuration
 */

import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const SRC = './src';

// Folder structure
const FOLDERS = [
    'app/(public)',
    'app/(admin)/admin',
    'app/api',
    'components/ui',
    'components/content',
    'components/interactive',
    'components/layout',
    'components/admin',
    'lib/db',
    'lib/markdown',
    'lib/auth',
    'server/actions',
    'server/queries',
    'hooks',
    'interfaces',
    'constants',
    'types'
];

// Create folders
FOLDERS.forEach(folder => {
    mkdirSync(join(SRC, folder), { recursive: true });
    console.log(`✓ Created ${folder}`);
});

// Create placeholder files
const PLACEHOLDERS = [
    'lib/utils.ts',
    'interfaces/content.ts',
    'interfaces/stats.ts',
    'constants/siteConfig.ts'
];

PLACEHOLDERS.forEach(file => {
    writeFileSync(join(SRC, file), '// TODO: Implement\n');
    console.log(`✓ Created ${file}`);
});

console.log('\n✅ Scaffold complete!');
```

---

## Dependencies to Install

### Production
```bash
pnpm add react react-dom next
pnpm add @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-tooltip
pnpm add class-variance-authority clsx tailwind-merge
pnpm add mongodb
pnpm add remark remark-gfm remark-html rehype-highlight
```

### Development
```bash
pnpm add -D typescript @types/react @types/node
pnpm add -D eslint @eslint/js typescript-eslint
pnpm add -D eslint-plugin-react eslint-plugin-react-hooks
pnpm add -D eslint-plugin-import eslint-plugin-jsx-a11y
pnpm add -D eslint-plugin-tailwindcss @next/eslint-plugin-next
pnpm add -D tailwindcss postcss autoprefixer
pnpm add -D @tailwindcss/typography tailwindcss-animate
```

---

## Commands

```bash
# Run scaffold agent
node scripts/scaffold.js

# Verify scaffold
pnpm type-check && pnpm lint && pnpm build
```

---

## Files Created

### Configuration
- `tsconfig.json`
- `eslint.config.mjs`
- `tailwind.config.ts`
- `next.config.ts`
- `postcss.config.mjs`

### Source
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/lib/utils.ts`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`

---

## Success Criteria

- [ ] `pnpm dev` runs without errors
- [ ] `pnpm type-check` passes
- [ ] `pnpm lint` passes with 0 warnings
- [ ] `pnpm build` completes successfully
- [ ] All folders exist as per structure
- [ ] Path aliases work (`@/` imports)

---

*Agent Version: 1.0*  
*Project: AadityaHasabnis.site*
