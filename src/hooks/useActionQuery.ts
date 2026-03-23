'use client';

import { useQuery, type QueryKey, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import type { IApiResponse, IFormData } from '@/interfaces/actionHelper';

type ActionQueryFn<TData, TArgs extends unknown[]> = (...args: TArgs) => Promise<IApiResponse<TData>>;

export interface IUseActionQueryOptions<TData, TSelected = TData, TArgs extends unknown[] = []>
    extends Omit<UseQueryOptions<TData, Error, TSelected, QueryKey>, 'queryKey' | 'queryFn'> {
    queryKey: QueryKey;
    action: ActionQueryFn<TData, TArgs>;
    args?: TArgs;
}

export const useActionQuery = <TData = IFormData, TSelected = TData, TArgs extends unknown[] = []>(
    options: IUseActionQueryOptions<TData, TSelected, TArgs>,
): UseQueryResult<TSelected, Error> => {
    const { queryKey, action, args, enabled = true, ...queryOptions } = options;

    return useQuery<TData, Error, TSelected>({
        queryKey,
        queryFn: async () => {
            const response = await action(...(args ?? ([] as unknown as TArgs)));
            if (!response.success) {
                throw new Error(response.error);
            }
            return response.data;
        },
        enabled,
        ...queryOptions,
    });
};