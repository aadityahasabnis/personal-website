"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ISkillCardProps {
  name: string;
  level?: number; // 0-100
  icon?: React.ReactNode;
  category?: string;
  className?: string;
}

/**
 * Skill card for displaying expertise levels
 */
const SkillCard = ({
  name,
  level,
  icon,
  category,
  className,
}: ISkillCardProps) => (
  <div
    className={cn(
      "group flex items-center gap-3 p-3 rounded-lg border",
      "bg-card hover:bg-muted/50 transition-colors",
      className,
    )}
  >
    {icon && (
      <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-sm font-medium text-foreground truncate">
          {name}
        </span>
        {level !== undefined && (
          <span className="text-xs text-muted-foreground">{level}%</span>
        )}
      </div>
      {level !== undefined && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${level}%` }}
          />
        </div>
      )}
      {category && !level && (
        <span className="text-xs text-muted-foreground">{category}</span>
      )}
    </div>
  </div>
);

export default SkillCard;
