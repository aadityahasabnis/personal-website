'use client';

import { ReactNode, Children, isValidElement } from 'react';
import { motion, useInView, Variants, UseInViewOptions } from 'framer-motion';
import { useRef } from 'react';

interface IStaggerChildrenProps {
  children: ReactNode;
  /** Delay between each child animation */
  staggerDelay?: number;
  /** Initial delay before stagger starts */
  delay?: number;
  /** Animation duration for each child */
  duration?: number;
  /** Whether to trigger only once */
  once?: boolean;
  /** Viewport margin for triggering */
  margin?: UseInViewOptions['margin'];
  /** Additional className for container */
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

/**
 * Container that staggers animations for its children
 */
export const StaggerChildren = ({
  children,
  staggerDelay = 0.1,
  delay = 0,
  duration = 0.5,
  once = true,
  margin = '-50px',
  className = '',
}: IStaggerChildrenProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin });

  const customContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const customItemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={customContainerVariants}
      className={className}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        
        return (
          <motion.div variants={customItemVariants}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default StaggerChildren;
