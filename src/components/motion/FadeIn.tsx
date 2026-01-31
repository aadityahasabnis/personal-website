'use client';

import { ReactNode } from 'react';
import { motion, useInView, Variants, UseInViewOptions } from 'framer-motion';
import { useRef } from 'react';

type TDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface IFadeInProps {
  children: ReactNode;
  /** Direction to fade in from */
  direction?: TDirection;
  /** Animation delay in seconds */
  delay?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Distance to travel during animation */
  distance?: number;
  /** Whether to trigger animation only once */
  once?: boolean;
  /** Viewport margin for triggering animation */
  margin?: UseInViewOptions['margin'];
  /** Additional className */
  className?: string;
  /** Whether to include blur effect */
  blur?: boolean;
}

const getVariants = (direction: TDirection, distance: number, blur: boolean): Variants => {
  const hidden: Record<string, number | string> = { opacity: 0 };
  
  if (blur) {
    hidden.filter = 'blur(10px)';
  }

  switch (direction) {
    case 'up':
      hidden.y = distance;
      break;
    case 'down':
      hidden.y = -distance;
      break;
    case 'left':
      hidden.x = distance;
      break;
    case 'right':
      hidden.x = -distance;
      break;
    case 'none':
    default:
      break;
  }

  return {
    hidden,
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: 'blur(0px)',
    },
  };
};

/**
 * Fade-in animation wrapper with scroll trigger
 */
export const FadeIn = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  distance = 30,
  once = true,
  margin = '-50px',
  className = '',
  blur = false,
}: IFadeInProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin });

  const variants = getVariants(direction, distance, blur);

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

export default FadeIn;
