import { NextRequest, NextResponse } from 'next/server';

import {
    changeAdminPassword,
    updateAdminProfile,
    updateAdminRecoveryEmail,
    type IChangeAdminPasswordInput,
    type IUpdateAdminProfileInput,
    type IUpdateAdminRecoveryEmailInput,
} from '@/server/new/admin/settings';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

type SettingsAction = 'update-profile' | 'change-password' | 'update-recovery-email';

interface ISettingsActionBody {
    action: SettingsAction;
    profile?: IUpdateAdminProfileInput;
    password?: IChangeAdminPasswordInput;
    recovery?: IUpdateAdminRecoveryEmailInput;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const body = await parseJsonBody<ISettingsActionBody>(request);
        if (!body?.action) {
            return NextResponse.json({ success: false, status: 400, error: 'Missing action' }, { status: 400 });
        }

        switch (body.action) {
            case 'update-profile':
                if (!body.profile) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing profile payload' }, { status: 400 });
                }
                return toHttp(await updateAdminProfile(body.profile));
            case 'change-password':
                if (!body.password) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing password payload' }, { status: 400 });
                }
                return toHttp(await changeAdminPassword(body.password));
            case 'update-recovery-email':
                return toHttp(await updateAdminRecoveryEmail(body.recovery ?? {}));
            default:
                return NextResponse.json({ success: false, status: 400, error: 'Unsupported action' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ success: false, status: 500, error: 'Internal Server Error' }, { status: 500 });
    }
};
