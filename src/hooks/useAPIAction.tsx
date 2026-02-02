'use client';
import { startTransition } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { sanitizeFormDataForAPI } from '@/common/helpers/dataHelpers';
import { apiCall, type IApiCallProps, type IApiResponse } from '@/common/utils/apiCall';
import { tableQueryKeys } from '@/common/utils/queryClient';

import { type ApiUrl } from '@/exclusive/interfaces/commonInterface';

import { apiActionLoadingAtom } from '../jotai/atoms';

import { type IFormData } from './useFormOperations';
import { type ISnackbarDescription, useSnackbar } from './useSnackbar';

export interface IInvalidateEndpoints {
    infiniteQueries?: Array<ApiUrl>;
    tableQueries?: Array<ApiUrl>;
    customQueries?: Array<ApiUrl>;
    /** Redis-backed query keys to invalidate (matches url string in useAPIQuery with fetcher) */
    redisFetchers?: Array<string>;
}

export type ServerActionConfig<TResponseData extends IFormData | undefined> = { customAction: () => Promise<IApiResponse<TResponseData>> } | IApiCallProps;

interface IHandleActionParams<TResponseData extends IFormData | undefined> {
    actionConfig: ServerActionConfig<TResponseData>;
    snackbarOptions: TResponseData extends IFormData ? ISnackbarDescription : undefined;
    invalidateEndpoints?: IInvalidateEndpoints;
}

const useAPIAction = () => {
    const { triggerSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const [pending, setPending] = useAtom(apiActionLoadingAtom);

    const handleAction = async <TResponseData extends IFormData | undefined = IFormData>({ actionConfig, snackbarOptions, invalidateEndpoints }: IHandleActionParams<TResponseData>): Promise<TResponseData extends undefined ? undefined : IApiResponse<TResponseData>> => {
        try {
            setPending(true);
            let response: IApiResponse<TResponseData> | undefined;

            if ('customAction' in actionConfig && actionConfig.customAction) {
                const customActionPromise = actionConfig.customAction();
                const formattedPromise = customActionPromise.then(response => response ?? { success: false, status: 500, error: 'No response' });
                await triggerSnackbar(formattedPromise as Promise<IApiResponse>, snackbarOptions);
                response = await customActionPromise;
            } else {
                const apiCallConfig = actionConfig as IApiCallProps;
                const apiPromise = apiCall<TResponseData>({ ...apiCallConfig, ...('body' in apiCallConfig && { body: sanitizeFormDataForAPI(apiCallConfig.body) }) });
                await triggerSnackbar(apiPromise as Promise<IApiResponse>, snackbarOptions);
                response = await apiPromise;
            }

            // Invalidate queries on success
            if (response?.success && invalidateEndpoints) {
                const invalidationPromises: Array<Promise<void>> = [];
                invalidateEndpoints?.infiniteQueries?.forEach(endpoint => invalidationPromises.push(queryClient.invalidateQueries({ queryKey: [...tableQueryKeys.infiniteLists(), endpoint], refetchType: 'all' })));
                invalidateEndpoints?.tableQueries?.forEach(endpoint => invalidationPromises.push(queryClient.invalidateQueries({ queryKey: [...tableQueryKeys.lists(), endpoint], refetchType: 'all' })));
                invalidateEndpoints?.customQueries?.forEach(endpoint => invalidationPromises.push(queryClient.invalidateQueries({ queryKey: [endpoint], refetchType: 'all' })));
                invalidateEndpoints?.redisFetchers?.forEach(key => invalidationPromises.push(queryClient.invalidateQueries({ queryKey: [key], refetchType: 'all', exact: false })));
                await Promise.all(invalidationPromises);
            }

            return response as TResponseData extends undefined ? undefined : IApiResponse<TResponseData>;
        } catch (error) {
            const errorResponse = { success: false, error: `An unexpected Error Occurred: ${error}`, status: 500 };
            await triggerSnackbar(Promise.resolve(errorResponse), snackbarOptions);
            return errorResponse as TResponseData extends undefined ? undefined : IApiResponse<TResponseData>;

        } finally { startTransition(() => setPending(false)); }
    };

    return { handleAction, pending };
};

export default useAPIAction;
