"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type ActivityType = "create" | "update" | "delete" | "view" | "other";

interface IActivityCardProps {
  title: string;
  description?: string;
  timestamp: Date | string;
  type?: ActivityType;
  icon?: React.ReactNode;
  className?: string;
}

const typeColors: Record<ActivityType, string> = {
  create: "bg-green-500",
  update: "bg-blue-500",
  delete: "bg-red-500",
  view: "bg-gray-400",
  other: "bg-primary",
};

/**
 * Activity card for timeline/activity feeds
 */
export const ActivityCard: React.FC<IActivityCardProps> = ({
  title,
  description,
  timestamp,
  type = "other",
  icon,
  className,
}) => {
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors",
        className,
      )}
    >
      <div className="flex flex-col items-center">
        <div className={cn("size-2 rounded-full shrink-0", typeColors[type])} />
        <div className="w-px flex-1 bg-border mt-2" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium truncate">{title}</span>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {timeAgo}
          </span>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;
