# Personal website — AadityaHasabnis.site

**Version:** 1.0

**Purpose:** A single-author, production-ready playbook of autonomous and semi-autonomous agents (scripts, CLI helpers, GitHub Actions, and developer roles) to build, ship, and operate `aadityahasabnis.site` — a fast, minimal, SEO-first personal knowledge & presence system powered by Next.js 16 (App Router) and MongoDB. The playbook emphasizes: static-first content, ISR, Partial Prerendering for dynamic islands, server-side counters (views/likes), and a lightweight admin with a markdown editor for initial content.

---

# Table of contents

1. Project summary & vision
2. High-level architecture
3. Content model & MongoDB schemas
4. Rendering rules & performance strategy
5. Admin panel: UX and flows
6. Agents — roles, scripts, and outputs (detailed)
7. Agent orchestration & CI integration
8. Implementation checklist & milestones
9. PR / issue / commit conventions for agents
10. Acceptance criteria & QA
11. Appendix: code patterns (Views component, Like Server Action), DB indices, and revalidation strategies

---

# 1. Project summary & vision

**Product name:** AadityaHasabnis.site — Personal Knowledge & Presence System

**Vision:** A minimal, professional personal site where Aaditya publishes long-form articles, series, timeless pages, atomic knowledge notes, and learning logs. Content is static-first for instant load and SEO; small dynamic islands (views, likes, recommendations) are served as server-side streamed components. The admin is a controlled editor (markdown now, richer editor later) backed by MongoDB.

**Primary goals:**

* Instant, SEO-friendly pages (static HTML + CDN)
* Owned content & data (no external CMS)
* Small, maintainable admin for authoring & publishing
* Clear automation (agents) to scaffold, test, and publish reliably

**Target audience:** Everyone — recruiters, technical readers, non-technical readers, search engines, future self.

---

# 2. High-level architecture

**Stack**

* Next.js 16 (App Router) — server components, streaming, server actions
* MongoDB (Atlas or self-managed) — primary data store
* Vercel (recommended) or any platform with CDN + edge caching
* Tailwind CSS (design tokens)
* Optional: Redis for ephemeral deduplication (views) and short TTL caches

**Traffic flow (public page)**

1. Build / revalidate generates HTML from content in MongoDB → CDN caches
2. User requests a page → CDN serves cached static HTML instantly
3. Small server components (views, likes) stream into the already-painted HTML via Suspense boundaries
4. JS hydrates after paint for interactive elements (like button optimistic updates)

**Key principles**

* Content first: article body, headings, and meta are static server-rendered HTML
* Dynamic enhancements are streamed server-side (not client fetch)
* Admin panel is behind auth and isolated from public performance surface

---

# 3. Content model & MongoDB schemas

Everything is a `Content` document with specialization. The admin UI operates over these types.

## Document: content (common fields)

```ts
interface Content {
  _id: ObjectId;
  type: 'article' | 'series' | 'page' | 'note' | 'log';
  slug: string;               // unique path segment
  title: string;
  description?: string;       // meta description
  body: string;               // markdown / mdx canonical source
  html?: string;              // pre-rendered HTML (cached optional)
  author?: string;
  tags?: string[];
  seriesId?: ObjectId;        // optional
  published: boolean;
  publishedAt?: Date;
  updatedAt?: Date;
  createdAt: Date;
  canonicalUrl?: string;
  readingTime?: number;       // minutes
  seo: {
    title?: string;
    description?: string;
    image?: string; // URL
    structuredData?: object;
  };
}
```

## Collection: pageStats

```ts
interface PageStats {
  _id: ObjectId;
  slug: string;      // references content.slug
  views: number;
  likes: number;
  lastViewedAt?: Date;
}
```

## Collection: users (admin)

```ts
interface User {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash?: string; // or oauth tokens
  role: 'owner' | 'editor';
  createdAt: Date;
}
```

## Collection: subscribers, contacts

* `subscribers` — email, name, subscribedAt, confirmed
* `contacts` — name, email, type, message, attachments, createdAt

**Indexes**

* `content.slug` (unique)
* `content.type + content.publishedAt` (for feeds)
* `pageStats.slug` (unique)

**Notes**

* Store canonical markdown in `body`.
* Optionally precompute `html` server-side to avoid markdown render work during revalidation.

---

# 4. Rendering rules & performance strategy

## Rules (immutable)

1. Public content pages (articles, series, pages, notes, logs) are served as **Static + ISR**.
2. `revalidate` is set per content type; articles default to `revalidate = 3600` (1 hour) or `on-demand` revalidation on publish.
3. Views/likes live in server components; they stream via Suspense and must never block the main HTML.
4. No client `fetch()` for primary content. Only server actions or tiny client events for likes.
5. Admin routes are server-rendered and may access DB synchronously; they are protected and excluded from CDN caching.

## Revalidation strategy

* Publishing event → trigger on-demand revalidation for affected slugs (via Vercel / Next API route that calls `res.revalidate` or equivalent).
* Scheduled revalidation: nightly link-check / health build.

## Caching

* Content: long TTL on CDN (immutable until revalidated)
* PageStats (views/likes): short TTL if caching is used (but server components should show live data by default)

## Partial Prerendering usage

* Use Suspense around `Views` and `RelatedPosts` components. Core body + metadata is rendered and delivered instantly.

---

# 5. Admin panel — UX & flows

**Admin features (MVP)**

* Auth (owner-only login)
* Content list (filter by type, draft/published)
* Content editor: markdown editor with live preview (split view)
* Series management (create/edit series)
* Publish / unpublish / schedule
* Upload assets (images) — Cloudinary or S3 (signed uploads)
* Site config page (home featured slug, hero text)
* Subscriber list & export
* Quick preview → opens preview URL (staging)

**Editor notes**

* For now, markdown is used.
* Store markdown in `body` and precompute `html` on publish.
* Editor saves drafts as `published=false`.

**Security**

* Protect `/admin` with secure session cookie and 2FA option (later).
* Rate-limit public-facing submission endpoints.

---

# 6. Agents — Roles, scripts, and outputs

This section lists agents (automations / responsibilities) that produce repeatable artifacts. Each agent is intentionally narrow. Agents communicate by producing files, branches, PRs, or issues. Human-in-the-loop required for merges.

## Agent conventions

* Each agent produces: **artifact** (files), **PR** (branch + description), **issue** (if needed), and a **changelog entry**.
* Agent outputs must include test stubs and a human-readable acceptance criteria section.
* Agents are implemented as scripts (Node.js CLI) or GitHub Actions workflows.

---

## 6.1 Planner Agent (`planner-agent`)

**Purpose:** Convert product requirements into a prioritized backlog, sprint plan, and GitHub issues.

**Inputs:** current `agents.md`, project vision, content inventory (provided by owner).

**Outputs:**

* `issues/` — a set of GitHub issue markdown files (one per task) with labels: `mvp`, `frontend`, `backend`, `devops`, `seo`.
* `sprint-plan.md` — 2-week milestone plan with acceptance criteria.

**Script behavior:**

* Read `content-inventory.json` (owner-provided list of slugs/titles)
* Output `issues/*.md` with templates for tasks

**PR template:** "chore: add initial sprint plan and backlog"

**Acceptance Criteria:**

* Issues present for homepage, projects, admin, articles, series, views/likes, revalidation.

---

## 6.2 Scaffolder Agent (`scaffold-agent`)

**Purpose:** Create initial repository skeleton (Next.js + TypeScript + Tailwind) and base pages + CI.

**Inputs:** tech stack config

**Outputs:**

* `src/` skeleton (app, components, lib)
* `package.json`, `tsconfig.json`, `tailwind.config.js`
* Basic `home` page, `articles/[slug]` route, `admin` route stub
* GitHub Actions workflow: `ci.yml` (lint/test/build)

**Command:** `node scripts/scaffold.js --name aadityahasabnis-site`

**PR template:** "chore: scaffold project skeleton"

**Acceptance Criteria:** `pnpm dev` runs locally and `ci.yml` passes on PR.

---

## 6.3 Frontend Dev Agent (`frontend-agent`)

**Purpose:** Generate production-ready components, layout, and article page using Server Components and Suspense.

**Inputs:** design tokens, content model

**Outputs:**

* `src/components/Layout.tsx`
* `src/components/Article.tsx` (Server Component reading pre-rendered HTML)
* `src/components/Views.server.tsx` (server component) — see Appendix
* `src/components/Like.client.tsx` (client component: uses server action)
* Accessibility checklist

**Behavior:**

* Produce clean, typed TSX components
* Add Storybook stories (optional)

**Acceptance Criteria:** Article pages render static content and stream views.

---

## 6.4 Backend Dev Agent (`backend-agent`)

**Purpose:** Create DB models, server utilities, and server actions for likes and admin auth.

**Inputs:** content schema, DB connection string

**Outputs:**

* `src/lib/db.ts` (Mongo client singleton)
* Mongoose or typed ODM schemas
* `src/lib/pageStats.ts` with atomic `$inc` helpers
* Server action snippets for like handling

**Acceptance Criteria:** Server actions update pageStats atomically.

---

## 6.5 Admin Agent (`admin-agent`)

**Purpose:** Build the admin UX for creating and publishing content with markdown editor + preview.

**Inputs:** content schema

**Outputs:**

* `src/app/admin/(routes)` pages
* Editor component (markdown + preview)
* Image uploader
* On publish: call `onDemandRevalidate(slug)` util

**Acceptance Criteria:** Author can create, preview, and publish content; publishing triggers revalidation.

---

## 6.6 Content Agent (`content-agent`)

**Purpose:** Assist with drafting content: generate outline, meta tags, and internal links from bullet notes.

**Inputs:** bullet notes or rough draft

**Outputs:**

* MD file draft under `content/drafts/slug.md`
* Suggested SEO title, meta description, canonical
* Suggested series mapping and internal link suggestions

**Implementation:** Small CLI wrapping an LLM (optional) to expand notes into MD.

**Acceptance Criteria:** Draft created; owner can edit and publish.

---

## 6.7 SEO Agent (`seo-agent`)

**Purpose:** Audit pages and generate prioritized SEO fixes and OG images.

**Inputs:** deployed site URL or local build

**Outputs:**

* `seo-report.md` with top 10 issues and fixes
* `sitemap.xml` generator
* OG image generator assets

**Automation:** run weekly; create issues for critical fixes.

---

## 6.8 DevOps / Release Agent (`release-agent`)

**Purpose:** Manage CI/CD, deploy previews, run on-demand revalidation, and manage environment variables.

**Inputs:** repo, hosting provider creds (secure)

**Outputs:**

* GitHub actions for PR previews
* `deploy.yml` for main branch
* `revalidate` webhook util (server action) to call platform revalidation

**Acceptance Criteria:** PRs produce previews; publishing content triggers revalidation.

---

## 6.9 Analytics & Growth Agent (`analytics-agent`)

**Purpose:** Instrument events and create a lightweight analytics dashboard based on events & pageStats.

**Inputs:** tracking plan

**Outputs:**

* `lib/analytics.ts` with event definitions
* `admin/analytics` admin page (simple charts)
* Weekly summary PR or email (optional)

**Notes:** Use privacy-first analytics (Plausible / PostHog / self-hosted) or log lightweight events to DB.

---

## 6.10 QA & Test Agent (`test-agent`)

**Purpose:** Generate test stubs (Vitest + Playwright) and run accessibility checks.

**Inputs:** components and pages

**Outputs:**

* Unit test stubs for key components
* Playwright E2E test for article page render + views/like flows
* Accessibility report (axe)

**Acceptance Criteria:** Basic unit tests pass in CI; E2E test ensures static content is present and likes work.

---

## 6.11 Performance & Security Agent (`perf-sec-agent`)

**Purpose:** Audit Core Web Vitals & basic security checks (CSP, rate limit).

**Outputs:**

* Perf report with suggestions (font loading, image sizes)
* Security checklist

**Automation:** run on PR or nightly.

---

# 7. Agent orchestration & CI integration

**How agents run**

* Local CLI: `node scripts/<agent>.js` for Planner, Scaffolder, Content Agent
* GitHub Actions: run `scaffold-agent` on initial repo creation, `test-agent` on PRs, `seo-agent` weekly.
* Publishing flow: Admin UI triggers `release-agent` revalidation; `analytics-agent` logs event to DB.

**Conventions for PRs created by agents**

* Branch prefix: `agent/<agent-name>/<short-desc>`
* PR title: `[agent/<name>] <short summary>`
* Body: include generated artifacts and acceptance criteria
* Add reviewers: owner

---

# 8. Implementation checklist & milestones

**Phase 0:** Repo & scaffold (scaffold-agent)

* `src/` skeleton, CI, ESLint, Prettier
* Basic homepage, article route render

**Phase 1 (MVP):** Content + Admin

* MongoDB models
* Markdown editor + preview
* Publish flow + on-demand revalidate
* Static article pages with ISR
* Views server component + likes server action

**Phase 2:** Polish & Analytics

* SEO agent run, OG images
* Analytics dashboard
* Tests and accessibility audits

**Phase 3:** Growth & Automation

* Content Agent for drafts
* Scheduled SEO audits
* Performance optimizations

---

# 9. PR / issue / commit conventions for agents

**Commit messages:**

* `feat: <what>` for new product features
* `fix: <what>` for bugs
* `chore: <what>` for agent outputs and infra
* `docs: <what>` for documentation

**Agent PR template** (short)

```
Title: [agent/<name>] <short>

Summary:
- What this agent produced
- Files added
- Acceptance criteria

Testing:
- How to test locally

Notes:
- Manual steps needed
```

---

# 10. Acceptance criteria & QA

**MVP acceptance**

* Article page loads static HTML with content on first paint
* Views counter appears and increments without blocking content
* Like button updates likes using server action
* Author can create/publish content via admin and publishing triggers revalidation
* CI runs lint/test/build on PRs

**Performance targets**

* TTFB < 150ms (on CDN)
* First Contentful Paint < 400ms (typical)

---

# 11. Appendix — code patterns, sample snippets, and utilities

> These are *patterns* to implement in `src/components` & `src/lib`.

## 11.1: Example Server Component (Views) — conceptual

```tsx
// src/components/Views.server.tsx
import { getPageStats } from '@/lib/pageStats';

export default async function Views({ slug }: { slug: string }) {
  // Increment view counter and return current count
  const count = await getPageStats(slug).incrementView();
  return (
    <div className="text-sm text-gray-500" aria-live="polite">{count} views</div>
  );
}
```

**Notes:**

* `getPageStats().incrementView()` should implement deduplication (session/IP) and atomic `$inc`.
* This component runs on server and streams into the page; wrap it in `<Suspense fallback={null}>`.

## 11.2: Example Like (Server Action + Client button) — conceptual

```tsx
// src/app/articles/[slug]/LikeButton.client.tsx
'use client'
import { useState } from 'react';

export default function LikeButton({ slug, initial }: { slug:string, initial:number }){
  const [count, setCount] = useState(initial);
  async function handleLike(){
    // call server action
    const newCount = await fetch(`/api/like/${slug}`, { method: 'POST' }).then(r => r.json());
    setCount(newCount.likes);
  }
  return <button onClick={handleLike} aria-pressed="false">👍 {count}</button>
}
```

Server Action alternative (Next.js App Router Server Action):

```ts
// src/app/actions/like.ts
export async function likePost(slug: string) {
  // update in DB using atomic $inc
}
```

**Important:** The client UI should optimistically update the count. The server action must validate session and enforce rate limiting.

## 11.3: pageStats helper (conceptual)

```ts
async function incrementView(slug: string, sessionId?: string){
  // optionally use Redis to dedupe within 24h
  // atomic update:
  // db.pageStats.updateOne({slug}, {$inc: {views:1}}, {upsert:true})
}
```

## 11.4: Revalidation utility

* `lib/revalidate.ts` exposes `revalidatePath('/articles/slug')` and calls the hosting provider revalidation API or internal Next.js on-demand revalidation API.

---

# Final notes & next actions for the owner

The `agents.md` above is a full playbook to implement `aadityahasabnis.site` the right way: content-first, static-first, with server-streamed dynamic islands for views & likes. It includes agent definitions that turn repetitive work into reproducible scripts and PRs.

**Suggested immediate next steps (pick one):**

* `scaffold-agent` — create the repository skeleton and base routes
* `frontend-agent` — implement the article route with Views server component
* `backend-agent` — implement DB models + pageStats helper + revalidate util

Tell me which immediate step you want me to execute next and I will generate the exact PR content, file list, and code snippets for that step.
