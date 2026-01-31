---
description: Build the production bundle and verify output
---

# Build Workflow

Build and verify the production bundle for AadityaHasabnis.site.

## Steps

### 1. Run Pre-build Checks

// turbo
```bash
pnpm type-check
```

// turbo
```bash
pnpm lint
```

### 2. Build Production Bundle

// turbo
```bash
pnpm build
```

This will:
- Compile TypeScript
- Generate static pages
- Optimize assets
- Create `.next/` output

### 3. Verify Build Output

Check for:
- No TypeScript errors
- No ESLint warnings
- Successful page generation
- Bundle size within limits

### 4. Test Production Build Locally

// turbo
```bash
pnpm start
```

Visit `http://localhost:3000` to verify the production build.

### 5. Analyze Bundle Size (Optional)

```bash
ANALYZE=true pnpm build
```

## Success Criteria

- [ ] Type check passes
- [ ] Lint passes with 0 warnings
- [ ] Build completes without errors
- [ ] All pages generated successfully
- [ ] Bundle size < 100KB first load

## Troubleshooting

### Build Errors
- Check types: `pnpm type-check`
- Check lint: `pnpm lint --fix`
- Verify env variables are set

### Missing Static Params
- Ensure `generateStaticParams()` returns all slugs
- Check database connection
