import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { getProjects } from '@/server/queries/projects';
import { SITE_CONFIG } from '@/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProjectCard } from '@/components/content/ProjectCard';
import { ProjectsGridSkeleton } from '@/components/feedback/Skeleton';

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
 * Projects List - Server Component
 */
async function ProjectsList() {
  const projects = await getProjects();

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--fg-muted)] text-lg">
          Projects coming soon.
        </p>
      </div>
    );
  }

  // Separate featured and other projects
  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  return (
    <div className="space-y-20">
      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section>
          <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-8">
            Featured Work
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {featuredProjects.map((project, i) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={i}
                featured
              />
            ))}
          </div>
        </section>
      )}

      {/* Other Projects */}
      {otherProjects.length > 0 && (
        <section>
          <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-8">
            More Projects
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {otherProjects.map((project, i) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Projects Page
 * 
 * Showcase of work and side projects.
 * Premium card layout with hover effects.
 */
export default function ProjectsPage() {
  // Get GitHub URL from social links
  const githubUrl = SITE_CONFIG.socials?.find(s => s.platform === 'github')?.url || '#';

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20 md:py-28">
      {/* Page Header */}
      <PageHeader
        label="Work"
        title="Projects"
        description="A collection of projects I've worked on. From open source contributions to side projects and professional work."
      />

      {/* Projects Grid */}
      <Suspense fallback={<ProjectsGridSkeleton />}>
        <ProjectsList />
      </Suspense>

      {/* GitHub CTA */}
      <div className="mt-20 pt-12 border-t border-[var(--border-color)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-[var(--fg-muted)]">
            Want to see more? Check out my GitHub for open source contributions.
          </p>
          <Link
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--fg)] hover:text-[var(--accent)] transition-colors"
          >
            View GitHub
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
