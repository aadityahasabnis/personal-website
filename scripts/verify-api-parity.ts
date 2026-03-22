import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

interface IDiscoveredAction {
    fn: string;
    file: string;
    domain: string;
}

interface IApiImport {
    fn: string;
    module: string;
    api: string;
}

interface IIndexCheck {
    id: string;
    queryFile: string;
    indexFile: string;
    queryPatterns: string[];
    indexPattern: string;
    pass: boolean;
    details: string;
}

interface IThinWrapperViolation {
    api: string;
    importedActions: string[];
}

const root = process.cwd();
const serverRoot = path.join(root, 'src', 'server', 'new');
const apiRoot = path.join(root, 'src', 'app', 'api');
const outputPath = path.join(root, 'scripts', 'verify-api-parity.output.json');

const CRITICAL_ACTIONS = new Set([
    // Comments (admin + public)
    'adminReplyToComment',
    'approveComment',
    'bulkApproveComments',
    'bulkDeleteComments',
    'createPublicComment',
    'deleteComment',
    'getComments',
    'getCommentStats',
    'getPublicCommentsByContentId',
    'rejectComment',
    'upvotePublicCommentById',

    // Contacts (admin + public)
    'archiveContact',
    'bulkArchiveContacts',
    'bulkDeleteContacts',
    'deleteContact',
    'getContactById',
    'getContacts',
    'getContactStats',
    'markContactAsRead',
    'markContactAsReplied',
    'submitPublicContact',
    'unarchiveContact',

    // Subscribers (admin + public)
    'bulkDeleteSubscribers',
    'confirmSubscriber',
    'deleteSubscriber',
    'exportSubscribers',
    'getSubscribers',
    'getSubscriberStats',
    'subscribe',
    'unsubscribe',

    // Engagement (public stats)
    'getContentLikesById',
    'getContentViewsById',
    'incrementContentLikesById',
    'incrementContentViewsById',

    // Email (admin)
    'sendNewsletter',
    'sendOtp',
    'sendPasswordReset',
    'sendTestEmail',
    'verifyEmailConnection',

    // Media (admin)
    'getMedia',
    'uploadMedia',
    'updateMedia',
    'deleteMedia',
    'getMediaStats',

    // Auth (admin - two-step login & forgot password)
    'verifyCredentials',
    'requestLoginOtp',
    'verifyLoginOtp',
    'requestPasswordReset',
    'verifyResetToken',
    'resetPassword',
]);

const HIGH_RISK_INDEX_CHECKS: Array<Omit<IIndexCheck, 'pass' | 'details'>> = [
    {
        id: 'blogs-listing',
        queryFile: 'src/server/new/public/content/blog/getPublishedBlogs.ts',
        indexFile: 'src/server/models/Content.ts',
        queryPatterns: [
            "buildPublishedContentMatch('blog')",
            '.sort(toStableSort({ featured: -1, publishedAt: -1, updatedAt: -1 }))',
        ],
        indexPattern: 'BaseContentSchema.index({ type: 1, publishStatus: 1, publishedAt: -1 });',
    },
    {
        id: 'projects-listing',
        queryFile: 'src/server/new/public/content/project/getPublishedProjects.ts',
        indexFile: 'src/server/models/Content.ts',
        queryPatterns: [
            "buildPublishedContentMatch('project')",
            '.sort(toStableSort({ order: 1, featured: -1, updatedAt: -1 }))',
        ],
        indexPattern: 'ProjectContentSchema.index({ type: 1, status: 1, order: 1 });',
    },
    {
        id: 'comment-threading',
        queryFile: 'src/server/new/public/comments/getPublicCommentsByContentId.ts',
        indexFile: 'src/server/models/Comment.ts',
        queryPatterns: [
            'Comment.find(baseMatch)',
            '.sort({ createdAt: -1, _id: -1 })',
            'approved: true',
        ],
        indexPattern: 'CommentSchema.index({ contentId: 1, parentId: 1, approved: 1, createdAt: -1 });',
    },
    {
        id: 'contact-duplicate-detection',
        queryFile: 'src/server/new/public/contact/submitPublicContact.ts',
        indexFile: 'src/server/models/Contact.ts',
        queryPatterns: [
            'duplicateCandidates = await Contact.find({',
            'email,',
            'subject,',
            'createdAt: { $gte: duplicateWindowStart },',
        ],
        indexPattern: 'ContactSchema.index({ email: 1, subject: 1, createdAt: -1 });',
    },
    {
        id: 'subscriber-admin-filters',
        queryFile: 'src/server/new/admin/subscribers/shared.ts',
        indexFile: 'src/server/models/Subscriber.ts',
        queryPatterns: [
            'match.confirmed = true;',
            'match.unsubscribedAt = null;',
            "return { subscribedAt: -1 };",
        ],
        indexPattern: 'SubscriberSchema.index({ confirmed: 1, unsubscribedAt: 1, subscribedAt: -1 });',
    },
    {
        id: 'media-admin-filters',
        queryFile: 'src/server/new/admin/media/shared.ts',
        indexFile: 'src/server/models/Media.ts',
        queryPatterns: [
            "match.fileType = filter;",
            "match.folder = filter;",
            "return { createdAt: -1 };",
        ],
        indexPattern: 'MediaSchema.index({ fileType: 1, folder: 1, createdAt: -1 });',
    },
];

const walk = (dir: string, out: string[] = []): string[] => {
    if (!statSafe(dir)?.isDirectory()) return out;

    for (const name of readdirSync(dir)) {
        const fullPath = path.join(dir, name);
        const st = statSafe(fullPath);
        if (!st) continue;

        if (st.isDirectory()) {
            walk(fullPath, out);
            continue;
        }

        out.push(fullPath);
    }

    return out;
};

const statSafe = (target: string) => {
    try {
        return statSync(target);
    } catch {
        return null;
    }
};

const toPosix = (value: string): string => value.split(path.sep).join('/');
const rel = (value: string): string => toPosix(path.relative(root, value));

const readText = (workspaceRelativePath: string): string => {
    const fullPath = path.join(root, workspaceRelativePath);
    return readFileSync(fullPath, 'utf8');
};

const getDomain = (file: string): string => {
    const relFile = rel(file);
    const parts = relFile.replace(/^src\/server\/new\//, '').split('/');

    if (parts[0] === 'admin' && parts[1] === 'content' && parts.length >= 3) {
        return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }

    return parts.slice(0, 2).join('/');
};

const extractServerActions = (): IDiscoveredAction[] => {
    const files = walk(serverRoot).filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'));
    const actions: IDiscoveredAction[] = [];

    const exportConstAsync = /export\s+const\s+([A-Za-z0-9_]+)\s*=\s*async\b/g;
    const exportAsyncFunction = /export\s+async\s+function\s+([A-Za-z0-9_]+)\s*\(/g;

    for (const file of files) {
        const content = readFileSync(file, 'utf8');
        const hasUseServer = content.includes("'use server'") || content.includes('"use server"');
        if (!hasUseServer) continue;

        for (const match of content.matchAll(exportConstAsync)) {
            const fn = match[1];
            if (!fn) continue;
            actions.push({ fn, file: rel(file), domain: getDomain(file) });
        }

        for (const match of content.matchAll(exportAsyncFunction)) {
            const fn = match[1];
            if (!fn) continue;
            actions.push({ fn, file: rel(file), domain: getDomain(file) });
        }
    }

    const uniq = new Map<string, IDiscoveredAction>();
    for (const action of actions) {
        const key = `${action.file}::${action.fn}`;
        uniq.set(key, action);
    }

    return [...uniq.values()].sort((a, b) => a.domain.localeCompare(b.domain) || a.fn.localeCompare(b.fn));
};

const extractApiImports = (): { imports: IApiImport[]; routeImports: Map<string, Set<string>> } => {
    const files = walk(apiRoot).filter((file) => file.endsWith('route.ts'));
    const rows: IApiImport[] = [];
    const routeImports = new Map<string, Set<string>>();

    const importRegex = /import\s*\{([^}]*)\}\s*from\s*['"]@\/server\/new\/([^'"]+)['"]/g;

    for (const file of files) {
        const content = readFileSync(file, 'utf8');

        for (const match of content.matchAll(importRegex)) {
            const namesBlock = match[1];
            const modulePath = match[2];
            if (!namesBlock || !modulePath) continue;

            const names = namesBlock
                .split(',')
                .map((segment) => segment.trim())
                .filter(Boolean)
                .map((segment) => segment.replace(/^type\s+/, ''))
                .map((segment) => segment.replace(/\s+as\s+[A-Za-z_$][A-Za-z0-9_$]*$/, '').trim())
                .filter((name): name is string => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name));

            for (const fn of names) {
                rows.push({ fn, module: modulePath, api: rel(file) });

                const key = rel(file);
                const current = routeImports.get(key) ?? new Set<string>();
                current.add(fn);
                routeImports.set(key, current);
            }
        }
    }

    return { imports: rows, routeImports };
};

const runIndexChecks = (): IIndexCheck[] => {
    return HIGH_RISK_INDEX_CHECKS.map((check) => {
        const queryText = readText(check.queryFile);
        const indexText = readText(check.indexFile);

        const missingQueryPatterns = check.queryPatterns.filter((pattern) => !queryText.includes(pattern));
        const hasIndex = indexText.includes(check.indexPattern);

        const pass = missingQueryPatterns.length === 0 && hasIndex;
        const details = pass
            ? 'query and index patterns detected'
            : [
                  missingQueryPatterns.length
                      ? `missing query patterns: ${missingQueryPatterns.join(' | ')}`
                      : null,
                  hasIndex ? null : `missing index pattern: ${check.indexPattern}`,
              ]
                  .filter(Boolean)
                  .join('; ');

        return {
            ...check,
            pass,
            details,
        };
    });
};

const actions = extractServerActions();
const { imports, routeImports } = extractApiImports();

const importedFnSet = new Set(imports.map((row) => row.fn));

const criticalActions = actions.filter((action) => CRITICAL_ACTIONS.has(action.fn));
const mappedCriticalActions = criticalActions.filter((action) => importedFnSet.has(action.fn));
const missingCriticalActions = criticalActions.filter((action) => !importedFnSet.has(action.fn));

const groupedMissingCritical = missingCriticalActions.reduce<Record<string, string[]>>((acc, action) => {
    if (!acc[action.domain]) acc[action.domain] = [];
    acc[action.domain].push(`${action.fn} (${action.file})`);
    return acc;
}, {});

for (const domain of Object.keys(groupedMissingCritical)) {
    groupedMissingCritical[domain] = groupedMissingCritical[domain].sort();
}

const criticalCoverage = criticalActions.length === 0
    ? 100
    : Number(((mappedCriticalActions.length / criticalActions.length) * 100).toFixed(2));

const thinWrapperViolations: IThinWrapperViolation[] = [];
for (const [api, importedActions] of routeImports.entries()) {
    const criticalImports = [...importedActions].filter((fn) => CRITICAL_ACTIONS.has(fn));
    if (criticalImports.length > 1) {
        thinWrapperViolations.push({
            api,
            importedActions: criticalImports.sort(),
        });
    }
}

thinWrapperViolations.sort((a, b) => a.api.localeCompare(b.api));

const indexChecks = runIndexChecks();
const failedIndexChecks = indexChecks.filter((check) => !check.pass);
const passedIndexChecks = indexChecks.length - failedIndexChecks.length;

const payload = {
    generatedAt: new Date().toISOString(),
    criticalCoverage: {
        totalCriticalActions: criticalActions.length,
        mappedCriticalActions: mappedCriticalActions.length,
        missingCriticalActions: missingCriticalActions.length,
        coverage: criticalCoverage,
        missingActions: missingCriticalActions,
        mappedActions: mappedCriticalActions,
    },
    missingCriticalByDomain: groupedMissingCritical,
    indexValidation: {
        totalChecks: indexChecks.length,
        passedChecks: passedIndexChecks,
        failedChecks: failedIndexChecks.length,
        checks: indexChecks,
    },
    thinWrapperAudit: {
        violationCount: thinWrapperViolations.length,
        violations: thinWrapperViolations,
    },
};

writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

console.log(JSON.stringify(payload, null, 2));
console.log('\nMissing CRITICAL API mappings by domain:');
if (!missingCriticalActions.length) {
    console.log('- none');
} else {
    for (const domain of Object.keys(groupedMissingCritical).sort()) {
        console.log(`\n${domain}`);
        for (const item of groupedMissingCritical[domain]) {
            console.log(`  - ${item}`);
        }
    }
}

console.log(`\nCritical coverage: ${mappedCriticalActions.length}/${criticalActions.length} (${criticalCoverage}%)`);
console.log(`Index checks: ${passedIndexChecks}/${indexChecks.length} passed`);
console.log(`Thin-wrapper violations (critical imports >1 per route): ${thinWrapperViolations.length}`);

if (missingCriticalActions.length > 0 || failedIndexChecks.length > 0) {
    process.exitCode = 1;
}
