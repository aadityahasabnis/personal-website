import React, { useEffect, useRef } from 'react';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { CircleUserRound, CircleX, Eye, ScanSearch, ShieldCheck, Sparkle } from 'lucide-react';

import { IconWrapper } from '../other/IconWrapper';

import  { type MaxWidthDialogType } from './DialogWrapper';

export interface IImageUploadDialogStructure {
    type: 'imageUpload';
    croppedUrl: string | undefined;
    onClose: () => void;
    maxWidth?: MaxWidthDialogType;
}

const gridData = [
    { text: 'Profile Updated', icon: <CircleUserRound className="size-6 text-status-amber" /> },
    { text: 'Visible Everywhere', icon: <Eye className="size-6 text-status-success" /> },
    { text: 'Quick & Secure', icon: <ShieldCheck className="size-6 text-status-violet" /> }
];

const ImageUploadDialog = ({ onClose, croppedUrl }: IImageUploadDialogStructure) => {
    const pathname = usePathname();
    const initialPathRef = useRef(pathname);

    useEffect(() => { if (pathname !== initialPathRef.current) onClose(); }, [pathname]);

    return (
        <div className="relative flex flex-col p-8 gap-5 w-full">
            <button type='button' className="absolute right-4 top-4" onClick={onClose}>
                <CircleX className="size-4 text-status-error transform transition-transform duration-300 hover:rotate-180" />
            </button>

            <div className="flex flex-col overflow-visible items-center text-center gap-8">
                <div className='flex flex-col gap-3 items-center justify-center'>
                    <div className="relative overflow-visible">
                        {croppedUrl ? <React.Fragment>
                            <Sparkle className="absolute top-0 -left-4 size-6 -rotate-12 text-nautical-blue-200 opacity-0 animate-sparkle-burst-1" />
                            <Sparkle className="absolute top-0 -right-8 size-8 rotate-45 text-nautical-blue-200 opacity-0 animate-sparkle-burst-2" />
                            <Sparkle className="absolute bottom-1 -left-10 size-9 -rotate-45 text-nautical-blue-200 opacity-0 animate-sparkle-burst-3" />
                            <Sparkle className="absolute bottom-0 -right-7 size-7 rotate-12 text-nautical-blue-200 opacity-0 animate-sparkle-burst-4" />
                        </React.Fragment> : null}

                        <div className="relative z-10 size-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                            {croppedUrl ?
                                <Image src={croppedUrl} alt="Cropped preview" fill className="object-cover rounded-full" /> :
                                <div className="flex items-center justify-center size-full text-neutral-light"><ScanSearch /></div>
                            }
                        </div>
                    </div>
                    <p className='text-h2 text-neutral-dark'>{croppedUrl ? "You're looking great!" : 'Image Not Selected. Try Again.'}</p>
                </div>

                <p className="text-regular text-neutral-light max-w-sm">{croppedUrl ? 'Your profile photo has been updated successfully. This picture will now be used across your account.' : 'Something went wrong while processing your image. Please try uploading again.'}</p>

                <div className="flex flex-row flex-nowrap justify-center gap-5">
                    {croppedUrl ? gridData.map((item, i) => (<div key={i} className='flex flex-col gap-3 items-center justify-center min-w-20'>
                        <IconWrapper icon={item.icon} variant='neutral' />
                        <p className='text-xs text-neutral-medium text-center'>{item.text}</p>
                    </div>)) : null}
                </div>
            </div>
        </div>
    );
};

export default ImageUploadDialog;
