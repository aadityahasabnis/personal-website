import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import Admin from '@/server/models/Admin';
import Comment from '@/server/models/Comment';
import Contact from '@/server/models/Contact';
import Content from '@/server/models/Content';
import Subscriber from '@/server/models/Subscriber';

interface IPerfReport {
    query: string;
    usesIndex: boolean;
    executionTimeMs: number;
    scanType: 'IXSCAN' | 'COLLSCAN' | 'UNKNOWN';
    indexName: string | null;
    inMemorySort: boolean;
    totalDocsExamined: number;
    totalKeysExamined: number;
    hasCollectionScan: boolean;
    warnings: string[];
    notes?: string;
    before?: {
        executionTimeMs: number;
        totalDocsExamined: number;
        totalKeysExamined: number;
        scanType: 'IXSCAN' | 'COLLSCAN' | 'UNKNOWN';
    };
    delta?: {
        executionTimeMs: number;
        totalDocsExamined: number;
        totalKeysExamined: number;
    };
}

interface IExplainLike {
    queryPlanner?: {
        winningPlan?: unknown;
    };
    executionStats?: {
        executionTimeMillis?: number;
        totalDocsExamined?: number;
        totalKeysExamined?: number;
        executionStages?: unknown;
    };
}

const root = process.cwd();
const defaultOutputPath = path.join(root, 'scripts', 'query-performance-report.json');

const args = new Map<string, string>();
for (const arg of process.argv.slice(2)) {
    const [k, v] = arg.split('=');
    if (k && v) args.set(k.replace(/^--/, ''), v);
}

const outputPath = args.get('out') ? path.resolve(root, args.get('out') as string) : defaultOutputPath;
const comparePath = args.get('compare') ? path.resolve(root, args.get('compare') as string) : null;
const thresholdMs = Number(args.get('thresholdMs') ?? '50');

const walkPlan = (
    node: unknown,
    acc: { stages: string[]; indexNames: string[] }
): void => {
    if (!node || typeof node !== 'object') return;

    const rec = node as Record<string, unknown>;
    const stage = typeof rec.stage === 'string' ? rec.stage : null;
    if (stage) acc.stages.push(stage);

    const indexName = typeof rec.indexName === 'string' ? rec.indexName : null;
    if (indexName) acc.indexNames.push(indexName);

    for (const value of Object.values(rec)) {
        if (Array.isArray(value)) {
            for (const child of value) walkPlan(child, acc);
        } else if (value && typeof value === 'object') {
            walkPlan(value, acc);
        }
    }
};

const inspectExplain = (explain: IExplainLike): Omit<IPerfReport, 'query' | 'warnings' | 'notes' | 'before' | 'delta'> => {
    const plan = explain.queryPlanner?.winningPlan;
    const stagesSummary = { stages: [] as string[], indexNames: [] as string[] };
    walkPlan(plan, stagesSummary);

    const executionStages = explain.executionStats?.executionStages;
    const executionSummary = { stages: [] as string[], indexNames: [] as string[] };
    walkPlan(executionStages, executionSummary);

    const allStages = [...stagesSummary.stages, ...executionSummary.stages];
    const allIndexes = [...stagesSummary.indexNames, ...executionSummary.indexNames];

    const hasCollectionScan = allStages.includes('COLLSCAN');
    const hasIndexScan = allStages.includes('IXSCAN');
    const inMemorySort = allStages.includes('SORT') || allStages.includes('SORT_KEY_GENERATOR');

    return {
        usesIndex: hasIndexScan && !hasCollectionScan,
        executionTimeMs: explain.executionStats?.executionTimeMillis ?? 0,
        scanType: hasCollectionScan ? 'COLLSCAN' : hasIndexScan ? 'IXSCAN' : 'UNKNOWN',
        indexName: allIndexes.length ? allIndexes[0] : null,
        inMemorySort,
        totalDocsExamined: explain.executionStats?.totalDocsExamined ?? 0,
        totalKeysExamined: explain.executionStats?.totalKeysExamined ?? 0,
        hasCollectionScan,
    };
};

const toObjectId = () => new mongoose.Types.ObjectId();

const seedMemoryData = async (): Promise<{ contentId: mongoose.Types.ObjectId }> => {
    await Promise.all([
        Admin.deleteMany({}),
        Content.deleteMany({}),
        Comment.deleteMany({}),
        Contact.deleteMany({}),
        Subscriber.deleteMany({}),
    ]);

    const now = new Date();
    const admin = await Admin.create({
        email: 'owner@example.com',
        name: 'Owner',
    });

    const contentId = toObjectId();

    const docs: Array<Record<string, unknown>> = [];

    for (let i = 0; i < 120; i += 1) {
        docs.push({
            _id: i === 0 ? contentId : toObjectId(),
            type: 'blog',
            slug: `blog-${i}`,
            title: `Blog ${i}`,
            description: `Description ${i}`,
            body: `Body ${i}`,
            tags: ['perf', 'db'],
            readingTime: 5,
            publishStatus: 'published',
            publishedAt: new Date(now.getTime() - i * 60_000),
            featured: i % 5 === 0,
            seo: null,
            createdBy: admin._id,
            updatedBy: admin._id,
            createdAt: now,
            updatedAt: now,
        });
    }

    for (let i = 0; i < 120; i += 1) {
        docs.push({
            _id: toObjectId(),
            type: 'project',
            slug: `project-${i}`,
            title: `Project ${i}`,
            description: `Project description ${i}`,
            body: `Project body ${i}`,
            tags: ['perf', 'project'],
            readingTime: 7,
            publishStatus: 'published',
            publishedAt: new Date(now.getTime() - i * 120_000),
            featured: i % 4 === 0,
            order: i,
            seo: null,
            createdBy: admin._id,
            updatedBy: admin._id,
            createdAt: now,
            updatedAt: now,
        });
    }

    await Content.insertMany(docs, { ordered: false });

    const topParents = await Comment.insertMany(
        Array.from({ length: 40 }).map((_, idx) => ({
            _id: toObjectId(),
            contentId,
            parentId: null,
            author: {
                name: `User ${idx}`,
                email: `user${idx}@example.com`,
                avatar: null,
                website: null,
                isOwner: false,
            },
            content: `Top level comment ${idx}`,
            approved: true,
            upvotes: idx,
            replyCount: 0,
            ipHash: null,
            createdAt: new Date(now.getTime() - idx * 1000),
            updatedAt: now,
        }))
    );

    const replies: Array<Record<string, unknown>> = [];
    for (const parent of topParents.slice(0, 20)) {
        for (let i = 0; i < 3; i += 1) {
            replies.push({
                _id: toObjectId(),
                contentId,
                parentId: parent._id,
                author: {
                    name: `Reply ${i}`,
                    email: `reply${i}@example.com`,
                    avatar: null,
                    website: null,
                    isOwner: false,
                },
                content: `Reply ${i}`,
                approved: true,
                upvotes: 0,
                replyCount: 0,
                ipHash: null,
                createdAt: new Date(now.getTime() - i * 700),
                updatedAt: now,
            });
        }
    }
    await Comment.insertMany(replies, { ordered: false });

    const duplicateMessage = 'Please contact me for a collaboration opportunity.';
    const duplicateSubject = 'Collaboration request';
    await Contact.insertMany(
        Array.from({ length: 150 }).map((_, i) => ({
            name: `Contact ${i}`,
            email: i % 3 === 0 ? 'person@example.com' : `person${i}@example.com`,
            subject: i % 3 === 0 ? duplicateSubject : `Subject ${i}`,
            message: i % 3 === 0 ? duplicateMessage : `Message ${i}`,
            status: i % 2 === 0 ? 'new' : 'read',
            ipHash: null,
            createdAt: new Date(now.getTime() - i * 30_000),
            updatedAt: now,
        })),
        { ordered: false }
    );

    await Subscriber.insertMany(
        Array.from({ length: 200 }).map((_, i) => ({
            email: `subscriber${i}@example.com`,
            name: i % 5 === 0 ? `Aaditya ${i}` : `Reader ${i}`,
            confirmed: i % 2 === 0,
            subscribedAt: new Date(now.getTime() - i * 45_000),
            unsubscribedAt: i % 9 === 0 ? new Date(now.getTime() - i * 20_000) : null,
            createdAt: now,
            updatedAt: now,
        }))
    );

    return { contentId };
};

const runExplains = async (contentId: mongoose.Types.ObjectId): Promise<IPerfReport[]> => {
    const reports: IPerfReport[] = [];

    const blogExplain = (await Content.collection
        .find({ type: 'blog', publishStatus: 'published' })
        .sort({ featured: -1, publishedAt: -1, updatedAt: -1 })
        .skip(0)
        .limit(20)
        .explain('executionStats')) as IExplainLike;

    reports.push({
        query: 'getPublishedBlogs',
        ...inspectExplain(blogExplain),
        warnings: [],
    });

    const projectExplain = (await Content.collection
        .find({ type: 'project', publishStatus: 'published' })
        .sort({ order: 1, featured: -1, updatedAt: -1 })
        .skip(0)
        .limit(20)
        .explain('executionStats')) as IExplainLike;

    reports.push({
        query: 'getPublishedProjects',
        ...inspectExplain(projectExplain),
        warnings: [],
    });

    const commentsTopLevelExplain = (await Comment.collection
        .find({
            contentId,
            parentId: null,
            approved: true,
        })
        .sort({ createdAt: -1, _id: -1 })
        .skip(0)
        .limit(20)
        .explain('executionStats')) as IExplainLike;

    reports.push({
        query: 'getPublicCommentsByContentId.topLevel',
        ...inspectExplain(commentsTopLevelExplain),
        warnings: [],
    });

    const parentIds = await Comment.collection
        .find({ contentId, parentId: null, approved: true })
        .project({ _id: 1 })
        .limit(20)
        .toArray();

    const commentsReplyExplain = (await Comment.collection
        .find({
            contentId,
            approved: true,
            parentId: { $in: parentIds.map((row) => row._id) },
        })
        .sort({ parentId: 1, createdAt: 1, _id: 1 })
        .hint({ contentId: 1, parentId: 1, approved: 1, createdAt: 1, _id: 1 })
        .explain('executionStats')) as IExplainLike;

    reports.push({
        query: 'getPublicCommentsByContentId.replies',
        ...inspectExplain(commentsReplyExplain),
        warnings: [],
    });

    const duplicateWindowStart = new Date(Date.now() - 15 * 60 * 1000);
    const contactExplain = (await Contact.collection
        .find({
            email: 'person@example.com',
            subject: 'Collaboration request',
            createdAt: { $gte: duplicateWindowStart },
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .project({ _id: 1, message: 1 })
        .explain('executionStats')) as IExplainLike;

    reports.push({
        query: 'submitPublicContact.duplicateDetection',
        ...inspectExplain(contactExplain),
        warnings: [],
    });

    const subscriberFilterExplain = (await Subscriber.collection
        .find({
            confirmed: true,
            unsubscribedAt: null,
        })
        .sort({ subscribedAt: -1 })
        .skip(0)
        .limit(50)
        .explain('executionStats')) as IExplainLike;

    reports.push({
        query: 'adminSubscribers.filterConfirmed',
        ...inspectExplain(subscriberFilterExplain),
        warnings: [],
    });

    const subscriberSearchExplain = (await Subscriber.collection
        .find({
            confirmed: true,
            unsubscribedAt: null,
            $or: [{ email: { $regex: 'aaditya', $options: 'i' } }, { name: { $regex: 'aaditya', $options: 'i' } }],
        })
        .sort({ subscribedAt: -1 })
        .skip(0)
        .limit(50)
        .explain('executionStats')) as IExplainLike;

    reports.push({
        query: 'adminSubscribers.filterWithQuery',
        ...inspectExplain(subscriberSearchExplain),
        warnings: [],
    });

    for (const report of reports) {
        if (report.hasCollectionScan) report.warnings.push('COLLSCAN detected');
        if (report.inMemorySort) report.warnings.push('In-memory sort detected');
        if (!report.usesIndex) report.warnings.push('No index-backed winning plan');
        if (report.executionTimeMs > thresholdMs) {
            report.warnings.push(`Execution time above threshold (${thresholdMs}ms)`);
        }
    }

    return reports;
};

const enrichWithComparison = (reports: IPerfReport[]): IPerfReport[] => {
    if (!comparePath || !existsSync(comparePath)) return reports;

    const raw = readFileSync(comparePath, 'utf8');
    const parsed = JSON.parse(raw) as { reports?: IPerfReport[] };
    const previous = new Map((parsed.reports ?? []).map((row) => [row.query, row]));

    for (const report of reports) {
        const before = previous.get(report.query);
        if (!before) continue;

        report.before = {
            executionTimeMs: before.executionTimeMs,
            totalDocsExamined: before.totalDocsExamined,
            totalKeysExamined: before.totalKeysExamined,
            scanType: before.scanType,
        };

        report.delta = {
            executionTimeMs: report.executionTimeMs - before.executionTimeMs,
            totalDocsExamined: report.totalDocsExamined - before.totalDocsExamined,
            totalKeysExamined: report.totalKeysExamined - before.totalKeysExamined,
        };
    }

    return reports;
};

const main = async () => {
    let memoryServer: MongoMemoryServer | null = null;

    try {
        const hasMongoUri = Boolean(process.env.MONGODB_URI);
        const dbName = process.env.DB_NAME || 'portfolio';

        if (!hasMongoUri) {
            memoryServer = await MongoMemoryServer.create();
            await mongoose.connect(memoryServer.getUri(), { dbName: 'portfolio-perf' });
        } else {
            await mongoose.connect(process.env.MONGODB_URI as string, { dbName });
        }

        await Promise.all([
            Admin.createIndexes(),
            Content.createIndexes(),
            Comment.createIndexes(),
            Contact.createIndexes(),
            Subscriber.createIndexes(),
        ]);

        const { contentId } = await seedMemoryData();

        const reports = enrichWithComparison(await runExplains(contentId));

        const payload = {
            generatedAt: new Date().toISOString(),
            thresholdMs,
            databaseMode: memoryServer ? 'memory' : 'live',
            reports,
        };

        writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
        console.log(JSON.stringify(payload, null, 2));

        const hasFailure = reports.some((row) => row.warnings.length > 0);
        if (hasFailure) process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        if (memoryServer) await memoryServer.stop();
    }
};

void main();
