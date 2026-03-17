import type { IApiResponse } from '@/interfaces/actionHelper';
import { auth } from '@/lib/auth/admin';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export interface IApiErrorCase {
    code: number;
    when: string;
    sample: string;
}

export const unauthorizedResponse = (): NextResponse =>
    NextResponse.json(
        {
            success: false,
            status: 401,
            error: 'Unauthorized',
            message: 'Sign in as admin before calling this endpoint.',
        },
        { status: 401 }
    );

export const requireAdmin = async (): Promise<NextResponse | null> => {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();
    return null;
};

export const toHttp = <T>(result: IApiResponse<T>): NextResponse => {
    const status = result.status;
    return NextResponse.json(result, { status });
};

export const parseBooleanQuery = (value: string | null): boolean | undefined => {
    if (value === null) return undefined;
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
    return undefined;
};

export const parseJsonBody = async <T>(request: NextRequest): Promise<T | null> => {
    try {
        return (await request.json()) as T;
    } catch {
        return null;
    }
};
