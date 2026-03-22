# Architecture Documentation

## Overview

aadityahasabnis.com is a minimal, professional personal site with a static-first content delivery model, supported by Next.js 16 (App Router) and MongoDB.

## High-Level Architecture

- **Stack:** Next.js 16 (App Router), MongoDB, Vercel (or equivalent), Tailwind CSS.
- **Content Strategy:**
    - Static-first content generation for blogs, articles, and projects (SSG + ISR)
    - Pre-rendered HTML is served via CDN.
    - Dynamic islands (views, likes, comments) via Partial Prerendering and Server Components, utilizing streaming boundaries (Suspense).
- **Backend Model:**
    - One-action-per-file modular Server Actions architecture instead of monolithic API routes.
    - Direct database interaction through Mongoose models.
    - Server actions are secured and validation-enforced before updating MongoDB.

## Data Models

Main entities:

- **Content:** Represents articles, projects, blogs. Stores markdown, pre-rendered HTML, and SEO flags.
- **PageStats:** Tracks views and likes for content slugs.
- **Subscribers / Contacts / Comments:** Engagement models.
- **Users:** Admin users for CMS authentication.

## Security & Hardening

- Admin routes are protected and bypass CDN caching.
- Write operations (Likes, Views increments) use atomic `$inc` updates and implement rate limiting.
- Zod validation on all Server Action inputs.
