import { NextRequest, NextResponse } from 'next/server';

import {
    PUBLIC_READ_CONTENT_TYPE_VALUES,
    type PublicReadContentType,
} from '@/constants/schemaConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { getPublishedContentSearchResults } from '@/server/new/public/content/search';

import { toHttp } from '../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isPublicReadContentType = (value: string): value is PublicReadContentType => {
    return PUBLIC_READ_CONTENT_TYPE_VALUES.includes(value as PublicReadContentType);
};

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get(SITE_CONFIG.seo.search.queryParam) ?? '';
    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '20');
    const featuredOnly = searchParams.get('featuredOnly') === 'true';

    const contentTypesRaw = searchParams.get('contentTypes');
    const contentTypes = contentTypesRaw
        ? contentTypesRaw
            .split(',')
            .map((value) => value.trim())
            .filter(isPublicReadContentType)
        : undefined;

    return toHttp(
        await getPublishedContentSearchResults({
            query,
            ...(contentTypes && contentTypes.length > 0 ? { contentTypes } : {}),
            featuredOnly,
            pagination: {
                offset: Number.isNaN(offset) ? 0 : offset,
                limit: Number.isNaN(limit) ? 20 : limit,
            },
        })
    );
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/search',
        methods: ['GET'],
        querySchema: {
            [SITE_CONFIG.seo.search.queryParam]: 'string required search query',
            contentTypes: 'csv optional values: article,blog,project',
            featuredOnly: 'boolean optional default false',
            offset: 'number optional default 0',
            limit: 'number optional default 20',
        },
    });
};
