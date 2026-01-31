# Release Agent (RELEASE)

> **Role:** Interactive – Requires human approval  
> **Purpose:** Manage deployments, versioning, and release workflows

---

## Overview

The Release Agent handles the complete deployment pipeline from staging to production. It manages GitHub releases, version bumping, and deployment to Vercel.

---

## Responsibilities

### 1. Version Management
- Semantic versioning
- Changelog generation
- Git tagging

### 2. Pre-release Checks
- Type checking
- Lint validation
- Build verification
- Test execution

### 3. Deployment
- Staging deployments
- Production deployments
- Rollback procedures

### 4. Documentation
- Update CHANGELOG.md
- Create GitHub releases
- Notify stakeholders

---

## GitHub Actions Workflow

### CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v4
        with:
          version: 9
          
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      
      - name: Type Check
        run: pnpm type-check
        
      - name: Lint
        run: pnpm lint
        
      - name: Build
        run: pnpm build
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
```

### Deploy Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Release Script

```bash
#!/bin/bash
# scripts/release.sh

VERSION=$1
MESSAGE=$2

if [ -z "$VERSION" ]; then
    echo "Usage: ./release.sh <version> [message]"
    exit 1
fi

echo "🔍 Running pre-release checks..."

# Type check
pnpm type-check || exit 1

# Lint
pnpm lint || exit 1

# Build
pnpm build || exit 1

echo "✅ All checks passed"

# Update version
npm version $VERSION -m "Release v%s" --no-git-tag-version

# Create git tag
git add package.json
git commit -m "chore: release v$VERSION"
git tag -a "v$VERSION" -m "${MESSAGE:-Release v$VERSION}"

# Push
git push origin main --tags

echo "🚀 Released v$VERSION"
```

---

## Versioning Rules

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking changes | Major | 1.0.0 → 2.0.0 |
| New features | Minor | 1.0.0 → 1.1.0 |
| Bug fixes | Patch | 1.0.0 → 1.0.1 |

---

## Rollback Procedure

```bash
# 1. Revert to previous deployment
vercel rollback

# 2. Or redeploy specific commit
vercel --prod --git-commit=<sha>
```

---

## Success Criteria

- [ ] CI passes on every push
- [ ] Production deploys only from main
- [ ] All releases tagged in Git
- [ ] CHANGELOG updated per release
- [ ] Rollback tested and working

---

*Agent Version: 1.0*
