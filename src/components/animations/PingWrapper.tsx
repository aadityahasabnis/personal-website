"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface IPingWrapperProps {
  children: React.ReactNode;
  active?: boolean;
  color?: "primary" | "success" | "warning" | "destructive";
  size?: "sm" | "md" | "lg";
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  className?: string;
}

const colorMap = {
  primary: "bg-primary",
  success: "bg-green-500",
  warning: "bg-amber-500",
  destructive: "bg-destructive",
};

const sizeMap = {
  sm: "size-2",
  md: "size-3",
  lg: "size-4",
};

const positionMap = {
  "top-right": "-top-1 -right-1",
  "top-left": "-top-1 -left-1",
  "bottom-right": "-bottom-1 -right-1",
  "bottom-left": "-bottom-1 -left-1",
};

/**
 * Wrapper component that adds a pulsing indicator
 */
export const PingWrapper: React.FC<IPingWrapperProps> = ({
  children,
  active = true,
  color = "primary",
  size = "sm",
  position = "top-right",
  className,
}) => {
  if (!active) return <>{children}</>;

  return (
    <div className={cn("relative inline-flex", className)}>
      {children}
      <span
        className={cn("absolute flex", sizeMap[size], positionMap[position])}
      >
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            colorMap[color],
          )}
        />
        <span
          className={cn(
            "relative inline-flex rounded-full",
            sizeMap[size],
            colorMap[color],
          )}
        />
      </span>
    </div>
  );
};

export default PingWrapper;
