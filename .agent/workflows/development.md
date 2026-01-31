---
description: Start development server and run the project locally
---

# Development Workflow

Start the local development environment for AadityaHasabnis.site.

## Prerequisites

- Node.js 22+
- pnpm 9+
- MongoDB connection string in `.env.local`

## Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `MONGODB_URI` - MongoDB connection string
- `AUTH_SECRET` - Secret for session encryption
- `REVALIDATE_SECRET` - Secret for on-demand revalidation

### 3. Start Development Server

// turbo
```bash
pnpm dev
```

The site will be available at `http://localhost:3000`

### 4. Run Type Checking (Optional)

In a separate terminal:

```bash
pnpm type-check --watch
```

### 5. Run Linting (Optional)

```bash
pnpm lint
```

## Common Issues

### MongoDB Connection Failed
- Verify your `MONGODB_URI` is correct
- Check if your IP is whitelisted in MongoDB Atlas

### Port Already in Use
- Kill the process using port 3000
- Or use `pnpm dev -- -p 3001` for a different port
