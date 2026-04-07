import { PUBLISH_STATUS, type PublicReadContentType } from '@/constants/schemaConstants';
import { toObjectIdOrNull } from '../../shared';

const STABLE_TIE_BREAKER = '_id';

export const toStableSort = (
    sort: Record<string, 1 | -1>,
    tieBreakField = 'slug',
): Record<string, 1 | -1> => {
    const next: Record<string, 1 | -1> = { ...sort };

    if (!(tieBreakField in next)) {
        next[tieBreakField] = 1;
    }

    if (!(STABLE_TIE_BREAKER in next)) {
        next[STABLE_TIE_BREAKER] = 1;
    }

    return next;
};

export const buildPublishedContentMatch = (
    type: PublicReadContentType,
    extra: Record<string, unknown> = {},
): Record<string, unknown> => ({
    type,
    publishStatus: PUBLISH_STATUS.PUBLISHED,
    ...extra,
});

export const parsePublicContentObjectId = (contentId: string) => toObjectIdOrNull(contentId);
