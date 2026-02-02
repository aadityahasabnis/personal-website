import React, { useEffect, useRef } from 'react';

import { usePathname } from 'next/navigation';

import { CircleX } from 'lucide-react';

import { DialogTitle } from '../ui/dialog';

import { type MaxWidthDialogType } from './DialogWrapper';

export interface IViewDialogStructure {
    type: 'view';

    title: string;
    icon?: React.ElementType;
    subText?: string;

    description?: React.JSX.Element;
    onClose: () => void;
    onCloseCallback?: () => void;
    maxWidth?: MaxWidthDialogType;
}

const ViewDialog: React.FC<IViewDialogStructure> = ({ title, subText, description, onClose, onCloseCallback, icon: Icon }) => {
    const pathname = usePathname();
    const initialPathRef = useRef(pathname);

    useEffect(() => {
        if (pathname !== initialPathRef.current) onClose();
    }, [pathname]);

    const handleClose = () => { onClose(); if (onCloseCallback) onCloseCallback(); };

    return (
        <div className="relative flex flex-col p-5 gap-5 w-full">
            <button type='button' className="absolute right-4 top-4" onClick={handleClose}>
                <CircleX className="size-4 text-status-error transform transition-transform duration-300 hover:rotate-180" />
            </button>

            <div className="flex flex-col xs:flex-row w-full gap-3">
                {Icon ? <Icon className="size-8 xs:size-12 shrink-0" /> : null}
                <div className='flex flex-col gap-1 w-full'>
                    <DialogTitle>{title}</DialogTitle>
                    {subText ? <p className="text-regular text-neutral-light">{subText}</p> : null}
                </div>
            </div>

            <div className='overflow-y-scroll no-scrollbar'>
                {description}
            </div>
        </div>
    );
};

export default ViewDialog;
