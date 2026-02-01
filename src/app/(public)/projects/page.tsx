import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { getProjects } from '@/server/queries/projects';
import { SITE_CONFIG } from '@/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProjectCard } from '@/components/content/ProjectCard';
import { FadeIn, FadeInStagger, StaggerItem } from '@/components/animation/FadeIn';
import type { IProject } from '@/interfaces';

export const metadata: Metadata = {
  title: 'Projects',
  description: `Projects and work by ${SITE_CONFIG.author.name}. Open source contributions, side projects, and professional work.`,
  openGraph: {
    title: `Projects | ${SITE_CONFIG.name}`,
    description: `Projects and work by ${SITE_CONFIG.author.name}. Open source contributions, side projects, and professional work.`,
  },
};

// ISR: Revalidate every hour
export const revalidate = 3600;

/**
 * Helper to transform MongoDB projects to plain objects
 */
function transformProject(project: any): IProject {
  return {
    _id: project._id?.toString(),
    slug: project.slug,
    title: project.title,
    description: project.description,
    longDescription: project.longDescription,
    coverImage: project.coverImage,
    tags: project.tags || [],
    techStack: project.techStack || [],
    githubUrl: project.githubUrl || project.github || project.repoUrl, // Support legacy fields
    liveUrl: project.liveUrl || project.live, // Support legacy fields
    featured: project.featured,
    status: project.status,
    order: project.order,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

/**
 * Projects Page
 * 
 * Showcase of work and side projects.
 * Premium card layout with hover effects.
 * Static rendering with fade animations.
 */
export default async function ProjectsPage() {
  // Fetch all projects at build time
  const projects = await getProjects();

  // Transform projects to plain objects and separate featured
  const transformedProjects = projects.map(transformProject);
  const featuredProjects = transformedProjects.filter((p) => p.featured);
  const otherProjects = transformedProjects.filter((p) => !p.featured);

  // Get GitHub URL from social links
  const githubUrl = SITE_CONFIG.socials?.find(s => s.name.toLowerCase() === 'github')?.url || '#';

  const hasProjects = transformedProjects.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 md:py-32">
      {/* Page Header */}
      <PageHeader
        label="Work"
        title="Projects"
        description="Open source contributions, side projects, and experiments in web development."
      />

      {/* Empty State */}
      {!hasProjects && (
        <FadeIn delay={0.3}>
          <div className="text-center py-20">
            <p className="text-[var(--fg-muted)] text-lg">
              Projects coming soon.
            </p>
          </div>
        </FadeIn>
      )}

      {/* Projects Sections */}
      {hasProjects && (
        <div className="space-y-20">
          {/* Featured Projects */}
          {featuredProjects.length > 0 && (
            <FadeIn as="section" delay={0.3}>
              <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-8">
                Featured Work
              </h2>
              <FadeInStagger className="grid gap-8 md:grid-cols-2">
                {featuredProjects.map((project, i) => (
                  <StaggerItem key={project.slug}>
                    <ProjectCard
                      project={project}
                      index={i}
                      featured
                    />
                  </StaggerItem>
                ))}
              </FadeInStagger>
            </FadeIn>
          )}

          {/* Other Projects */}
          {otherProjects.length > 0 && (
            <FadeIn as="section" delay={featuredProjects.length > 0 ? 0.5 : 0.3}>
              <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-8">
                More Projects
              </h2>
              <FadeInStagger className="grid gap-8 md:grid-cols-2">
                {otherProjects.map((project, i) => (
                  <StaggerItem key={project.slug}>
                    <ProjectCard
                      project={project}
                      index={i}
                    />
                  </StaggerItem>
                ))}
              </FadeInStagger>
            </FadeIn>
          )}
        </div>
      )}

      {/* GitHub CTA */}
      <FadeIn delay={hasProjects ? 0.7 : 0.5}>
        <div className="mt-20 text-center">
          <p className="text-[var(--fg-muted)] mb-6">
            Want to see more? Check out my GitHub for additional projects.
          </p>
          <Link
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--fg)] text-[var(--bg)] font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowUpRight className="size-5" />
            View on GitHub
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
