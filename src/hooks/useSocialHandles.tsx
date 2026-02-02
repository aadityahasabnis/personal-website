'use client';
import React, { useLayoutEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { type RecruiterSocialHandle, type StudentSocialHandle } from '@byteswrite-admin/bep-core/constants';
import { TypedObject } from '@byteswrite-admin/bep-core/interfaces';
import { isValidURL } from '@byteswrite-admin/bep-core/utils';

import { isEqual } from 'lodash';
import { CircleUserRound, Plus, X } from 'lucide-react';

import CustomSelect, { type ISelectOption } from '@/common/components/custom/CustomSelect';
import { Button } from '@/common/components/ui/button';
import Input from '@/common/components/ui/input';

import { type ISocialHandleData, socialHandlesDataMap } from '@/exclusive/components/other/SocialHandles';
import { type AccessPointPath } from '@/exclusive/interfaces/commonInterface';

import { studentSocialHandlesGrouped, studentSocialHandlesLabels } from '../constants/options/labels';

import { type IHandleChange } from './useFormOperations';

type SocialHandleProps =
    | { userType: AccessPointPath; defaultValues?: ISocialHandleData; onSubmit: (links: ISocialHandleData) => void; name?: never; onChange?: never }
    | { userType: AccessPointPath; defaultValues?: ISocialHandleData; onSubmit?: never; name: string; onChange: IHandleChange }

interface ISocialHandle {
    portal: string;
    url: string;
}

const useSocialHandles = ({ userType, defaultValues, onSubmit, name, onChange }: SocialHandleProps) => {
    const [socialHandles, setSocialHandles] = useState<ISocialHandleData>(defaultValues);
    const [newSocialHandle, setNewSocialHandle] = useState<{ type?: StudentSocialHandle | RecruiterSocialHandle; url?: string } | undefined>();
    const isFirstRender = useRef(true);

    useLayoutEffect(() => {
        if (isFirstRender.current && defaultValues && TypedObject.values(defaultValues).some(value => value !== null && value !== undefined && value !== '')) {
            setSocialHandles(defaultValues);
            isFirstRender.current = false;
        }
    }, [defaultValues]);

    const addSocialHandle = () => {
        if (!newSocialHandle?.url || !newSocialHandle?.type || !isValidURL(newSocialHandle?.url)) return;
        const updatedSocialHandles = { ...socialHandles, [newSocialHandle.type]: newSocialHandle.url };
        if (onChange) onChange({ target: { name, value: updatedSocialHandles } });

        setSocialHandles(updatedSocialHandles);
        setNewSocialHandle(undefined);
    };

    const removeSocialHandle = (type: StudentSocialHandle | RecruiterSocialHandle) => setSocialHandles((prevSocialHandles) => {
        if (!prevSocialHandles) return prevSocialHandles;

        const updatedSocialHandles = { ...prevSocialHandles };
        delete updatedSocialHandles[type as keyof ISocialHandleData];
        if (onChange) onChange({ target: { name, value: updatedSocialHandles } });

        return updatedSocialHandles;
    });

    const { icons, labels } = socialHandlesDataMap(userType);

    const isSocialHandleAvailable = (key: string) => !(key in (socialHandles ?? {}));

    const socialHandleOptions: Record<string, Array<ISelectOption<string>>> | Array<ISelectOption<string>> = userType === 'student'
        ? TypedObject.keys(studentSocialHandlesGrouped).reduce<Record<string, Array<ISelectOption<string>>>>((acc, group) => {
            const options = studentSocialHandlesGrouped?.[group]?.filter(isSocialHandleAvailable)?.map(key => ({ value: key, label: studentSocialHandlesLabels[key] }));
            if (options?.length) acc[group] = options;
            return acc;
        }, {}) : TypedObject.keys(labels).filter(isSocialHandleAvailable).map(key => ({ value: key, label: labels[key] }));

    const renderSocialHandlesForm = ({ className, linksClassName, submitLabel = 'Submit' }: { className?: string; linksClassName?: string; submitLabel?: string } = {}) => (
        <div className={`flex flex-col gap-8 h-fit w-full p-5 border bg-white rounded-md ${className}`}>
            <div className="flex flex-col gap-3">
                <span className="text-h5 text-neutral-dark">{userType === 'student' ? 'Professional Portfolio' : 'Social Handles'}</span>
                <div className="flex flex-col gap-3">
                    <CustomSelect<ISocialHandle> value={newSocialHandle?.type ?? ''} name='portal' placeholder="Select a social handle" options={socialHandleOptions}
                        onChange={(e) => setNewSocialHandle({ ...newSocialHandle, type: e.target.value as never })} noOptionsFoundMessage='No more options available' />

                    <div className="flex gap-3">
                        <Input<ISocialHandle> name='url' inputType="url" placeholder="Enter URL" className="w-full" inputMode='url'
                            value={newSocialHandle?.url ?? ''} onChange={(e) => setNewSocialHandle({ ...newSocialHandle, url: e.target.value as string })}
                            onKeyDown={(e) => { if (e.key === 'Enter' && newSocialHandle?.type && isValidURL(newSocialHandle?.url)) { e.preventDefault(); addSocialHandle(); } }} />
                        <Button buttonType='icon' size='lg' disabled={!newSocialHandle?.url || !newSocialHandle?.type || !isValidURL(newSocialHandle?.url)} onClick={addSocialHandle} variant='outline' icon={<Plus className="size-5 text-neutral-dark" />} className='shrink-0' />
                    </div>
                </div>
            </div>

            {socialHandles && TypedObject.values(socialHandles).some(link => link) ? (
                <div className={`flex flex-col gap-3 ${linksClassName}`}>
                    {TypedObject.entries(socialHandles)?.map(([socialHandleType, link], index) => link &&
                        <div key={index} className="flex items-center gap-3 bg-white rounded p-3 border">
                            {React.createElement(icons[socialHandleType] ?? CircleUserRound, { className: 'size-5' })}
                            <Link prefetch={false} href={link ?? ''} target="_blank" rel="noopener noreferrer"
                                className="flex-1 line-clamp-1 wrap-break-word text-neutral-medium hover:text-blue-medium transition-colors">
                                {link}
                            </Link>
                            <Button buttonType='icon' variant='ghost' size='sm' className='size-6' onClick={() => removeSocialHandle(socialHandleType)} icon={<X className="size-3.5 text-neutral-light hover:text-neutral-medium" />} />
                        </div>)}
                </div>
            ) : null}

            {onSubmit ? <div className='flex gap-5 self-end'>
                <Button type='reset' variant='outline' disabled={isEqual(socialHandles, defaultValues)} onClick={() => setSocialHandles(defaultValues)} className='w-32'>Discard</Button>
                <Button disabled={isEqual(socialHandles, defaultValues)} onClick={() => onSubmit(socialHandles)} className='w-32'>{submitLabel}</Button>
            </div> : null}
        </div>
    );

    return { renderSocialHandlesForm, links: socialHandles };
};

export default useSocialHandles;
