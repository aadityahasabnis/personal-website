import { Download } from 'lucide-react';
import Image from 'next/image';

import type { IResumeLink, IResumeProfile } from '@/constants/resumeConstants';
import { SOCIAL_LINKS } from '@/constants/siteConstants';

interface IResumeHeaderProps {
    profile: IResumeProfile;
    profiles: readonly IResumeLink[];
}

const ResumeHeader = ({ profile, profiles }: IResumeHeaderProps) => {
    const profileSocials = profiles
        .map((profileLink) => SOCIAL_LINKS.find((socialLink) => socialLink.platform.toLowerCase() === profileLink.label.toLowerCase()))
        .filter((item): item is (typeof SOCIAL_LINKS)[number] => Boolean(item));

    return (
        <header className='relative flex flex-col gap-3'>
            <div className='relative grid items-start gap-3 grid-cols-[minmax(0,1fr)_112px] md:gap-4 md:grid-cols-[minmax(0,1fr)_160px]'>
                <div className='flex flex-col gap-2.5'>
                    <div className='flex flex-col gap-1 text-left'>
                        <h1 className='text-title font-semibold leading-none tracking-tight text-foreground'>{profile.name}</h1>
                        <p className='text-h5 font-semibold text-foreground'>{profile.role}</p>
                    </div>

                    <div className='flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-small text-foreground'>
                        <a href={`mailto:${profile.email}`} className='transition-fast hover:text-primary'>
                            {profile.email}
                        </a>
                        <span aria-hidden='true' className='text-muted-foreground'>
                            |
                        </span>
                        <p>{profile.location}</p>
                        {profileSocials.map((item) => (
                            <span key={item.id} className='inline-flex items-center gap-2'>
                                <span aria-hidden='true' className='text-muted-foreground'>
                                    |
                                </span>
                                <a href={item.url} target='_blank' rel='noreferrer' aria-label={item.ariaLabel} title={item.platform} className='transition-fast hover:text-primary'>
                                    {item.platform}
                                </a>
                            </span>
                        ))}
                    </div>

                    <div className='hidden p-3 border border-border bg-background sm:block md:p-4'>
                        <p className='text-small leading-relaxed text-left text-muted-foreground'>{profile.summary}</p>
                    </div>
                </div>

                <aside className='flex justify-start md:justify-end'>
                    <div className='relative w-24 h-32 overflow-hidden border border-border bg-background md:w-32 md:h-44'>
                        <Image src={profile.avatarSrc} alt={`${profile.name} profile photo`} fill sizes='(min-width: 768px) 128px, 96px' className='object-cover' priority />
                    </div>
                </aside>
            </div>

            <div className='p-3 border border-border bg-background sm:hidden'>
                <p className='text-small leading-relaxed text-left text-muted-foreground'>{profile.summary}</p>
            </div>

            <div className='flex justify-start'>
                <a
                    href={profile.resumePdfUrl}
                    download
                    className='inline-flex items-center justify-center gap-2 px-4 py-2 w-full text-label font-semibold text-foreground border border-border bg-background transition-fast hover:border-primary/40 hover:text-primary sm:w-auto'
                >
                    Download Resume
                    <Download className='size-4' aria-hidden='true' />
                </a>
            </div>
        </header>
    );
};

export default ResumeHeader;
