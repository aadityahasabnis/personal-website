
# NextAuth Usage Guide

## Exports

```ts
import { auth, signIn, signOut, handlers } from '@/lib/auth/admin';
```

| Export | Purpose | Where to Use |
|--------|---------|--------------|
| `auth()` | Get current session | Server Components, API Routes |
| `signIn()` | Log user in | Server Actions |
| `signOut()` | Log user out | Server Actions |
| `handlers` | NextAuth HTTP handlers | API route handlers |

---

## 1. API Route (Required)

```ts
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth/admin';
export const { GET, POST } = handlers;
```

---

## 2. Check Auth (Server Component)

```tsx
import { auth } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect('/admin/login');
  
  return <div>Welcome {session.user.name}</div>;
}
```

---

## 3. Login Form (Client → Server Action)

```tsx
// app/admin/login/page.tsx
'use client';
import { loginAction } from './actions';

export default function LoginPage() {
  return (
    <form action={loginAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```

```ts
// app/admin/login/actions.ts
'use server';
import { signIn } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const result = await signIn('credentials', {
    email: formData.get('email'),
    password: formData.get('password'),
    redirect: false,
  });
  
  if (result?.error) return { error: 'Invalid credentials' };
  redirect('/admin');
}
```

---

## 4. Logout Button

```tsx
// components/LogoutButton.tsx
import { signOut } from '@/lib/auth/admin';

export function LogoutButton() {
  return (
    <form action={async () => {
      'use server';
      await signOut({ redirectTo: '/admin/login' });
    }}>
      <button type="submit">Logout</button>
    </form>
  );
}
```

---

## 5. Protect Admin Routes

```tsx
// app/(admin)/admin/layout.tsx
import { auth } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session) redirect('/admin/login');
  return <>{children}</>;
}
```

---

## 6. Get User in API Route

```ts
// app/api/admin/profile/route.ts
import { auth } from '@/lib/auth/admin';

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  return Response.json({ user: session.user });
}
```

---

## Quick Reference

```tsx
// ✅ Server Component
const session = await auth();

// ✅ Server Action - Login
await signIn('credentials', { email, password, redirect: false });

// ✅ Server Action - Logout
await signOut({ redirectTo: '/admin/login' });

// ✅ API Route
export const { GET, POST } = handlers;
