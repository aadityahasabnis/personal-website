import type { ReactNode } from 'react';

interface IResumeSectionProps {
    title: string;
    children: ReactNode;
}

const ResumeSection = ({ title, children }: IResumeSectionProps) => {
    return (
        <section aria-label={title} className='relative flex flex-col gap-2.5'>
            <h2 className='pb-1 text-h5 font-semibold uppercase tracking-[0.08em] text-primary border-b border-border'>{title}</h2>
            {children}
        </section>
    );
};

export default ResumeSection;
