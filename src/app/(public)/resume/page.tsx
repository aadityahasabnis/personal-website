import { RESUME_DATA } from '@/constants/resumeConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { JsonLd, combineSchemas, generateBreadcrumbSchema, generatePersonSchema, generateWebPageSchema, generateWebSiteSchema } from '@/lib/seo';
import { ArrowUpRight, Globe } from 'lucide-react';
import type { Metadata } from 'next';

import { ResumeContainer, ResumeGrid, ResumeHeader, ResumeList, ResumeSection } from '@/components/content/resume';
import { FaGithub } from 'react-icons/fa';

const description = `${RESUME_DATA.profile.name} is a ${RESUME_DATA.profile.role} building scalable, secure, and maintainable web applications with modern engineering practices.`;

const keywordSet = new Set<string>(['resume', RESUME_DATA.profile.name, RESUME_DATA.profile.role, 'full stack engineer', 'typescript', 'next.js', 'system design', 'backend engineering', 'portfolio']);

const resumeOgImage = buildDynamicOgImageUrl({
    title: 'Resume - Aaditya Hasabnis',
    eyebrow: 'Career Profile',
    subtitle: 'Experience, projects, and technical impact across full-stack engineering.',
    tags: ['resume', 'engineering', 'projects', 'experience'],
});

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = createPageMetadata({
    title: 'Resume',
    description,
    canonicalPath: '/resume',
    keywords: Array.from(keywordSet),
    includeAuthor: true,
    includeSocial: true,
    socialType: 'profile',
    imageUrl: resumeOgImage,
    robots: {
        index: true,
        follow: true,
    },
});

const resumeSchema = combineSchemas(
    generatePersonSchema(),
    generateWebSiteSchema(),
    generateWebPageSchema({
        title: 'Resume',
        description,
        path: '/resume',
    }),
    generateBreadcrumbSchema([
        { name: 'Home', url: SITE_CONFIG.url },
        { name: 'Resume', url: `${SITE_CONFIG.url}/resume` },
    ]),
);

const ResumePage = () => {
    type IActivityItem = (typeof RESUME_DATA.activities)[number];

    const groupedActivities = RESUME_DATA.activities.reduce<Record<string, IActivityItem[]>>((accumulator, activity) => {
        const key = activity.company;
        if (!accumulator[key]) {
            accumulator[key] = [];
        }
        accumulator[key].push(activity);
        return accumulator;
    }, {});

    return (
        <>
            <JsonLd data={resumeSchema} />

            <ResumeContainer>
                <ResumeHeader profile={RESUME_DATA.profile} profiles={RESUME_DATA.profiles} />

                <ResumeSection title='Education'>
                    <div className='flex flex-col gap-4'>
                        {RESUME_DATA.education.map((item) => (
                            <article key={item.title} className='flex flex-col gap-1.5'>
                                <div className='flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                                    <div className='flex flex-col gap-0.5'>
                                        <h3 className='text-body font-semibold text-foreground'>{item.title}</h3>
                                        {item.institutionUrl ? (
                                            <a
                                                href={item.institutionUrl}
                                                target='_blank'
                                                rel='noreferrer'
                                                className='inline-flex items-center gap-1 text-small text-muted-foreground transition-fast hover:text-primary'
                                            >
                                                {item.institution}
                                                <ArrowUpRight className='size-3.5' aria-hidden='true' />
                                            </a>
                                        ) : (
                                            <p className='text-small text-muted-foreground'>{item.institution}</p>
                                        )}
                                    </div>
                                    {item.timeline ? <p className='text-small font-medium text-muted-foreground sm:text-right'>{item.timeline}</p> : null}
                                </div>
                                <p className='text-small font-medium text-foreground'>
                                    {item.resultLabel} - {item.resultValue}
                                </p>
                            </article>
                        ))}
                    </div>
                </ResumeSection>

                <ResumeSection title='Skills'>
                    <ResumeGrid
                        groups={[
                            { label: 'Languages', items: RESUME_DATA.skills.languages },
                            { label: 'Frameworks & Backend', items: RESUME_DATA.skills.frameworksAndBackend },
                            { label: 'Databases & Cloud', items: RESUME_DATA.skills.databasesAndCloud },
                        ]}
                    />
                </ResumeSection>

                <ResumeSection title='Professional Experience'>
                    <div className='flex flex-col gap-5'>
                        {RESUME_DATA.experience.map((item) => (
                            <article key={`${item.role}-${item.company}`} className='flex flex-col gap-1.5'>
                                <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                                    <h3 className='text-body font-semibold text-foreground'>
                                        {item.role} -{' '}
                                        {item.companyUrl ? (
                                            <a href={item.companyUrl} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 transition-fast hover:text-primary'>
                                                {item.company}
                                                <ArrowUpRight className='size-3.5' aria-hidden='true' />
                                            </a>
                                        ) : (
                                            item.company
                                        )}
                                    </h3>
                                    <p className='text-small font-medium text-muted-foreground sm:text-right'>{item.duration}</p>
                                </div>
                                <ResumeList items={item.bullets} />
                            </article>
                        ))}
                    </div>
                </ResumeSection>

                <ResumeSection title='Projects'>
                    <div className='flex flex-col gap-5'>
                        {RESUME_DATA.projects.map((project) => (
                            <article key={project.title} className='flex flex-col gap-1.5'>
                                <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                                    <h3 className='text-body font-semibold text-foreground'>
                                        {project.title} - <span className='font-medium'>{project.descriptor}</span>
                                    </h3>
                                    {project.githubUrl || project.liveUrls?.length ? (
                                        <div className='flex items-center justify-start gap-2 sm:justify-end'>
                                            {project.githubUrl ? (
                                                <a
                                                    href={project.githubUrl}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    aria-label={`View ${project.title} source code on GitHub`}
                                                    title='GitHub Repository'
                                                    className='inline-flex items-center gap-1 p-1.5 text-small text-muted-foreground border border-border bg-background transition-fast hover:text-primary hover:border-primary/40'
                                                >
                                                    <FaGithub className='size-3.5' aria-hidden='true' />
                                                    <span className='sr-only sm:not-sr-only'>GitHub</span>
                                                </a>
                                            ) : null}

                                            {project.liveUrls?.map((link) => (
                                                <a
                                                    key={`${project.title}-${link.href}`}
                                                    href={link.href}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    aria-label={`Open ${project.title} ${link.label}`}
                                                    title={`${link.label} URL`}
                                                    className='inline-flex items-center gap-1 p-1.5 text-small text-muted-foreground border border-border bg-background transition-fast hover:text-primary hover:border-primary/40'
                                                >
                                                    <Globe className='size-3.5' aria-hidden='true' />
                                                    <span className='sr-only sm:not-sr-only'>{link.label}</span>
                                                </a>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                                <p className='text-small text-muted-foreground'>{project.stack}</p>
                                <ResumeList items={project.bullets} />
                            </article>
                        ))}
                    </div>
                </ResumeSection>

                <ResumeSection title='Certifications'>
                    <ResumeList items={RESUME_DATA.certifications} />
                </ResumeSection>

                <ResumeSection title='Activities'>
                    <div className='flex flex-col gap-4'>
                        {Object.entries(groupedActivities).map(([company, roles]) => (
                            <article key={company} className='flex flex-col gap-3'>
                                {roles[0]?.companyUrl ? (
                                    <a
                                        href={roles[0].companyUrl}
                                        target='_blank'
                                        rel='noreferrer'
                                        className='inline-flex items-center gap-1 text-body font-semibold text-foreground transition-fast hover:text-primary'
                                    >
                                        {company}
                                        <ArrowUpRight className='size-3.5' aria-hidden='true' />
                                    </a>
                                ) : (
                                    <h3 className='text-body font-semibold text-foreground'>{company}</h3>
                                )}
                                <div className='flex flex-col gap-4'>
                                    {roles.map((item) => (
                                        <div key={`${item.role}-${item.duration}`} className='flex flex-col gap-1.5'>
                                            <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                                                <h4 className='text-body font-semibold text-foreground'>{item.role}</h4>
                                                <p className='text-small font-medium text-muted-foreground sm:text-right'>{item.duration}</p>
                                            </div>
                                            <ResumeList items={item.bullets} />
                                        </div>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </ResumeSection>

                <ResumeSection title='Languages'>
                    <article className='flex flex-col gap-1'>
                        <h3 className='text-body font-semibold text-foreground'>Language Proficiency</h3>
                        <p className='text-small leading-relaxed text-muted-foreground'>{RESUME_DATA.languages}</p>
                    </article>
                </ResumeSection>
            </ResumeContainer>
        </>
    );
};

export default ResumePage;
