"use client";

import React from "react";
import { Briefcase, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface IExperienceCardProps {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
  skills?: string[];
  current?: boolean;
  className?: string;
}

/**
 * Experience card for displaying work history
 */
const ExperienceCard = ({
  title,
  company,
  location,
  startDate,
  endDate,
  description,
  skills = [],
  current = false,
  className,
}: IExperienceCardProps) => (
  <div className={cn("relative flex gap-4", className)}>
    {/* Timeline indicator */}
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "size-10 rounded-full flex items-center justify-center shrink-0",
          current ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        <Briefcase className="size-5" />
      </div>
      <div className="w-px flex-1 bg-border mt-2" />
    </div>

    {/* Content */}
    <div className="pb-8 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {company}
            {location && <span> • {location}</span>}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3" />
          <span>
            {startDate} — {endDate ?? "Present"}
          </span>
          {current && (
            <Badge variant="default" className="ml-2 text-xs">
              Current
            </Badge>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{description}</p>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default ExperienceCard;
