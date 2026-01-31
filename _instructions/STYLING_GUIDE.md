# Styling Guide

> CSS architecture and design system for AadityaHasabnis.site

---

## Overview

This project uses **Tailwind CSS 4** with a custom design system defined in `globals.css`. The approach combines:

1. **@theme directive** for design tokens (Tailwind v4)
2. **HSL color variables** for light/dark mode support
3. **CSS custom properties** for runtime theming
4. **Utility classes** for typography and animations

---

## File Structure

```
src/
├── app/
│   └── globals.css          # Main design system file
├── tailwind.config.ts        # Tailwind configuration
└── postcss.config.mjs        # PostCSS config
```

---

## globals.css Structure

```css
/* ===== IMPORTS ===== */
@import 'tailwindcss';
@config '../../tailwind.config.ts';

/* ===== THEME CONFIGURATION ===== */
@theme {
  /* Breakpoints, fonts, colors, border-radius */
}

/* ===== BASE STYLES ===== */
@layer base {
  /* Root CSS variables, typography classes */
}

/* ===== UTILITIES ===== */
@layer utilities {
  /* Custom utility classes */
}

/* ===== KEYFRAMES ===== */
@keyframes name { /* ... */ }
```

---

## Color System

### HSL-Based Theme Colors

Use HSL values for easy light/dark mode switching:

```css
@layer base {
  :root {
    /* Light mode */
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 222 47% 11%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 210 40% 96%;
    --accent-foreground: 222 47% 11%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 222 47% 11%;
    --radius: 0.5rem;
  }

  .dark {
    /* Dark mode */
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --card: 222 47% 11%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 11%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222 47% 11%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 212 27% 84%;
  }
}
```

### @theme Color Configuration

```css
@theme {
  /* Color Configuration */
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));

  /* Brand Colors - Nautical Blue Palette */
  --color-nautical-blue-10: #EBF1FC;
  --color-nautical-blue-30: #BCCBF5;
  --color-nautical-blue-50: #A2B9F3;
  --color-nautical-blue-80: #7A9BEB;
  --color-nautical-blue-100: #5A7EDD;
  --color-nautical-blue-200: #305DCF;
  --color-nautical-blue-300: #1247BA;
  --color-nautical-blue-400: #0F3EA3;
  --color-nautical-blue-500: #0D348C;
  --color-nautical-blue-600: #0A2A75;
  --color-nautical-blue-700: #061B4E;
  --color-nautical-blue-800: #010851;
  --color-nautical-blue-900: #04113A;
  --color-nautical-blue-950: #020B2C;

  /* Semantic Colors */
  --color-neutral-dark: #0F172A;
  --color-neutral-medium: #374151;
  --color-neutral-light: #737373;

  /* Status Colors */
  --color-status-amber: #D97706;
  --color-status-success: #297A2D;
  --color-status-error: #C32C2C;
  --color-status-link: #1247BA;
  --color-status-violet: #6E33C2;

  /* Status Light Backgrounds */
  --color-status-amber-light: #FEEBD2;
  --color-status-success-light: #C4F4CB;
  --color-status-error-light: #F9DFDF;

  /* UI Colors */
  --color-skeleton: #98A1AE;
  --color-muted-skeleton: #E4E4E7;
  --color-muted-background: #F9FAFB;
  --color-muted: #F5F5F5;
  --color-muted-foreground: #EEE;
}
```

---

## Typography System

### Font Size Configuration

```css
@theme {
  /* Responsive Font Sizes using clamp() */
  --font-size-title: clamp(1.5rem, 3vw, 2.25rem);
  --font-size-h1: clamp(1.25rem, 3vw, 1.75rem);
  --font-size-h2: clamp(1.2rem, 3vw, 1.5rem);
  --font-size-h5: clamp(1rem, 3vw, 1.125rem);
  --font-size-h6: clamp(0.925rem, 3vw, 0.975rem);
  --font-size-label: clamp(0.85rem, 3vw, 0.85rem);
  --font-size-regular: clamp(0.87rem, 3vw, 0.87rem);
}
```

### Typography Utility Classes

```css
@layer base {
  .text-title {
    font-size: var(--font-size-title);
    line-height: 2.5rem;
    letter-spacing: 0.04em;
    font-weight: 800;
  }

  .text-h1 {
    font-size: var(--font-size-h1);
    line-height: 2rem;
    letter-spacing: 0.04em;
    font-weight: 700;
  }

  .text-h2 {
    font-size: var(--font-size-h2);
    line-height: 2rem;
    letter-spacing: 0.03em;
    font-weight: 700;
  }

  .text-h5 {
    font-size: var(--font-size-h5);
    line-height: 1.5rem;
    letter-spacing: 0.03em;
    font-weight: 600;
  }

  .text-h6 {
    font-size: var(--font-size-h6);
    line-height: 1.5rem;
    letter-spacing: 0.03em;
    font-weight: 600;
  }

  .text-label {
    font-size: var(--font-size-label);
    line-height: 1.25rem;
    letter-spacing: 0.04em;
    font-weight: 600;
  }

  .text-regular {
    font-size: var(--font-size-regular);
    line-height: 1.25rem;
    letter-spacing: 0.025em;
    font-weight: 400;
  }
}
```

### Usage

```tsx
<h1 className="text-title">Welcome</h1>
<h2 className="text-h1">Section Title</h2>
<p className="text-regular text-neutral-medium">Body text with semantic color</p>
```

---

## Breakpoints

```css
@theme {
  --breakpoint-xs: 31.25rem;   /* 500px */
  --breakpoint-tab: 56.25rem;  /* 900px */
}
```

Usage in Tailwind classes:
```html
<div class="grid grid-cols-1 xs:grid-cols-2 tab:grid-cols-3">
```

---

## Border Radius

```css
@theme {
  --border-radius-lg: var(--radius);
  --border-radius-md: calc(var(--radius) - 2px);
  --border-radius-sm: calc(var(--radius) - 4px);
}
```

---

## Scrollbar Styling

```css
@layer utilities {
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #eeeeee;
    border-radius: 0;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #ebf1fc;
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: #eeeeee transparent;
  }

  /* Hide scrollbar utility */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```

---

## Animation Utilities

### Keyframes

```css
@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes shimmer {
  from { background-position: 0 0; }
  to { background-position: -200% 0; }
}

@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
```

### Animation Classes

```css
@layer utilities {
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    background-color: #eee;
    border-radius: 4px;
  }

  .animate-accordion-down {
    animation: accordion-down 0.2s ease-out;
  }

  .animate-accordion-up {
    animation: accordion-up 0.2s ease-out;
  }

  .animate-fade-in {
    animation: fade-in 0.4s ease-out;
  }

  .animate-shimmer {
    animation: shimmer 2s ease-in-out infinite;
  }
}
```

---

## Form Utilities

```css
@layer utilities {
  /* Hide password reveal button in Edge/IE */
  ::-ms-reveal {
    display: none;
  }

  /* Hide number input spinners */
  .spin-button-none::-webkit-outer-spin-button,
  .spin-button-none::-webkit-inner-spin-button {
    appearance: none;
  }
}
```

---

## Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-mono)']
      },
      boxShadow: {
        input: '0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)'
      }
    }
  },
  plugins: [typography, animate]
};

export default config;
```

---

## Usage Examples

### Card with Theme Colors

```tsx
<div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
  <h3 className="text-h5 text-foreground">Card Title</h3>
  <p className="text-regular text-muted-foreground">Card description</p>
</div>
```

### Status Badge

```tsx
<span className="bg-status-success-light text-status-success text-label px-2 py-1 rounded">
  Active
</span>
```

### Responsive Typography

```tsx
<h1 className="text-title text-foreground">
  Hero Heading
</h1>
<p className="text-regular text-neutral-light">
  Subtitle text with neutral color
</p>
```

---

## Dark Mode

Toggle dark mode by adding/removing `.dark` class on `<html>`:

```tsx
'use client';
import { useTheme } from 'next-themes';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
};
```

All `bg-background`, `text-foreground`, etc. will automatically adapt.

---

*Version: 1.0*  
*Project: AadityaHasabnis.site*
