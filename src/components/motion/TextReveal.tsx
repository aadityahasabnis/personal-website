'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface ITextRevealProps {
  children: string;
  /** Animation delay in seconds */
  delay?: number;
  /** Duration per character */
  charDuration?: number;
  /** Stagger delay between characters */
  stagger?: number;
  /** Additional className */
  className?: string;
}

/**
 * Character-by-character text reveal animation
 */
export const TextReveal = ({
  children,
  delay = 0,
  charDuration = 0.03,
  stagger = 0.02,
  className = '',
}: ITextRevealProps) => {
  const words = children.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: stagger, 
        delayChildren: delay,
      },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: charDuration * 10,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    },
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
      style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.25em' }}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} style={{ display: 'inline-block' }}>
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              variants={child}
              style={{ display: 'inline-block' }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
};

export default TextReveal;
