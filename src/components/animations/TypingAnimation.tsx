"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ITypingAnimationProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursorClassName?: string;
  onComplete?: () => void;
  showCursor?: boolean;
}

/**
 * Typing animation component
 */
export const TypingAnimation: React.FC<ITypingAnimationProps> = ({
  text,
  speed = 50,
  delay = 0,
  className,
  cursorClassName,
  onComplete,
  showCursor = true,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayText("");
    setIsTyping(false);

    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(typingInterval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <span
          className={cn(
            "inline-block w-0.5 h-[1em] bg-current ml-0.5",
            isTyping ? "animate-pulse" : "animate-blink",
            cursorClassName,
          )}
        />
      )}
    </span>
  );
};

export default TypingAnimation;
