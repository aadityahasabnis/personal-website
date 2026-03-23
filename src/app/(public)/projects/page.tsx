import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { getProjects } from '@/server/queries/projects';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProjectCard } from '@/components/content/project/ProjectCard';
import type { IProject } from '@/interfaces/schema';

const description = `Projects and work by ${SITE_CONFIG.author.name}. Open source contributions, side projects, and professional work.`;

export const metadata: Metadata = {
  title: 'Projects',
  description,
  keywords: ['projects', 'open source', 'side projects', 'web development', SITE_CONFIG.author.name].join(', '),
  alternates: {
    canonical: `${SITE_CONFIG.url}/projects`,
  },
  openGraph: {
    title: `Projects | ${SITE_CONFIG.name}`,
    description,
    url: `${SITE_CONFIG.url}/projects`,
    siteName: SITE_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [{ url: `${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}`, width: 1200, height: 630, alt: 'Projects' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Projects | ${SITE_CONFIG.name}`,
    description,
    creator: SITE_CONFIG.seo.twitterHandle,
    site: SITE_CONFIG.seo.twitterHandle,
    images: [`${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}`],
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
        <div className="text-center py-20">
          <p className="text-[var(--fg-muted)] text-lg">
            Projects coming soon.
          </p>
        </div>
      )}

      {/* Projects Sections */}
      {hasProjects && (
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
      )}

      {/* GitHub CTA */}
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
    </div>
  );
}
