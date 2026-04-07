# Server Actions Summary

## Philosophy & Design

The backend heavily uses **Modular Server Actions** instead of traditional monolithic API routes.

- **Rule of Thumb**: One action per `.ts` file.
- Avoid action-per-folder index patterns. Use flat named files (e.g., `getContentLikesById.ts`).
- Keep barrel `index.ts` files lightweight (exports only) rather than monolithic implementors.

## Domains Covered

### 1. Administration Actions

Found loosely in `src/server/new/admin/`:

- **Auth**: Secured validation and route gating.
- **Comments/Contacts/Subscribers**: Bulk update actions, list pagination, and soft/hard deletes.
- Document and stats queries via Mongoose.

### 2. Public Actions

Found in `src/server/new/public/`:

- **Content Retrieval**: Read contracts and views increments safely via `get*/increment*` Server Actions.
- **Stats Generation**: Extract aggregate metrics.
- **Engagement**: Subscription creation, comment submission, contact forms.

## Usage Guidelines

- Call these server actions directly from client components (or forms) where possible.
- Include schema validation (Zod) internally within each action.
- Only revalidate paths using the internal Next.js helper `revalidatePath` when write actions are confirmed to prevent race conditions.
