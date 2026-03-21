import type { IApiResponse } from '@/interfaces/actionHelper';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const toHttp = <T>(result: IApiResponse<T>): NextResponse => {
    return NextResponse.json(result, { status: result.status });
};

export const parseJsonBody = async <T>(request: NextRequest): Promise<T | null> => {
    try {
        return (await request.json()) as T;
    } catch {
        return null;
    }
};
