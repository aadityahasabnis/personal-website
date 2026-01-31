---
description: Deploy to staging or production on Vercel
---

# Deploy Workflow

Deploy AadityaHasabnis.site to Vercel.

## Prerequisites

- Vercel account linked to the repository
- Environment variables configured in Vercel dashboard
- Main branch protected with CI checks

## Automatic Deployments

### Preview Deployments (PRs)
Every pull request automatically creates a preview deployment.

### Production Deployments (main)
Every push to `main` automatically deploys to production.

## Manual Deployment Steps

### 1. Verify Local Build

// turbo
```bash
pnpm build
```

### 2. Run Tests

// turbo
```bash
pnpm test
```

### 3. Push to Main

```bash
git push origin main
```

### 4. Monitor Deployment

Check [Vercel Dashboard](https://vercel.com/dashboard) for:
- Build logs
- Deployment status
- Function logs

### 5. Verify Production

- Visit production URL
- Check key pages load correctly
- Verify Core Web Vitals

## Environment Variables (Vercel)

Required in Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `AUTH_SECRET` | Session encryption secret |
| `REVALIDATE_SECRET` | ISR revalidation secret |
| `CLOUDINARY_URL` | Image hosting (if used) |

## Rollback

If issues are found:

```bash
vercel rollback
```

Or redeploy a specific commit:

```bash
vercel --prod --git-commit=<sha>
```

## Post-Deploy Checklist

- [ ] Home page loads
- [ ] Articles list loads
- [ ] Individual article pages work
- [ ] Admin login works
- [ ] Analytics recording
- [ ] No console errors
