const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p, out);
        else out.push(p);
    }
    return out;
}

const root = process.cwd();
const serverFiles = walk(path.join(root, 'src', 'server', 'new')).filter((p) => p.endsWith('.ts'));
const apiFiles = walk(path.join(root, 'src', 'app', 'api')).filter((p) => p.endsWith('route.ts'));

const actionRows = [];
for (const f of serverFiles) {
    const rel = path.relative(root, f).replace(/\\/g, '/');
    const base = path.basename(rel);
    if (base === 'index.ts' || base === 'types.ts') continue;

    const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('export const ')) continue;
        if (!trimmed.includes('= async')) continue;
        const name = trimmed.slice('export const '.length).split('=')[0].trim();
        if (name) actionRows.push({ file: rel, fn: name });
    }
}

const apiRows = [];
for (const f of apiFiles) {
    const rel = path.relative(root, f).replace(/\\/g, '/');
    const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
    const imports = [];
    const methods = [];

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('import ') && trimmed.includes("from '@/server/new/")) {
            const m = trimmed.match(/import\s+\{([^}]+)\}\s+from\s+'@\/server\/new\/([^']+)'/);
            if (m) {
                const names = m[1]
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                for (const n of names) {
                    const cleaned = n
                        .replace(/^type\s+/, '')
                        .split(/\s+as\s+/)[0]
                        .trim();
                    if (cleaned) imports.push({ fn: cleaned, module: m[2] });
                }
            }
        }

        const mm = trimmed.match(/^export\s+(?:async\s+function|const)\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS)\b/);
        if (mm) methods.push(mm[1]);
    }

    apiRows.push({ file: rel, methods: Array.from(new Set(methods)), imports });
}

const importedFns = new Set();
for (const r of apiRows) for (const i of r.imports) importedFns.add(i.fn);

const skipFile = (f) => f.includes('/shared/') || f.endsWith('/shared.ts') || f.endsWith('/helpers.ts') || f.includes('/utils/');

const missingApis = actionRows.filter((r) => !importedFns.has(r.fn) && !skipFile(r.file));
const apiWithoutServerNew = apiRows.filter((r) => r.imports.length === 0);

const payload = {
    counts: {
        actionCount: actionRows.length,
        apiRouteCount: apiRows.length,
        apisImportingServerNew: apiRows.filter((r) => r.imports.length > 0).length,
        missingApiCount: missingApis.length,
        apiWithoutServerNewCount: apiWithoutServerNew.length,
    },
    missingApis,
    apiWithoutServerNew,
    actionRows,
    apiRows,
};

console.log(JSON.stringify(payload, null, 2));
