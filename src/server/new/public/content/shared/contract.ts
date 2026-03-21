import type { IApiResponse } from '@/interfaces/actionHelper';

export interface IReadContract {
    byPath: (...args: any[]) => Promise<IApiResponse<unknown | null>>;
    byId: (contentId: string) => Promise<IApiResponse<unknown | null>>;
    list: (...args: any[]) => Promise<IApiResponse<unknown[]>>;
    staticPaths: (...args: any[]) => Promise<IApiResponse<unknown[]>>;
}

export const defineReadContract = <TContract extends IReadContract>(contract: TContract): TContract => {
    return contract;
};
