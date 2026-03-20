import { PROJECT_STATUS, PUBLISH_STATUS, type ProjectStatusType, type PublishStatusType } from '@/constants/schemaConstants';
import { ObjectId } from 'mongodb';
export { isDuplicateSlugError } from '../helpers';

export interface IProjectActionBase {
    _id: ObjectId;
    slug: string;
    publishStatus: PublishStatusType;
    featured: boolean;
    status: ProjectStatusType | null;
    startDate: Date | null;
    completedDate: Date | null;
}

const PUBLISH_STATUS_SET = new Set<PublishStatusType>(Object.values(PUBLISH_STATUS));
const PROJECT_STATUS_SET = new Set<ProjectStatusType>(Object.values(PROJECT_STATUS));

export const isPublishedProject = (project: Pick<IProjectActionBase, 'publishStatus'>): boolean => {
    return project.publishStatus === PUBLISH_STATUS.PUBLISHED;
};

export const isValidPublishStatus = (status: unknown): status is PublishStatusType => {
    return typeof status === 'string' && PUBLISH_STATUS_SET.has(status as PublishStatusType);
};

export const isValidProjectStatus = (status: unknown): status is ProjectStatusType => {
    return typeof status === 'string' && PROJECT_STATUS_SET.has(status as ProjectStatusType);
};

export const normalizeProjectIds = (projectIds: string[]): string[] => {
    return Array.from(new Set(projectIds));
};

export const toObjectIds = (ids: string[]): ObjectId[] => {
    return ids.map((id) => new ObjectId(id));
};

const INVALID_DATE = Symbol('INVALID_DATE');
export type ParsedOptionalDate = Date | null | undefined | typeof INVALID_DATE;

export const parseOptionalDate = (value: string | Date | null | undefined): ParsedOptionalDate => {
    if (value === undefined) return undefined;
    if (value === null) return null;

    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return INVALID_DATE;
    return parsed;
};

export const invalidDateToken = INVALID_DATE;
