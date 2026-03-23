'use client';

import { Button } from '@/components/ui/button';

interface IErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

const Error = ({ error, reset }: IErrorProps) => {
    const handleGoHome = () => {
        window.location.href = '/';
    };

    return (
        <main className='flex flex-col items-center justify-center gap-6 px-4 min-h-100' role='alert' aria-live='polite'>
            <div className='flex flex-col items-center gap-2 text-center'>
                <h2 className='text-h1 text-foreground'>Something went wrong</h2>
                <p className='max-w-md text-regular text-muted-foreground'>An unexpected error occurred. Please try again or contact support if the problem persists.</p>
                {process.env.NODE_ENV === 'development' && <pre className='overflow-auto mt-4 p-4 max-w-lg text-sm bg-muted rounded-lg'>{error.message}</pre>}
            </div>
            <div className='flex gap-3'>
                <Button onClick={reset} variant='default'>
                    Try again
                </Button>
                <Button onClick={handleGoHome} variant='outline'>
                    Go home
                </Button>
            </div>
        </main>
    );
};

export default Error;
