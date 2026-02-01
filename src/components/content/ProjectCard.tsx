'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Github, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IProject } from '@/interfaces';

interface IProjectCardProps {
  project: IProject;
  index?: number;
  featured?: boolean;
}

/**
 * Premium Project Card
 * 
 * Showcase card for projects with image, tags, and links.
 * Features hover animations and gradient accents.
 */
export const ProjectCard = ({ project, index = 0, featured = false }: IProjectCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div
        className={cn(
          'relative rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden',
          'transition-all duration-500',
          'hover:border-[var(--border-hover)] hover:shadow-xl',
          'dark:hover:shadow-[0_0_50px_-15px_var(--glow-color)]',
        )}
      >
        {/* Project Image/Preview */}
        <div className="relative aspect-video overflow-hidden bg-[var(--surface)]">
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl font-light text-[var(--fg-subtle)]">
                {project.title.charAt(0)}
              </div>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] via-transparent to-transparent opacity-60" />
          
          {/* Status badge */}
          {project.status === 'wip' && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/20 text-[var(--accent)] backdrop-blur-sm">
                In Progress
              </span>
            </div>
          )}
          
          {/* Featured badge */}
          {featured && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--fg)]/10 text-[var(--fg)] backdrop-blur-sm">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-[var(--fg-muted)]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-medium text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
            {project.title}
          </h3>

          {/* Description */}
          <p className="mt-3 text-[var(--fg-muted)] line-clamp-2">
            {project.description}
          </p>

          {/* Links */}
          <div className="flex items-center gap-4 mt-6">
            {project.githubUrl && (
              <Link
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--fg)] hover:text-[var(--accent)] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="size-4" />
                <span>Code</span>
              </Link>
            )}
            {project.liveUrl && (
              <Link
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--fg)] hover:text-[var(--accent)] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="size-4" />
                <span>Live</span>
              </Link>
            )}
          </div>
        </div>

        {/* Hover arrow */}
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <ArrowUpRight className="size-5 text-[var(--accent)]" />
        </div>
      </div>
    </motion.article>
  );
};

export default ProjectCard;
