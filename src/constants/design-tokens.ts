/**
 * Design Tokens & Color System
 * 
 * This file documents all CSS variables and provides TypeScript constants
 * for use in components. All colors are defined in globals.css and should
 * be referenced via CSS variables for proper theme support.
 * 
 * **DO NOT hardcode hex colors in components!**
 * Always use: `var(--accent)` or the constants below.
 */

// ===== COLOR SYSTEM =====

/**
 * Primary accent color (Lavender purple)
 * Equivalent to #9b87f5 in hex
 */
export const COLORS = {
  // Accent Colors (Primary brand color)
  accent: 'var(--accent)',           // oklch(0.70 0.22 285) in dark, oklch(0.55 0.24 285) in light
  accentHover: 'var(--accent-hover)', // oklch(0.75 0.24 285) in dark, oklch(0.48 0.26 285) in light
  accentFg: 'var(--accent-fg)',       // Text color on accent backgrounds
  accentSubtle: 'var(--accent-subtle)', // Subtle accent backgrounds

  // Legacy aliases (use accent instead)
  lavender: 'var(--lavender)',        // Same as accent
  lavenderHover: 'var(--lavender-hover)', // Same as accent-hover
  lavenderLight: 'var(--lavender-light)', // Same as accent-subtle

  // Base Colors
  bg: 'var(--bg)',                    // Page background
  bgSubtle: 'var(--bg-subtle)',       // Subtle background variation
  fg: 'var(--fg)',                    // Primary text color
  fgMuted: 'var(--fg-muted)',         // Muted text color
  fgSubtle: 'var(--fg-subtle)',       // Very subtle text

  // Surfaces
  surface: 'var(--surface)',          // Card/surface backgrounds
  surfaceHover: 'var(--surface-hover)', // Hover state for surfaces
  cardBg: 'var(--card-bg)',           // Card backgrounds

  // Borders
  border: 'var(--border-color)',      // Default border color
  borderHover: 'var(--border-hover)', // Hover border color

  // Status Colors
  success: 'var(--success)',          // Green for success states
  warning: 'var(--warning)',          // Yellow for warnings
  error: 'var(--error)',              // Red for errors
  info: 'var(--info)',                // Blue for info states

  // Glow Effects
  glow: 'var(--glow-color)',          // Glow shadow color
  glowAccent: 'var(--glow-accent)',   // Accent glow shadow

  // Glass Effects
  glassBg: 'var(--glass-bg)',         // Glass background
  glassBorder: 'var(--glass-border)', // Glass border
} as const;

// ===== SHADOW SYSTEM =====

export const SHADOWS = {
  glowSm: 'var(--shadow-glow-sm)',    // Small glow shadow
  glowMd: 'var(--shadow-glow-md)',    // Medium glow shadow
  glowLg: 'var(--shadow-glow-lg)',    // Large glow shadow
} as const;

// ===== BORDER RADIUS =====

export const RADIUS = {
  sm: 'var(--border-radius-sm)',      // Small radius
  md: 'var(--border-radius-md)',      // Medium radius
  lg: 'var(--border-radius-lg)',      // Large radius
  xl: 'var(--radius-xl)',             // Extra large
  '2xl': 'var(--radius-2xl)',         // 2x large
  '3xl': 'var(--radius-3xl)',         // 3x large
  '4xl': 'var(--radius-4xl)',         // 4x large
  full: '9999px',                     // Full circle
} as const;

// ===== TRANSITIONS =====

export const TRANSITIONS = {
  fast: 'var(--transition-fast)',     // 150ms
  base: 'var(--transition-base)',     // 200ms
  slow: 'var(--transition-slow)',     // 300ms
  spring: 'var(--transition-spring)', // 500ms with spring easing
} as const;

// ===== SPACING SYSTEM =====

/**
 * Standard padding patterns used across the app
 */
export const PADDING = {
  // Page containers
  pageX: 'px-6 lg:px-8',              // Horizontal page padding
  pageY: 'py-24 md:py-32',            // Vertical page padding
  page: 'px-6 lg:px-8 py-24 md:py-32', // Combined

  // Card padding
  cardSm: 'p-4',                      // Small card
  cardMd: 'p-6 md:p-8',               // Medium card
  cardLg: 'p-8 md:p-12',              // Large card

  // Button padding
  btnSm: 'px-3 py-1.5',               // Small button
  btnMd: 'px-4 py-2 md:px-5 md:py-2.5', // Medium button
  btnLg: 'px-6 py-3',                 // Large button
} as const;

// ===== MAX WIDTH SYSTEM =====

/**
 * Container max-widths for consistent layouts
 */
export const MAX_WIDTH = {
  narrow: 'max-w-3xl',                // 768px - Text content
  default: 'max-w-4xl',               // 896px - Article pages
  wide: 'max-w-6xl',                  // 1152px - List pages
  full: 'max-w-7xl',                  // 1280px - Dashboard
} as const;

// ===== ANIMATION VARIANTS =====

/**
 * Common Framer Motion animation variants
 */
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
} as const;

/**
 * Standard animation transition configs
 */
export const ANIMATION_TRANSITIONS = {
  fast: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  base: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  slow: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bounce: { type: 'spring', stiffness: 400, damping: 20 },
} as const;

/**
 * Standard animation delays for staggered animations
 */
export const ANIMATION_DELAYS = {
  none: 0,
  xs: 0.05,
  sm: 0.1,
  md: 0.2,
  lg: 0.3,
  xl: 0.5,
} as const;

// ===== UTILITY CLASS HELPERS =====

/**
 * Helper to combine design token classes with custom classes
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get max-width + padding combo for page containers
 */
export function getContainerClasses(variant: keyof typeof MAX_WIDTH = 'default'): string {
  return cn(MAX_WIDTH[variant], 'mx-auto', PADDING.pageX, PADDING.pageY);
}

/**
 * Get accent color classes for hover states
 */
export const ACCENT_CLASSES = {
  text: 'text-[var(--accent)] hover:text-[var(--accent-hover)]',
  bg: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]',
  border: 'border-[var(--accent)] hover:border-[var(--accent-hover)]',
  ring: 'ring-[var(--accent)] focus:ring-[var(--accent)]',
} as const;

// ===== USAGE EXAMPLES =====

/**
 * Example: Using colors in inline styles
 * 
 * ```tsx
 * <div style={{ background: COLORS.accent }}>...</div>
 * ```
 * 
 * Example: Using colors in className
 * 
 * ```tsx
 * <div className="bg-[var(--accent)] text-[var(--accent-fg)]">...</div>
 * ```
 * 
 * Example: Using utility classes
 * 
 * ```tsx
 * <button className="btn-primary">Click me</button>
 * <input className="input-base" />
 * <span className="badge-primary">New</span>
 * ```
 * 
 * Example: Using container helper
 * 
 * ```tsx
 * <div className={getContainerClasses('wide')}>...</div>
 * // Outputs: "max-w-6xl mx-auto px-6 lg:px-8 py-24 md:py-32"
 * ```
 */

// ===== MIGRATION GUIDE =====

/**
 * MIGRATION: Replacing hardcoded hex colors
 * 
 * Old (hardcoded):
 * - bg-[#9b87f5]           → bg-[var(--accent)]
 * - text-[#9b87f5]         → text-[var(--accent)]
 * - border-[#9b87f5]       → border-[var(--accent)]
 * - hover:bg-[#8b77e5]     → hover:bg-[var(--accent-hover)]
 * - shadow-[#9b87f5]/30    → shadow-[var(--glow-color)]
 * - bg-[#9b87f5]/10        → bg-[var(--accent-subtle)]
 * - bg-[#9b87f5]/20        → badge-accent-subtle (use utility class)
 * 
 * New (CSS variables):
 * Use the CSS variable directly or the exported constants above.
 */
