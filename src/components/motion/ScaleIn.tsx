'use client';

import { ReactNode } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';

interface IScaleInProps {
  children: ReactNode;
  /** Animation delay in seconds */
  delay?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Initial scale value */
  initialScale?: number;
  /** Whether to trigger only once */
  once?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Scale-in animation wrapper with scroll trigger
 */
export const ScaleIn = ({
  children,
  delay = 0,
  duration = 0.5,
  initialScale = 0.95,
  once = true,
  className = '',
}: IScaleInProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  const variants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: initialScale,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScaleIn;
