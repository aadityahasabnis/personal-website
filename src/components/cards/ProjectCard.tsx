"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface IProjectCardProps {
  title: string;
  description: string;
  image?: string;
  tags: string[];
  href?: string;
  githubUrl?: string;
  featured?: boolean;
  className?: string;
}

/**
 * Project card for showcasing portfolio work
 */
const ProjectCard = ({
  title,
  description,
  image,
  tags,
  href,
  githubUrl,
  featured = false,
  className,
}: IProjectCardProps) => (
  <div
    className={cn(
      "group relative bg-card border rounded-xl overflow-hidden",
      "transition-all duration-300 hover:shadow-lg hover:border-primary/30",
      featured && "md:col-span-2",
      className,
    )}
  >
    {/* Image */}
    {image && (
      <div className="relative w-full aspect-video overflow-hidden bg-muted">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>
    )}

    {/* Content */}
    <div className="p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex gap-2">
          {githubUrl && (
            <Link
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
              aria-label="View on GitHub"
            >
              <Github className="size-4" />
            </Link>
          )}
          {href && (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              aria-label="View project"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, 4).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
        {tags.length > 4 && (
          <Badge variant="outline" className="text-xs">
            +{tags.length - 4}
          </Badge>
        )}
      </div>
    </div>
  </div>
);

export default ProjectCard;
