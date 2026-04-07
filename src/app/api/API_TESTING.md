# API Testing Guide

This document is the complete testing reference for all routes under `/api`.

## Scope

- Covers every route handler currently implemented in `src/app/api/**/route.ts`.
- Includes method support (`GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`) and dynamic params.
- Provides a practical testing workflow for local, preview, and production validation.

## Base URLs

- Local: `http://localhost:3000`
- Preview: `https://<preview-domain>`
- Production: `https://aadityahasabnis.com`

Use endpoint paths exactly as listed in this guide.

## Auth Model For Testing

- Admin APIs (`/api/admin/**`) use cookie-session auth (NextAuth), not bearer tokens.
- Public/content APIs are mostly unauthenticated unless business rules in server actions enforce additional checks.
- NextAuth handler route is `/api/auth/[...nextauth]`.

### Admin Auth Test Flow

1. Call `POST /api/admin/auth/login` with valid admin credentials.
2. Preserve cookies in your HTTP client (Postman cookie jar or curl cookie file).
3. Call `GET /api/admin/auth/session` to confirm `isAuthenticated=true`.
4. Reuse the same cookie session for all `/api/admin/**` endpoints.

Example cookie-based login flow with curl:

```bash
# login
curl -i -c cookies.txt \
  -X POST "http://localhost:3000/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"<password>"}'

# validate session
curl -i -b cookies.txt \
  "http://localhost:3000/api/admin/auth/session"
```

## Dynamic Param Conventions

- `[articleId]`, `[blogId]`, `[projectId]`, `[topicId]`, `[subtopicId]`, `[contentId]`, `[commentId]` are DB identifiers.
- `[topicSlug]`, `[articleSlug]`, `[blogSlug]`, `[projectSlug]` are URL slugs.

## Endpoint Catalog

## Admin APIs

| Methods                   | Endpoint                                                  |
| ------------------------- | --------------------------------------------------------- |
| GET                       | `/api/admin/auth`                                         |
| POST                      | `/api/admin/auth/forgot-password`                         |
| POST, OPTIONS             | `/api/admin/auth/login`                                   |
| POST                      | `/api/admin/auth/request-otp`                             |
| POST                      | `/api/admin/auth/reset-password`                          |
| GET, OPTIONS              | `/api/admin/auth/session`                                 |
| POST                      | `/api/admin/auth/verify-credentials`                      |
| POST                      | `/api/admin/auth/verify-otp`                              |
| POST                      | `/api/admin/auth/verify-reset-token`                      |
| GET, POST                 | `/api/admin/comments`                                     |
| GET, POST                 | `/api/admin/contacts`                                     |
| GET, POST, PATCH, OPTIONS | `/api/admin/content/articles`                             |
| PATCH, DELETE, OPTIONS    | `/api/admin/content/articles/[articleId]`                 |
| PATCH, OPTIONS            | `/api/admin/content/articles/[articleId]/featured`        |
| POST, OPTIONS             | `/api/admin/content/articles/[articleId]/publish`         |
| PATCH, OPTIONS            | `/api/admin/content/articles/[articleId]/status`          |
| POST, OPTIONS             | `/api/admin/content/articles/bulk`                        |
| PATCH, OPTIONS            | `/api/admin/content/articles/bulk/status`                 |
| POST                      | `/api/admin/content/articles/parity`                      |
| POST, OPTIONS             | `/api/admin/content/articles/reorder`                     |
| GET, POST, OPTIONS        | `/api/admin/content/blogs`                                |
| PATCH, DELETE, OPTIONS    | `/api/admin/content/blogs/[blogId]`                       |
| PATCH, OPTIONS            | `/api/admin/content/blogs/[blogId]/featured`              |
| POST, OPTIONS             | `/api/admin/content/blogs/[blogId]/publish`               |
| PATCH, OPTIONS            | `/api/admin/content/blogs/[blogId]/status`                |
| POST, OPTIONS             | `/api/admin/content/blogs/bulk`                           |
| PATCH, OPTIONS            | `/api/admin/content/blogs/bulk/status`                    |
| POST                      | `/api/admin/content/blogs/parity`                         |
| GET, POST, OPTIONS        | `/api/admin/content/projects`                             |
| PATCH, DELETE, OPTIONS    | `/api/admin/content/projects/[projectId]`                 |
| PATCH, OPTIONS            | `/api/admin/content/projects/[projectId]/featured`        |
| POST, OPTIONS             | `/api/admin/content/projects/[projectId]/featured/toggle` |
| PATCH, OPTIONS            | `/api/admin/content/projects/[projectId]/lifecycle`       |
| POST, OPTIONS             | `/api/admin/content/projects/[projectId]/publish`         |
| PATCH, OPTIONS            | `/api/admin/content/projects/[projectId]/status`          |
| POST, OPTIONS             | `/api/admin/content/projects/bulk`                        |
| PATCH, OPTIONS            | `/api/admin/content/projects/bulk/lifecycle`              |
| PATCH, OPTIONS            | `/api/admin/content/projects/bulk/status`                 |
| POST                      | `/api/admin/content/projects/parity`                      |
| POST, OPTIONS             | `/api/admin/content/projects/reorder`                     |
| GET, POST                 | `/api/admin/email`                                        |
| GET, POST                 | `/api/admin/media`                                        |
| PATCH, DELETE             | `/api/admin/media/[id]`                                   |
| GET                       | `/api/admin/media/stats`                                  |
| POST                      | `/api/admin/settings`                                     |
| GET, POST                 | `/api/admin/subscribers`                                  |
| GET, POST, OPTIONS        | `/api/admin/subtopics`                                    |
| PATCH, DELETE, OPTIONS    | `/api/admin/subtopics/[subtopicId]`                       |
| POST, OPTIONS             | `/api/admin/subtopics/[subtopicId]/publish`               |
| POST, OPTIONS             | `/api/admin/subtopics/bulk`                               |
| POST, OPTIONS             | `/api/admin/subtopics/reorder`                            |
| GET, POST, OPTIONS        | `/api/admin/topics`                                       |
| PATCH, DELETE, OPTIONS    | `/api/admin/topics/[topicId]`                             |
| POST, OPTIONS             | `/api/admin/topics/[topicId]/publish`                     |
| POST, OPTIONS             | `/api/admin/topics/bulk`                                  |
| POST, OPTIONS             | `/api/admin/topics/reorder`                               |

## Auth API

| Methods   | Endpoint                  |
| --------- | ------------------------- |
| GET, POST | `/api/auth/[...nextauth]` |

## Public Content APIs

### Articles

| Methods            | Endpoint                                                           |
| ------------------ | ------------------------------------------------------------------ |
| GET, OPTIONS       | `/api/content/articles/[topicSlug]`                                |
| GET, OPTIONS       | `/api/content/articles/[topicSlug]/[articleSlug]`                  |
| GET, OPTIONS       | `/api/content/articles/id/[contentId]`                             |
| GET, POST, OPTIONS | `/api/content/articles/id/[contentId]/comments`                    |
| POST, OPTIONS      | `/api/content/articles/id/[contentId]/comments/[commentId]/upvote` |
| GET, POST, OPTIONS | `/api/content/articles/id/[contentId]/likes`                       |
| GET, POST, OPTIONS | `/api/content/articles/id/[contentId]/views`                       |
| GET, OPTIONS       | `/api/content/articles/static-paths`                               |
| GET, OPTIONS       | `/api/content/articles/topics`                                     |
| GET, OPTIONS       | `/api/content/articles/topics/[topicSlug]`                         |

### Blogs

| Methods            | Endpoint                                                        |
| ------------------ | --------------------------------------------------------------- |
| GET, OPTIONS       | `/api/content/blogs`                                            |
| GET, OPTIONS       | `/api/content/blogs/[blogSlug]`                                 |
| GET, OPTIONS       | `/api/content/blogs/id/[contentId]`                             |
| GET, POST, OPTIONS | `/api/content/blogs/id/[contentId]/comments`                    |
| POST, OPTIONS      | `/api/content/blogs/id/[contentId]/comments/[commentId]/upvote` |
| GET, POST, OPTIONS | `/api/content/blogs/id/[contentId]/likes`                       |
| GET, OPTIONS       | `/api/content/blogs/id/[contentId]/views`                       |
| GET, OPTIONS       | `/api/content/blogs/static-paths`                               |

### Projects

| Methods            | Endpoint                                                           |
| ------------------ | ------------------------------------------------------------------ |
| GET, OPTIONS       | `/api/content/projects`                                            |
| GET, OPTIONS       | `/api/content/projects/[projectSlug]`                              |
| GET, OPTIONS       | `/api/content/projects/id/[contentId]`                             |
| GET, POST, OPTIONS | `/api/content/projects/id/[contentId]/comments`                    |
| POST, OPTIONS      | `/api/content/projects/id/[contentId]/comments/[commentId]/upvote` |
| GET, POST, OPTIONS | `/api/content/projects/id/[contentId]/likes`                       |
| GET, OPTIONS       | `/api/content/projects/id/[contentId]/views`                       |
| GET, OPTIONS       | `/api/content/projects/static-paths`                               |

### Search / Contact / Subscriptions

| Methods       | Endpoint                   |
| ------------- | -------------------------- |
| POST, OPTIONS | `/api/content/contact`     |
| GET, OPTIONS  | `/api/content/search`      |
| POST, OPTIONS | `/api/content/subscribe`   |
| POST, OPTIONS | `/api/content/unsubscribe` |

## Other Public APIs

| Methods | Endpoint                |
| ------- | ----------------------- |
| POST    | `/api/public/contact`   |
| POST    | `/api/public/subscribe` |
| GET     | `/api/images`           |
| POST    | `/api/upload`           |

## Practical Testing Checklist

1. Validate admin authentication lifecycle:
    - Login success/failure.
    - Session check after login.
    - Access control behavior for protected admin endpoints.
2. Validate CRUD and bulk flows for admin content APIs:
    - Create, update, publish/unpublish/status, reorder, bulk state updates.
3. Validate public read APIs:
    - List/detail/static-path endpoints return expected payload shape.
4. Validate engagement APIs:
    - Comments create/list.
    - Likes and views retrieval/increment behavior.
    - Comment upvote behavior.
5. Validate contact/subscription APIs:
    - Required field validation.
    - Duplicate handling for subscribe/unsubscribe scenarios.
6. Validate non-functional behavior:
    - Correct status codes on invalid payloads.
    - OPTIONS behavior where implemented.
    - Race/consistency scenarios for engagement counters.

## Suggested Test Tooling

- Manual: Postman or Insomnia using environment variables (`BASE_URL`, admin credentials).
- CLI smoke: `curl` scripts for critical happy paths.
- Automated regression: keep using existing API tests in `tests/api` and extend where needed.

## Notes

- This file is endpoint-complete based on the current `src/app/api/**/route.ts` structure.
- If a new `route.ts` file is added, update this guide in the same PR.
