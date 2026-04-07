'use server';

import { env } from '@/env';
import type { IApiResponse } from '@/interfaces/actionHelper';

export type ServerAction<TData, TArgs extends unknown[] = []> = (...args: TArgs) => Promise<IApiResponse<TData>>;

interface IActionExecutionLog {
    actionName: string;
    duration: number;
    status: number;
    success: boolean;
    args: number;
}

const logActionExecution = (entry: IActionExecutionLog): void => {
    if (!env.IS_DEV) return;

    const label = `[ServerAction] ${entry.actionName}`;
    const payload = {
        status: entry.status,
        success: entry.success,
        duration: `${String(entry.duration)}ms`,
        args: entry.args,
    };

    if (entry.success) {
        console.info(label, payload);
        return;
    }

    console.warn(label, payload);
};

export const executeServerAction = async <TData, TArgs extends unknown[] = []>(
    action: ServerAction<TData, TArgs>,
    args: TArgs,
    actionName = action.name || 'anonymousAction',
): Promise<IApiResponse<TData>> => {
    const startedAt = Date.now();

    try {
        const response = await action(...args);
        logActionExecution({
            actionName,
            duration: Date.now() - startedAt,
            status: response.status,
            success: response.success,
            args: args.length,
        });
        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        const response: Extract<IApiResponse<TData>, { success: false }> = {
            success: false,
            status: 500,
            error: message,
        };

        logActionExecution({
            actionName,
            duration: Date.now() - startedAt,
            status: response.status,
            success: false,
            args: args.length,
        });

        return response;
    }
};

export const createServerActionExecutor = <TData, TArgs extends unknown[] = []>(
    action: ServerAction<TData, TArgs>,
    actionName?: string,
) => {
    return (...args: TArgs): Promise<IApiResponse<TData>> => executeServerAction(action, args, actionName);
};
