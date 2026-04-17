import type { ReactNode } from 'react';

interface IResumeContainerProps {
    children: ReactNode;
}

const ResumeContainer = ({ children }: IResumeContainerProps) => {
    return (
        <main className='relative mx-auto block px-4 py-16 w-full max-w-4xl print:px-0 print:py-0'>
            <article className='relative flex flex-col p-6 sm:p-8 gap-6 w-full text-body text-foreground bg-card border border-border shadow-none print:p-0 print:gap-3 print:bg-background print:border-0'>
                {children}
            </article>
        </main>
    );
};

export default ResumeContainer;
