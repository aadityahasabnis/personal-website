'use client';

import React, { useState } from 'react';

import Link from 'next/link';

import { TypedObject } from '@byteswrite-admin/bep-core/interfaces';

import { Check, CircleUserRound, Copy, Mail, Phone } from 'lucide-react';

import { ScrollArea } from '@/common/components/ui/scroll-area';
import Tooltip from '@/common/components/ui/tooltip';
import { studentSocialHandlesIcons } from '@/common/constants/media/logos';
import { studentSocialHandlesLabels } from '@/common/constants/options/labels';

import { type StudentData } from '@/app/(public)/grid-sheet/jobPosts/_table/constants';

interface IContactDialogProps {
    student: StudentData;
}

const CopyableField = ({ value, label, icon: Icon, bgColor, iconBgColor, iconColor }: { value: string | number; label: string; icon: React.ElementType; bgColor: string; iconBgColor: string; iconColor: string }): React.ReactElement => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(String(value));
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* ignore */ }
    };

    return (
        <Tooltip description={copied ? 'Copied!' : 'Click to copy'}>
            <button type="button" onClick={handleCopy} className={`flex items-center gap-3 p-3 rounded-lg ${bgColor} border w-full text-left group transition-all hover:scale-[1.01] active:scale-[0.99]`}>
                <div className={`flex items-center justify-center size-8 rounded ${iconBgColor} ${iconColor}`}>
                    {copied ? <Check className="size-4 text-green-600" /> : <Icon className="size-4" />}
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-xs text-neutral-500">{label}</span>
                    <span className="text-sm font-medium text-neutral-900 truncate">{value}</span>
                </div>
                <Copy className="size-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
        </Tooltip>
    );
};

const ContactDialog = ({ student }: IContactDialogProps): React.ReactElement => {
    const socialLinks = student.socialLinkInfo
        ? TypedObject.entries(student.socialLinkInfo).filter(([_, url]) => url)
        : [];

    return (
        <ScrollArea className="max-h-[60dvh]">
            <div className="flex flex-col gap-6">
                {/* Email & Phone Section */}
                <div className="flex flex-col gap-3">
                    <h6 className="text-sm font-semibold text-neutral-700">Contact Details</h6>
                    <div className="flex flex-col gap-2">
                        {/* Official Email */}
                        {student.officialEmailId ? (
                            <CopyableField value={student.officialEmailId} label="Official Email ID" icon={Mail} bgColor="bg-blue-50/50 border-blue-100" iconBgColor="bg-blue-100" iconColor="text-blue-600" />
                        ) : null}

                        {/* Personal Email */}
                        {student.personalInfo?.emailId ? (
                            <CopyableField value={student.personalInfo.emailId} label="Personal Email ID" icon={Mail} bgColor="bg-purple-50/50 border-purple-100" iconBgColor="bg-purple-100" iconColor="text-purple-600" />
                        ) : null}

                        {/* Phone */}
                        {student.personalInfo?.phNo ? (
                            <CopyableField value={student.personalInfo.phNo} label="Phone Number" icon={Phone} bgColor="bg-emerald-50/50 border-emerald-100" iconBgColor="bg-emerald-100" iconColor="text-emerald-600" />
                        ) : null}

                        {/* Alternate Phone */}
                        {student.personalInfo?.alternatePhNo ? (
                            <CopyableField value={student.personalInfo.alternatePhNo} label="Alternate Phone Number" icon={Phone} bgColor="bg-teal-50/50 border-teal-100" iconBgColor="bg-teal-100" iconColor="text-teal-600" />
                        ) : null}
                    </div>
                </div>

                {/* Social Links Section */}
                {socialLinks.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        <h6 className="text-sm font-semibold text-neutral-700">Social Handles</h6>
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                            {socialLinks.map(([key, url]) => {
                                const Icon = studentSocialHandlesIcons[key];
                                const label = studentSocialHandlesLabels[key];
                                return Icon && url ? (
                                    <Link prefetch={false}
                                        key={key}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex flex-col items-center justify-center text-center gap-2 p-3 hover:bg-muted rounded-lg transition-colors border border-neutral-200"
                                    >
                                        {React.createElement(Icon ?? CircleUserRound, {
                                            className: 'size-6 group-hover:scale-105 transition-all'
                                        })}
                                        <span className="text-xs text-neutral-600 break-all text-balance">{label || key}</span>
                                    </Link>
                                ) : null;
                            })}
                        </div>
                    </div>
                ) : null}
            </div>
        </ScrollArea>
    );
};

export default ContactDialog;
