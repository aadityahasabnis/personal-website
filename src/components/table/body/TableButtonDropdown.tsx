'use client';
import React, { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isInvalidAndEmptyObject } from '@byteswrite-admin/bep-core/utils';

import { get } from 'lodash';
import { Ellipsis, Loader2 } from 'lucide-react';

import { type IDialogStructure } from '@/common/components/dialogs/DialogWrapper';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/common/components/ui/dropdown-menu';
import useAPIAction, { type IInvalidateEndpoints, type ServerActionConfig } from '@/common/hooks/useAPIAction';
import { useDialog } from '@/common/hooks/useDialog';
import { useDocumentDrawer } from '@/common/hooks/useDocumentDrawer';
import { type IFormData } from '@/common/hooks/useFormOperations';
import { type ISnackbarDescription } from '@/common/hooks/useSnackbar';
import { type DialogWithCallback } from '@/common/interfaces/commonInterface';
import { apiCall } from '@/common/utils/apiCall';

import { type ApiUrl } from '@/exclusive/interfaces/commonInterface';

import NoData from '../../other/NoData';
import { type InfiniteTableMutateData } from '../InfiniteTableWrapper';
import { type TableMutateData } from '../TableWrapper';

interface ILinkDropdownOption {
    type: 'link';
    label: string;
    link: string | undefined;
    id?: boolean;
    labelClassName?: string;
    redirect?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    referer?: boolean;
}

// TODO: need typing on documentURLKey, documentDataKey
interface IDocumentDropdownOption {
    type: 'document';
    label: string;
    apiURL: ApiUrl;
    id?: boolean;
    hidden?: boolean;
    disabled?: boolean;
    labelClassName?: string;
    template: React.JSX.Element;
    documentURLKey: string;
    documentDataKey?: string;
    documentLabel?: string;
}

type IUrlDropdownOption = {
    type: 'url';
    url: string;
    urlId?: never;
    label: string;
    labelClassName?: string;
    disabled?: boolean;
    hidden?: boolean;
} | {
    type: 'url';
    url?: never;
    urlId: string;
    label: string;
    labelClassName?: string;
    disabled?: boolean;
    hidden?: boolean;
};

interface IDialogDropdownOption<TTableResponse extends IFormData = IFormData, TTableRowOperationBody extends IFormData | undefined = IFormData, TTableRowOperationResponse extends IFormData | undefined = IFormData> {
    label: string;
    type: 'dialog';
    id: boolean;
    dialogStructure: IDialogStructure<TTableRowOperationBody, TTableRowOperationResponse, TTableResponse>;
    labelClassName?: string;
    disabled?: boolean;
    mutateOnSuccess?: boolean;
    hidden?: boolean;
}

interface IButtonDropdownOption<TTableResponse extends IFormData = IFormData> {
    type: 'button';
    label: string;
    serverActionStructure: ServerActionConfig<TTableResponse> & { customAction?: never };
    snackbarOptions: ISnackbarDescription;
    invalidateEndpoints?: IInvalidateEndpoints;
    hidden?: boolean;
    disabled?: boolean;
    labelClassName?: string;
    mutateOnSuccess?: boolean;
    id: boolean;
}

interface IDividerDropdownOption {
    type: 'divider';
    hidden?: boolean;
}

export type IDropdownOption<TTableResponse extends IFormData = IFormData, TTableRowOperationBody extends IFormData | undefined = IFormData, TTableRowOperationResponse extends IFormData | undefined = IFormData> = ILinkDropdownOption | IUrlDropdownOption | IDividerDropdownOption | IDocumentDropdownOption | IButtonDropdownOption<TTableResponse> | IDialogDropdownOption<TTableResponse, TTableRowOperationBody, TTableRowOperationResponse>;

interface ITableButtonDropdownProps<TTableResponse extends IFormData, TTableRowOperationBody extends IFormData | undefined, TTableRowOperationResponse extends IFormData | undefined = IFormData> {
    row: TTableResponse;
    options?: Array<IDropdownOption<TTableResponse, TTableRowOperationBody, TTableRowOperationResponse>>;
    label?: string;
    mutateData: InfiniteTableMutateData<TTableResponse> | TableMutateData<TTableResponse>;
    children?: React.ReactNode;
    className?: string;
}

const TableButtonDropdown = <TTableResponse extends IFormData, TTableRowOperationBody extends IFormData | undefined, TTableRowOperationResponse extends IFormData | undefined>({ row, options, label, mutateData, children, className }: ITableButtonDropdownProps<TTableResponse, TTableRowOperationBody, TTableRowOperationResponse> & { className?: string }) => {
    const pathname = usePathname();
    const { triggerDialog } = useDialog();
    const { handleAction, pending } = useAPIAction();
    const { openDocumentDrawer, updateDocumentDrawer } = useDocumentDrawer();
    const [isOpen, setIsOpen] = useState(false);
    const [loadingOptionIndex, setLoadingOptionIndex] = useState<number | null>(null);

    const createDialogWithMutate = <T extends IDialogStructure>(dialogStructure: T, rowId: string | undefined, mutateOnSuccess: boolean): T => {
        if (!mutateOnSuccess && !('onSuccessCallback' in dialogStructure)) return { ...dialogStructure, id: rowId };
        const dialogWithCallback = dialogStructure as DialogWithCallback;
        return {
            ...dialogStructure, id: rowId, onSuccessCallback: async (...args: never) => {
                if (dialogWithCallback.onSuccessCallback) await dialogWithCallback.onSuccessCallback(args);
                if (mutateOnSuccess) await mutateData();
            }
        };
    };

    const onSubmit = async <T extends TTableResponse>(option: IButtonDropdownOption<T>, rowId: string | undefined, optionIndex: number) => {
        setLoadingOptionIndex(optionIndex);
        const url = 'url' in option.serverActionStructure ? (rowId ? `${option.serverActionStructure.url}/${rowId}` : option.serverActionStructure.url) : undefined;
        const actionConfig = url ? { ...option.serverActionStructure, url } : option.serverActionStructure;
        const result = await handleAction({ actionConfig: actionConfig as ServerActionConfig<IFormData>, snackbarOptions: option.snackbarOptions, invalidateEndpoints: option.invalidateEndpoints });
        const success = result ? ('success' in result && result?.success) : false;
        if (success && option.mutateOnSuccess) await mutateData();
        setLoadingOptionIndex(null);
        setIsOpen(false);
    };

    const onDocumentClick = async (option: IDocumentDropdownOption) => {
        openDocumentDrawer({ type: 'custom', title: option.documentLabel ?? option.label, filename: option.documentLabel ?? option.label, children: option.template, isLoading: true });
        const { data, message } = await apiCall<IFormData>({ method: 'GET', url: option.id ? `${option.apiURL}/${row._id}` : option.apiURL });
        if (option.documentURLKey && get(data, option.documentURLKey)) openDocumentDrawer({ type: 'url', title: option.documentLabel ?? option.label, url: get(data, option.documentURLKey), isLoading: false });
        else updateDocumentDrawer({ children: message ? <NoData description={message} /> : (option.documentDataKey && option?.template && get(data, option.documentDataKey)) ? React.cloneElement(option.template, { data: get(data, option.documentDataKey) }) : <NoData />, isLoading: false });
    };

    const renderContent = (option: IDropdownOption<TTableResponse, TTableRowOperationBody, TTableRowOperationResponse>, optionIndex: number) => {

        if (option.type === 'link') return (option.disabled ?? pending) ? <span className={`inline-block px-2 py-1.5 w-full text-neutral-light cursor-not-allowed ${option.labelClassName}`}>{option.label}</span> : <Link prefetch={false} target={option.redirect ? '_blank' : '_self'} referrerPolicy={option.redirect ? 'no-referrer' : 'origin'} className={`px-2 py-1.5 w-full hover:text-status-link ${option.labelClassName}`} href={`${option.link}${option.id ? `/${row._id}` : ''}${option.referer ? `?referer=${encodeURIComponent(pathname)}` : ''}`}>{option.label}</Link>;
        if (option.type === 'url') {
            const url = option.urlId ? row[option.urlId] : option.url;
            const isDisabled = (option.disabled ?? isInvalidAndEmptyObject(url)) || pending;
            return isDisabled ? <span className={`inline-block px-2 py-1.5 w-full text-neutral-light cursor-not-allowed ${option.labelClassName}`}>{option.label}</span> : <Link prefetch={false} target='_blank' referrerPolicy='no-referrer' className={`px-2 py-1.5 w-full hover:text-status-link hover:underline ${option.labelClassName}`} href={url ?? ''}>{option.label}</Link>;
        }
        if (option.type === 'button') {
            const isDisabled = option.disabled ?? false;
            return <button type='button' disabled={isDisabled || pending} className={`flex items-center justify-between gap-2 px-2 py-1.5 size-full text-start ${option.labelClassName} ${isDisabled ? 'text-neutral-light' : ''}`} onClick={async (e) => { e.preventDefault(); await onSubmit(option, option.id ? row._id : undefined, optionIndex); }}>{option.label} {(loadingOptionIndex === optionIndex) ? <Loader2 className='size-3.5 animate-spin' /> : null}</button>;
        }
        if (option.type === 'dialog') {
            const isDisabled = option.disabled ?? false;
            const dialogConfig = createDialogWithMutate(option.dialogStructure as IDialogStructure, option.id ? row._id : undefined, option.mutateOnSuccess ?? false);
            return <button type='button' disabled={isDisabled || pending} className={`px-2 py-1.5 size-full text-start ${option.labelClassName} ${isDisabled ? 'text-neutral-light' : ''}`} onClick={() => triggerDialog(dialogConfig)}>{option.label}</button>;
        }
        if (option.type === 'document') {
            const isDisabled = option.disabled ?? false;
            return <button type='button' disabled={isDisabled || pending} className={`px-2 py-1.5 size-full text-start ${option.labelClassName} ${isDisabled ? 'text-neutral-light' : ''}`} onClick={async () => onDocumentClick(option)}>{option.label}</button>;
        }
        return null;
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className={className}>{children ?? <div className='bg-muted-background hover:bg-muted px-2 py-1 rounded'><Ellipsis className='text-neutral-light size-5' /></div>}</DropdownMenuTrigger>
            {options?.length ? (
                <DropdownMenuContent className={`min-w-52 ${className}`}>
                    {label ? <React.Fragment><DropdownMenuLabel>{label}</DropdownMenuLabel><DropdownMenuSeparator /></React.Fragment> : null}
                    {options.map((option, index) => option.hidden ? null : option.type === 'divider' ? <DropdownMenuSeparator key={index} /> : <DropdownMenuItem key={index} className={`p-0 text-xs ${pending ? 'text-neutral-light' : 'text-neutral-dark'}`} onSelect={(e) => { if (option.type === 'button') e.preventDefault(); }}>{renderContent(option, index)}</DropdownMenuItem>)}
                </DropdownMenuContent>
            ) : null}
        </DropdownMenu>
    );
};

export default TableButtonDropdown;
