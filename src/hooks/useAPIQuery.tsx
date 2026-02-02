'use client';
import { useQuery ,type  UseQueryResult } from '@tanstack/react-query';

import { REACT_QUERY_CONFIG } from '@/common/constants/reactQueryConstants';
import { apiCall } from '@/common/utils/apiCall';

import  { type ApiUrl } from '@/exclusive/interfaces/commonInterface';

import  { type IFormData } from './useFormOperations';

interface IWithFetcher<TFetcher extends (...args: ReadonlyArray<never>) => Promise<unknown>> {
    url: ApiUrl | undefined | string;
    fetcher: TFetcher;
    staleTime?: number;
    gcTime?: number;
    enabled?: boolean;
}

interface IWithoutFetcher {
    url: ApiUrl | undefined;
    staleTime?: number;
    gcTime?: number;
    enabled?: boolean;
}

type InferQueryResult<TOptions, T> = TOptions extends IWithFetcher<infer TFetcher>
    ? TFetcher extends (...args: ReadonlyArray<never>) => Promise<infer TReturn> ? UseQueryResult<TReturn, Error> : never
    : UseQueryResult<T, Error>;

export const useAPIQuery = <T extends IFormData = IFormData, TOptions extends IWithFetcher<(...args: ReadonlyArray<never>) => Promise<unknown>> | IWithoutFetcher = IWithoutFetcher>(options: TOptions): InferQueryResult<TOptions, T> => {
    const { url, staleTime, gcTime, enabled = true } = options;
    const hasFetcher = 'fetcher' in options;

    return useQuery({
        queryKey: hasFetcher ? [String(url)] : [url],
        queryFn: hasFetcher ? async () => (options as Extract<TOptions, { fetcher: unknown }>).fetcher() : async () => (await apiCall<T>({ url: url as ApiUrl, method: 'GET' }))?.data,
        enabled: enabled && !!url,
        staleTime: staleTime ?? REACT_QUERY_CONFIG.apiQueryStaleTime,
        gcTime: gcTime ?? REACT_QUERY_CONFIG.apiQueryGcTime,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: (failureCount) => failureCount < REACT_QUERY_CONFIG.apiQueryMaxRetries,
        retryDelay: REACT_QUERY_CONFIG.apiQueryRetryDelay
    }) as InferQueryResult<TOptions, T>;
};
