'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BeamLine } from '@/components/common/BeamLine';

interface IPageHeaderProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Optional label above title */
  label?: string;
  /** Alignment */
  align?: 'left' | 'center';
  /** Additional className */
  className?: string;
}

/**
 * Premium Page Header Component
 * 
 * Animated header with title, description, and optional label.
 * Used across all content pages for consistent styling.
 */
export const PageHeader = ({
  title,
  description,
  label,
  align = 'left',
  className,
}: IPageHeaderProps) => {
  return (
    <header
      className={cn(
        'relative mb-16 md:mb-20',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {/* Label */}
      {label && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-medium uppercase tracking-widest text-[var(--accent)] mb-4"
        >
          {label}
        </motion.p>
      )}

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="heading-display font-light"
      >
        <span className="text-[var(--fg)]">{title}</span>
      </motion.h1>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={cn(
            'mt-6 text-lg md:text-xl text-[var(--fg-muted)] font-light leading-relaxed',
            align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-3xl',
          )}
        >
          {description}
        </motion.p>
      )}

      {/* Decorative line */}
      <BeamLine 
        origin={align === 'center' ? 'center' : 'left'}
        className={align === 'center' ? 'mx-auto max-w-xs' : ''}
      />
    </header>
  );
};

export default PageHeader;
