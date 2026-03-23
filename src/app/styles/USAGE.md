Here's a **clean documentation Markdown file** focused only on your theme configuration and CSS variables:

---

# 🎨 Theme Configuration Documentation

A comprehensive design token system with OKLCH colors, responsive typography, and dark mode support.

## 📋 Table of Contents

- [Installation](#installation)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing & Radius](#spacing--radius)
- [Breakpoints](#breakpoints)
- [Effects & Shadows](#effects--shadows)
- [Transitions](#transitions)
- [CSS Variables Reference](#css-variables-reference)

---

## 📦 Installation

### 1. Setup Next.js with Tailwind

```bash
npm install tailwindcss@next postcss autoprefixer
npx tailwindcss init
```

### 2. Add Fonts to `layout.tsx`

```tsx
import { Geist, Geist_Mono, Nunito } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
    display: 'swap',
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
    display: 'swap',
});

const nunito = Nunito({
    variable: '--font-nunito',
    subsets: ['latin'],
    display: 'swap',
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`
                    ${geistSans.variable}
                    ${geistMono.variable}
                    ${nunito.variable}
                    min-h-screen bg-background font-sans antialiased
                `}
            >
                {children}
            </body>
        </html>
    );
}
```

### 3. Copy Theme Configuration

Place the complete CSS code in your `app/globals.css` file.

---

## 🎨 Color System

### Theme Colors (Tailwind Utilities)

| Variable | Tailwind Class | Light Mode | Dark Mode |
|----------|----------------|------------|-----------|
| `--bg` | `bg-background` | `oklch(0.99 0.002 90)` | `oklch(0.13 0.03 285)` |
| `--fg` | `text-foreground` | `oklch(0.2 0.02 285)` | `oklch(0.95 0.01 285)` |
| `--fg-muted` | `text-muted-foreground` | `oklch(0.45 0.02 285)` | `oklch(0.7 0.02 285)` |
| `--accent` | `bg-primary` | `oklch(0.55 0.24 285)` | `oklch(0.7 0.22 285)` |
| `--surface` | `bg-muted` | `oklch(0.96 0.006 285)` | `oklch(0.18 0.04 285)` |
| `--card-bg` | `bg-card` | `oklch(1 0 0)` | `oklch(0.16 0.035 285)` |
| `--border-color` | `border-border` | `oklch(0.9 0.01 285)` | `oklch(0.25 0.04 285)` |

### Status Colors

| Variable | Tailwind Class | Value |
|----------|----------------|-------|
| `--success` | `bg-success` | `oklch(0.55 0.18 145)` |
| `--warning` | `bg-warning` | `oklch(0.7 0.15 75)` |
| `--error` | `bg-destructive` | `oklch(0.55 0.22 25)` |

### Accent Color Palette (Violet Shades)

| Shade | OKLCH Value |
|-------|-------------|
| 50 | `oklch(0.97 0.02 285)` |
| 100 | `oklch(0.93 0.04 285)` |
| 200 | `oklch(0.87 0.08 285)` |
| 300 | `oklch(0.78 0.12 285)` |
| 400 | `oklch(0.68 0.18 285)` |
| 500 | `oklch(0.58 0.22 285)` |
| 600 | `oklch(0.5 0.24 285)` |
| 700 | `oklch(0.42 0.22 285)` |
| 800 | `oklch(0.35 0.18 285)` |
| 900 | `oklch(0.28 0.14 285)` |
| 950 | `oklch(0.2 0.1 285)` |

**Usage:**
```tsx
<div className="bg-violet-500 text-white">Primary Violet</div>
<div className="text-violet-700">Dark Violet Text</div>
```

---

## 📝 Typography

### Responsive Font Sizes

All font sizes use `clamp()` for fluid responsiveness between mobile and desktop:

| Tailwind Class | Mobile Size | Desktop Size | Use Case |
|----------------|-------------|--------------|----------|
| `text-display` | 2.5rem | 4.5rem | Hero sections, main headlines |
| `text-title` | 1.75rem | 2.5rem | Page titles |
| `text-h1` | 1.5rem | 2rem | Section headers |
| `text-h2` | 1.25rem | 1.75rem | Subsection headers |
| `text-h3` | 1.125rem | 1.5rem | Card titles |
| `text-h4` | 1rem | 1.25rem | Minor headings |
| `text-h5` | 0.925rem | 1.125rem | Small headings |
| `text-h6` | 0.875rem | 1rem | Tiny headings |
| `text-body` | 0.9rem | 1rem | Body text |
| `text-small` | 0.8rem | 0.875rem | Captions, metadata |
| `text-label` | 0.75rem | 0.8125rem | Form labels, badges |

### Font Families

| Variable | Tailwind Class | Font Stack |
|----------|----------------|------------|
| `--font-sans` | `font-sans` | Geist Sans + System UI |
| `--font-mono` | `font-mono` | Geist Mono + SF Mono |
| `--font-nunito` | `font-nunito` | Nunito + System UI |

**Usage:**
```tsx
<h1 className="text-display font-bold">Hero Title</h1>
<p className="text-body">Responsive body text</p>
<span className="text-label uppercase">Form Label</span>
```

---

## 🔲 Spacing & Radius

### Border Radius Scale

| Tailwind Class | Value | Use Case |
|----------------|-------|----------|
| `rounded-sm` | `var(--radius-sm)` = `calc(0.625rem - 4px)` | Small elements, badges |
| `rounded-md` | `var(--radius-md)` = `calc(0.625rem - 2px)` | Buttons, inputs |
| `rounded-lg` | `var(--radius-lg)` = `0.625rem` | Cards, containers |
| `rounded-xl` | `var(--radius-xl)` = `calc(0.625rem + 4px)` | Large containers |
| `rounded-2xl` | `var(--radius-2xl)` = `calc(0.625rem + 8px)` | Hero sections |
| `rounded-3xl` | `1.5rem` | Special elements |
| `rounded-4xl` | `2rem` | Featured elements |

**Base radius:** `--radius: 0.625rem` (10px)

---

## 📱 Breakpoints

| Breakpoint | Width | Tailwind Prefix | Use Case |
|------------|-------|-----------------|----------|
| xs | 500px | `xs:` | Extra small devices |
| sm | 640px | `sm:` | Small devices (phones) |
| md | 768px | `md:` | Medium devices (tablets) |
| tab | 900px | `tab:` | Custom tablet breakpoint |
| lg | 1024px | `lg:` | Large devices (desktops) |
| xl | 1280px | `xl:` | Extra large devices |
| 2xl | 1536px | `2xl:` | Ultra wide screens |

**Usage:**
```tsx
<div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    Responsive grid layout
</div>
```

---

## ✨ Effects & Shadows

### Glow Shadows

| Tailwind Class | Value | Use Case |
|----------------|-------|----------|
| `shadow-glow-sm` | `0 0 20px -5px var(--glow-color)` | Subtle glow |
| `shadow-glow-md` | `0 0 40px -10px var(--glow-color)` | Medium glow |
| `shadow-glow-lg` | `0 0 60px -15px var(--glow-color)` | Strong glow |

**Glow color variables:**
- `--glow-color`: `oklch(0.55 0.24 285 / 0.3)` (light) / `oklch(0.7 0.22 285 / 0.4)` (dark)
- `--glow-accent`: `oklch(0.55 0.24 285 / 0.5)` (light) / `oklch(0.7 0.22 285 / 0.6)` (dark)

### Gradient Variables

| Variable | Light Mode | Dark Mode |
|----------|------------|-----------|
| `--gradient-start` | `oklch(0.58 0.22 285)` | `oklch(0.65 0.22 285)` |
| `--gradient-mid` | `oklch(0.55 0.2 310)` | `oklch(0.6 0.2 310)` |
| `--gradient-end` | `oklch(0.6 0.18 250)` | `oklch(0.68 0.18 250)` |

### Glass Effects

| Variable | Light Mode | Dark Mode |
|----------|------------|-----------|
| `--glass-bg` | `oklch(1 0 0 / 0.7)` | `oklch(0.16 0.035 285 / 0.7)` |
| `--glass-border` | `oklch(0.9 0.01 285 / 0.5)` | `oklch(0.3 0.05 285 / 0.5)` |

---

## ⚡ Transitions

| Tailwind Class | Duration | Easing | Use Case |
|----------------|----------|--------|----------|
| `transition-fast` | 150ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover states, micro-interactions |
| `transition-base` | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Default transitions |
| `transition-slow` | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Page transitions, modals |
| `transition-spring` | 500ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy, playful animations |

**Usage:**
```tsx
<button className="transition-base hover:shadow-glow-sm">
    Hover me
</button>
```

---

## 📚 CSS Variables Reference

### Complete List of Available CSS Variables

```css
/* Background & Text */
--bg                    /* Page background */
--bg-subtle            /* Subtle background variant */
--fg                   /* Primary text color */
--fg-muted             /* Secondary text color */
--fg-subtle            /* Tertiary text color */

/* Surfaces */
--surface              /* Surface background (cards, panels) */
--surface-hover        /* Surface hover state */
--card-bg              /* Card background */

/* Accent */
--accent               /* Primary brand color */
--accent-hover         /* Brand color hover state */
--accent-fg            /* Text color on accent backgrounds */
--accent-subtle        /* Subtle accent background */

/* Borders */
--border-color         /* Default border color */
--border-hover         /* Border hover state */

/* Effects */
--glow-color           /* Glow effect color */
--glow-accent          /* Stronger glow with accent */
--glass-bg             /* Glass morphism background */
--glass-border         /* Glass morphism border */

/* Ambient Spheres */
--sphere-1, --sphere-2, --sphere-3  /* Ambient background spheres */

/* Gradients */
--gradient-start       /* Gradient start color */
--gradient-mid         /* Gradient middle color */
--gradient-end         /* Gradient end color */

/* Status */
--success              /* Success color */
--warning              /* Warning color */
--error                /* Error color */

/* Spacing */
--radius               /* Base border radius (0.625rem) */
```

---

## 🎯 Best Practices

### 1. Use Semantic Colors
```tsx
// ✅ Good - Semantic naming
<div className="bg-primary text-primary-foreground">Button</div>

// ❌ Bad - Direct values
<div style={{ backgroundColor: '#9b87f5' }}>Button</div>
```

### 2. Leverage CSS Variables for Customization
```tsx
// Override theme variables for a section
<div style={{ '--accent': 'oklch(0.65 0.2 145)' } as React.CSSProperties}>
    <button className="bg-primary">Custom Green Theme</button>
</div>
```

### 3. Responsive Typography
```tsx
// All text classes are responsive by default
<h1 className="text-display">Scales automatically</h1>
```

### 4. Dark Mode Support
```tsx
// Add dark mode class to html element
document.documentElement.classList.add('dark');

// Or use next-themes for automatic handling
```

---

## 🔧 Customization

### Modifying Colors

Update the OKLCH values in `:root` for light mode and `.dark` for dark mode:

```css
:root {
    --accent: oklch(0.65 0.25 260); /* Change to your brand color */
    --bg: oklch(0.98 0.005 90);     /* Adjust background */
}
```

### Adding New Breakpoints

Add to `@theme` block:

```css
@theme {
    --breakpoint-3xl: 112rem; /* 1792px */
}
```

### Extending Font Sizes

Add new `--text-*` variables:

```css
@theme {
    --text-caption: clamp(0.7rem, 0.8vw, 0.75rem);
}
```

---

## 📖 Additional Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [OKLCH Color Picker](https://oklch.com/)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)

---

**Version:** 1.0.0  
**Last Updated:** March 2026  
**Compatible with:** Tailwind CSS v4, Next.js 14+