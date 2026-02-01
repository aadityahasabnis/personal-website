'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import { FadeIn, StaggerChildren } from '@/components/motion';
import type { IProject } from '@/interfaces';

interface IFeaturedProjectsProps {
  projects: IProject[];
}

/**
 * Featured Projects Section for homepage
 */
export const FeaturedProjects = ({ projects }: IFeaturedProjectsProps) => {
  if (!projects?.length) return null;

  return (
    <section className="py-24 relative bg-[var(--bg-subtle)]">
      <div className="container-wide">
        {/* Section Header */}
        <FadeIn className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="label text-[var(--accent)] mb-2 block">Portfolio</span>
            <h2 className="heading-2 text-[var(--fg)]">
              Featured Projects
            </h2>
          </div>
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
          >
            View all projects
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </FadeIn>

        {/* Projects Grid */}
        <StaggerChildren className="grid gap-8 md:grid-cols-2">
          {projects.slice(0, 4).map((project) => (
            <ProjectCard key={project._id?.toString() ?? project.slug} project={project} />
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
};

interface IProjectCardProps {
  project: IProject;
}

const ProjectCard = ({ project }: IProjectCardProps) => {
  // Prepare image URL
  const imageUrl = project.coverImage;
  // Use techStack or tags as fallback
  const techItems = project.techStack ?? project.tags ?? [];
  // Prepare URLs
  const liveLink = project.liveUrl;
  // Get github link
  const repoLink = project.githubUrl;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group card-premium overflow-hidden"
    >
      {/* Project Image */}
      {imageUrl && (
        <div className="relative aspect-video mb-6 rounded-xl overflow-hidden bg-[var(--surface)]">
          <Image
            src={imageUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col">
        {/* Tech Stack */}
        {techItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {techItems.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--surface)] text-[var(--fg-muted)]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="heading-4 text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors mb-2">
          {project.title}
        </h3>

        {/* Description */}
        {project.description && (
          <p className="body-base text-[var(--fg-muted)] line-clamp-2 mb-6">
            {project.description}
          </p>
        )}

        {/* Links */}
        <div className="flex items-center gap-4 mt-auto">
          {liveLink && (
            <a
              href={liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors body-small font-medium"
            >
              <ExternalLink className="size-4" />
              Live Demo
            </a>
          )}
          {repoLink && (
            <a
              href={repoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors body-small font-medium"
            >
              <Github className="size-4" />
              Source
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default FeaturedProjects;
