'use client';
import React, { useMemo } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ArrowLeft, Award, Ban, BellRing, CalendarClock, ChartColumn, CheckCircle, CircleHelp, CircleX, Download, Eye, FileCheck2, FilePlus, FileX2, Layers, LinkIcon, ListCheck, MailPlus, MessagesSquare, Pencil, RefreshCcw, Share2, Target, Trash2, Upload, UserRoundCheck, UserRoundPen, UserRoundPlus, UserRoundSearch, UserRoundX } from 'lucide-react';

import { type IDialogStructure } from '@/common/components/dialogs/DialogWrapper';
import Tooltip from '@/common/components/ui/tooltip';
import { DiscontinueIcon, UserFormerIcon, UserReviewIcon, ViewDocumentIcon } from '@/common/constants/media/icons';
import { useDialog } from '@/common/hooks/useDialog';
import { type IFormData } from '@/common/hooks/useFormOperations';
import { type DialogWithCallback } from '@/common/interfaces/commonInterface';

import { BlockUserIcon, ConveyPPOIcon, NotifyPlacementIcon, RevokeOfferIcon, ShareListIcon, UserCrownIcon } from '@/exclusive/constants/media/icons';

import { type InfiniteTableMutateData } from '../InfiniteTableWrapper';
import { type TableMutateData } from '../TableWrapper';

const ICONS_MAP = {
    addUser: <UserRoundPlus className='text-blue-medium transition-all duration-300 group-hover:rotate-6 group-hover:scale-110' />,
    add: <FilePlus className='text-blue-medium transition-all duration-300 group-hover:rotate-6 group-hover:scale-110' />,
    download: <Download className='text-status-success transition-all duration-300 group-hover:-rotate-4 group-hover:translate-y-1' />,
    notify: <BellRing className='text-status-amber transition-all duration-300 group-hover:text-status-amber-600 group-hover:animate-[subtle-ring_1s_ease-in-out_forwards] group-hover:drop-shadow-lg' />,
    todoList: <ListCheck className='text-blue-medium transition-all duration-300 group-hover:scale-110' />,
    navigateBack: <ArrowLeft className='text-blue-medium transition-all duration-300 group-hover:scale-110 group-hover:-translate-x-0.5' />,
    invite: <MailPlus className='text-blue-medium' />,
    target: <Target className='text-status-violet' />,
    upload: <Upload className='text-blue-medium' />,
    blockUser: <BlockUserIcon className='text-status-error' />,
    unBlockUser: <UserRoundPen className='text-status-success' />,
    userCrown: <UserCrownIcon className='text-status-success' />,
    formerUser: <UserFormerIcon className="text-blue-medium" />,
    searchUser: <UserRoundSearch className='text-blue-medium' />,
    review: <UserReviewIcon className='text-blue-medium' />,
    info: <CircleHelp className='text-blue-medium transition-all duration-300 group-hover:scale-110' />,

    layers: <Layers className="text-blue-medium" />,
    analysis: <ChartColumn className="text-status-violet" />,
    verify: <CheckCircle className="text-status-success" />,
    reject: <CircleX className="text-status-error" />,
    view: <Eye className="text-blue-medium" />,
    edit: <Pencil className="text-status-amber" />,
    calendar: <CalendarClock className="text-blue-medium" />,
    refresh: <RefreshCcw className="text-blue-medium" />,
    placementInvite: <NotifyPlacementIcon className='text-status-violet' />,
    result: <Award className='text-status-success' />,
    verifyUser: <UserRoundCheck className='text-status-success' />,
    viewDocument: <ViewDocumentIcon className='text-blue-medium' />,
    verifyDocument: <FileCheck2 className='text-status-success' />,
    rejectUser: <UserRoundX className='text-status-error' />,
    rejectDocument: <FileX2 className='text-status-error' />,
    message: <MessagesSquare className='text-status-amber' />,
    ban: <Ban className='text-status-error' />,
    delete: <Trash2 className='text-status-error' />,
    link: <LinkIcon className='text-blue-medium' />,
    discontinue: <DiscontinueIcon className='text-status-error' />,
    revokeOffer: <RevokeOfferIcon className='text-status-error' />,
    conveyPPO: <ConveyPPOIcon className='text-status-success' />,
    share: <Share2 className="text-blue-medium" />,
    listRelease: <ShareListIcon className='text-blue-medium' />
};

interface IBaseProps {
    title?: string;
    description: string;
    color?: 'white' | 'black';
    icon: keyof typeof ICONS_MAP;
    hidden?: boolean;
}

interface IButtonProps<TTableOperationBody extends IFormData | undefined = IFormData, TTableOperationResponse extends IFormData | undefined = undefined, TTableOperationDefaultValue extends IFormData | undefined = undefined> extends IBaseProps {
    type: 'button';
    dialogStructure: IDialogStructure<TTableOperationBody, TTableOperationResponse, TTableOperationDefaultValue>;
    disabled?: boolean;
    mutateOnSuccess?: boolean;
    id?: string;
}

interface ILinkProps extends IBaseProps {
    type: 'link';
    link: string;
    referer?: boolean;
    disabled?: boolean;
}

/**
 * CRITICAL: All generic defaults must be IFormData to prevent type resolution issues.
 * TTableOperationResponse = undefined breaks dialog type inference.
 * See: _docs/TYPING_BREAKAGE_DIAGNOSIS_AND_FIX.md
 */
export type ITableOperationsStructure<TTableOperationBody extends IFormData | undefined = IFormData, TTableOperationResponse extends IFormData | undefined = IFormData, TTableOperationDefaultValue extends IFormData | undefined = IFormData> = IButtonProps<TTableOperationBody, TTableOperationResponse, TTableOperationDefaultValue> | ILinkProps;

interface IInfiniteTableOperationsProps<TTableOperationBody extends IFormData | undefined = IFormData, TTableOperationResponse extends IFormData | undefined = IFormData> {
    variant: 'outline' | 'neutral';
    tableOperationsStructure: Array<ITableOperationsStructure<TTableOperationBody, TTableOperationResponse>> | undefined;
    mutateData?: TableMutateData<IFormData> | InfiniteTableMutateData<IFormData>;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const TableOperations = <TTableOperationBody extends IFormData | undefined = undefined, TTableOperationResponse extends IFormData | undefined = undefined>({ tableOperationsStructure, mutateData, className, size, variant }: IInfiniteTableOperationsProps<TTableOperationBody, TTableOperationResponse>) => {
    const pathname = usePathname();
    const { triggerDialog } = useDialog();

    const createDialogWithMutate = <TBodyData extends IDialogStructure>(dialogStructure: TBodyData, id: string | undefined, mutateOnSuccess: boolean): TBodyData => {
        if (!mutateOnSuccess && !('onSuccessCallback' in dialogStructure)) return { id, ...dialogStructure };
        const dialogWithCallback = dialogStructure as DialogWithCallback;
        return {
            id, ...dialogStructure, onSuccessCallback: async (data?: IFormData) => {
                if (dialogWithCallback.onSuccessCallback) await dialogWithCallback.onSuccessCallback(data as never);
                if (mutateOnSuccess && mutateData) await mutateData();
            }
        };
    };

    const operationsList = useMemo(() => {
        return tableOperationsStructure?.filter(field => !field.hidden).map((field, index) => {
            const commonClasses = `${field.disabled ? ' opacity-50' : ''} ${variant === 'neutral' ? `group flex justify-center items-center rounded bg-muted-background hover:bg-muted p-2 ${field.icon === 'add' ? '!bg-blue-light !hover:bg-blue-medium/10' : ''}` : `group flex justify-center items-center rounded border ${(size === 'md' || size === 'lg') ? 'bg-white hover:bg-muted p-2.5' : 'bg-muted-background hover:bg-muted h-fit p-2'} ${field.icon === 'add' ? '!bg-blue-light !hover:bg-blue-medium/10' : ''}`}`;
            const iconClasses = `${ICONS_MAP[field.icon]?.props?.className ?? ''} ${size === 'sm' ? 'size-[18px]' : 'size-5'}`;
            const icon = React.cloneElement(ICONS_MAP[field.icon], { className: iconClasses });

            return (
                <Tooltip key={index} title={field.title} description={field.description} color={field.color}>
                    {field.type === 'button' ?
                        <button className={commonClasses} type='button' disabled={field.disabled} onClick={(e) => { e.stopPropagation(); triggerDialog(createDialogWithMutate(field.dialogStructure as IDialogStructure, field.id, field.mutateOnSuccess ?? false)); }}> {icon} </button> :
                        <div className={field.disabled ? 'cursor-not-allowed' : ''} onClick={(e) => e.stopPropagation()}>
                            <Link prefetch={false} href={field.disabled ? pathname : `${field.link}${field.referer ? `?referer=${encodeURIComponent(pathname)}` : ''}`} className={`${commonClasses} ${field.disabled ? 'pointer-events-none' : ''}`} aria-disabled={field.disabled}> {icon} </Link>
                        </div>
                    }
                </Tooltip>
            );
        });
    }, [tableOperationsStructure, size, pathname, triggerDialog, mutateData]);

    return <div className={`flex gap-3 h-fit ${className}`}>{operationsList}</div>;
};

// Use explicit type assertion to maintain proper generic types
export default React.memo(TableOperations) as typeof TableOperations;
