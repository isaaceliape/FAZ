/**
 * Core — Shared utilities, constants, and internal helpers
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { PathTraversalError } from './errors.js';
// ─── Path helpers ─────────────────────────────────────────────────────────────
/** Normaliza caminho relativo para usar sempre barras dianteiras (multi-plataforma). */
export function toPosixPath(p) {
    return p.split(path.sep).join('/');
}
/** Guardrail: validates that a file path is inside .fase-ai directory */
export function ensureInsidePlanejamento(cwd, filePath, operation = 'file operation') {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
    const planejPath = path.join(cwd, '.fase-ai');
    const normalizedFull = path.normalize(fullPath);
    const normalizedPlanej = path.normalize(planejPath);
    if (!normalizedFull.startsWith(normalizedPlanej + path.sep) && normalizedFull !== normalizedPlanej) {
        throw new PathTraversalError(`${operation} must be inside .fase-ai/: ${filePath}`, 'PATH_OUTSIDE_BOUNDARY', { path: filePath, boundary: '.fase-ai', operation });
    }
    return fullPath;
}
/** Check if a path is inside .fase-ai without throwing */
export function isInsidePlanejamento(cwd, filePath) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
    const planejPath = path.join(cwd, '.fase-ai');
    const normalizedFull = path.normalize(fullPath);
    const normalizedPlanej = path.normalize(planejPath);
    return normalizedFull.startsWith(normalizedPlanej + path.sep) || normalizedFull === normalizedPlanej;
}
/**
 * Guardrail: Validates that a user-provided path doesn't escape the project boundary (cwd).
 * Protects against path traversal attacks via ../../../etc/passwd patterns.
 *
 * @param cwd - Project root directory (trusted base)
 * @param userPath - User-provided path (untrusted input)
 * @returns Resolved absolute path if valid
 * @throws PathTraversalError if path escapes project boundary
 */
export function validatePathInsideCwd(cwd, userPath) {
    const resolved = path.resolve(cwd, userPath);
    const relative = path.relative(cwd, resolved);
    // Check if relative path tries to escape (starts with ..) or is absolute
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new PathTraversalError(`Path traversal detected: "${userPath}" escapes project boundary`, 'PATH_TRAVERSAL_DETECTED', { userPath, resolved, cwd });
    }
    return resolved;
}
// ─── Model Profile Table ──────────────────────────────────────────────────────
export const MODEL_PROFILES = {
    'gsd-planner': { quality: 'opus', balanced: 'opus', budget: 'sonnet' },
    'gsd-roadmapper': { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
    'gsd-executor': { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
    'gsd-phase-researcher': { quality: 'opus', balanced: 'sonnet', budget: 'haiku' },
    'gsd-project-researcher': { quality: 'opus', balanced: 'sonnet', budget: 'haiku' },
    'gsd-research-synthesizer': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
    'gsd-debugger': { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
    'gsd-codebase-mapper': { quality: 'sonnet', balanced: 'haiku', budget: 'haiku' },
    'gsd-verifier': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
    'gsd-plan-checker': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
    'gsd-integration-checker': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
    'gsd-nyquist-auditor': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
};
// ─── Output helpers ───────────────────────────────────────────────────────────
export function output(result, raw, rawValue) {
    if (raw && rawValue !== undefined) {
        process.stdout.write(String(rawValue));
    }
    else {
        const json = JSON.stringify(result, null, 2);
        // Large payloads exceed Claude Code's Bash tool buffer (~50KB).
        // Write to tmpfile and output the path prefixed with @file: so callers can detect it.
        if (json.length > 50000) {
            const tmpPath = path.join(os.tmpdir(), `gsd-${Date.now()}.json`);
            fs.writeFileSync(tmpPath, json, 'utf-8');
            process.stdout.write('@file:' + tmpPath);
        }
        else {
            process.stdout.write(json);
        }
    }
    process.exit(0);
}
export function error(message) {
    process.stderr.write('Erro: ' + message + '\n');
    process.exit(1);
}
// ─── File & Config utilities ──────────────────────────────────────────────────
export function safeReadFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    }
    catch {
        return null;
    }
}
export function loadConfig(cwd) {
    const configPath = path.join(cwd, '.fase-ai', 'config.json');
    const defaults = {
        model_profile: 'balanced',
        commit_docs: true,
        search_gitignored: false,
        branching_strategy: 'none',
        etapa_branch_template: 'gsd/phase-{phase}-{slug}',
        milestone_branch_template: 'gsd/{milestone}-{slug}',
        research: true,
        plan_checker: true,
        verifier: true,
        nyquist_validation: true,
        parallelization: true,
        brave_search: false,
        model_overrides: null,
    };
    try {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        // Migrate deprecated "depth" key to "granularity" with value mapping
        if ('depth' in parsed && !('granularity' in parsed)) {
            const depthToGranularity = { quick: 'coarse', standard: 'standard', comprehensive: 'fine' };
            parsed['granularity'] = depthToGranularity[parsed['depth']] ?? parsed['depth'];
            delete parsed['depth'];
            try {
                fs.writeFileSync(configPath, JSON.stringify(parsed, null, 2), 'utf-8');
            }
            catch (err) {
                process.stderr.write(`[core:loadConfig] Failed to migrate config: ${err.message}\n`);
            }
        }
        const get = (key, nested) => {
            if (parsed[key] !== undefined)
                return parsed[key];
            if (nested) {
                const section = parsed[nested.section];
                if (section && typeof section === 'object' && section !== null) {
                    const val = section[nested.field];
                    if (val !== undefined)
                        return val;
                }
            }
            return undefined;
        };
        const parallelization = (() => {
            const val = get('parallelization');
            if (typeof val === 'boolean')
                return val;
            if (typeof val === 'object' && val !== null && 'enabled' in val)
                return val.enabled;
            return defaults.parallelization;
        })();
        return {
            model_profile: (get('model_profile') ?? defaults.model_profile),
            commit_docs: (get('commit_docs', { section: 'planning', field: 'commit_docs' }) ?? defaults.commit_docs),
            search_gitignored: (get('search_gitignored', { section: 'planning', field: 'search_gitignored' }) ?? defaults.search_gitignored),
            branching_strategy: (get('branching_strategy', { section: 'git', field: 'branching_strategy' }) ?? defaults.branching_strategy),
            etapa_branch_template: (get('etapa_branch_template', { section: 'git', field: 'etapa_branch_template' }) ?? defaults.etapa_branch_template),
            milestone_branch_template: (get('milestone_branch_template', { section: 'git', field: 'milestone_branch_template' }) ?? defaults.milestone_branch_template),
            research: (get('research', { section: 'workflow', field: 'research' }) ?? defaults.research),
            plan_checker: (get('plan_checker', { section: 'workflow', field: 'plan_check' }) ?? defaults.plan_checker),
            verifier: (get('verifier', { section: 'workflow', field: 'verifier' }) ?? defaults.verifier),
            nyquist_validation: (get('nyquist_validation', { section: 'workflow', field: 'nyquist_validation' }) ?? defaults.nyquist_validation),
            parallelization,
            brave_search: (get('brave_search') ?? defaults.brave_search),
            model_overrides: parsed['model_overrides'] ?? null,
        };
    }
    catch (err) {
        process.stderr.write(`[core:loadConfig] Failed to load config from ${configPath}: ${err.message}\n`);
        return defaults;
    }
}
// ─── Git utilities ────────────────────────────────────────────────────────────
export function isGitIgnored(cwd, targetPath) {
    try {
        // --no-index checks .gitignore rules regardless of whether the file is tracked.
        execSync('git check-ignore -q --no-index -- ' + targetPath.replace(/[^a-zA-Z0-9._\-/]/g, ''), {
            cwd,
            stdio: 'pipe',
        });
        return true;
    }
    catch {
        return false;
    }
}
export function execGit(cwd, args) {
    try {
        const escaped = args.map(a => {
            if (/^[a-zA-Z0-9._\-/=:@]+$/.test(a))
                return a;
            return "'" + a.replace(/'/g, "'\\''") + "'";
        });
        const stdout = execSync('git ' + escaped.join(' '), {
            cwd,
            stdio: 'pipe',
            encoding: 'utf-8',
        });
        return { exitCode: 0, stdout: stdout.trim(), stderr: '' };
    }
    catch (err) {
        const e = err;
        return {
            exitCode: e.status ?? 1,
            stdout: (e.stdout ?? '').toString().trim(),
            stderr: (e.stderr ?? '').toString().trim(),
        };
    }
}
// ─── Etapa utilities ──────────────────────────────────────────────────────────
export function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
export function normalizeEtapaNome(etapa) {
    const match = String(etapa).match(/^(\d+)([A-Z])?((?:\.\d+)*)/i);
    if (!match)
        return String(etapa);
    const padded = match[1].padStart(2, '0');
    const letter = match[2] ? match[2].toUpperCase() : '';
    const decimal = match[3] ?? '';
    return padded + letter + decimal;
}
export function compareEtapaNum(a, b) {
    const pa = String(a).match(/^(\d+)([A-Z])?((?:\.\d+)*)/i);
    const pb = String(b).match(/^(\d+)([A-Z])?((?:\.\d+)*)/i);
    if (!pa || !pb)
        return String(a).localeCompare(String(b));
    const intDiff = parseInt(pa[1], 10) - parseInt(pb[1], 10);
    if (intDiff !== 0)
        return intDiff;
    const la = (pa[2] ?? '').toUpperCase();
    const lb = (pb[2] ?? '').toUpperCase();
    if (la !== lb) {
        if (!la)
            return -1;
        if (!lb)
            return 1;
        return la < lb ? -1 : 1;
    }
    const aDecParts = pa[3] ? pa[3].slice(1).split('.').map(p => parseInt(p, 10)) : [];
    const bDecParts = pb[3] ? pb[3].slice(1).split('.').map(p => parseInt(p, 10)) : [];
    const maxLen = Math.max(aDecParts.length, bDecParts.length);
    if (aDecParts.length === 0 && bDecParts.length > 0)
        return -1;
    if (bDecParts.length === 0 && aDecParts.length > 0)
        return 1;
    for (let i = 0; i < maxLen; i++) {
        const av = Number.isFinite(aDecParts[i]) ? aDecParts[i] : 0;
        const bv = Number.isFinite(bDecParts[i]) ? bDecParts[i] : 0;
        if (av !== bv)
            return av - bv;
    }
    return 0;
}
export function searchEtapaInDir(baseDir, relBase, normalized) {
    try {
        const entries = fs.readdirSync(baseDir, { withFileTypes: true });
        const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort((a, b) => compareEtapaNum(a, b));
        const match = dirs.find((d) => d.startsWith(normalized));
        if (!match)
            return null;
        const dirMatch = match.match(/^(\d+[A-Z]?(?:\.\d+)*)-?(.*)/i);
        const etapaNumber = dirMatch ? dirMatch[1] : normalized;
        const etapaNome = dirMatch?.[2] ?? null;
        const phaseDir = path.join(baseDir, match);
        const phaseFiles = fs.readdirSync(phaseDir);
        const plans = phaseFiles.filter((f) => f.endsWith('-PLAN.md') || f === 'PLAN.md').sort();
        const summaries = phaseFiles.filter((f) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md').sort();
        const hasResearch = phaseFiles.some((f) => f.endsWith('-RESEARCH.md') || f === 'RESEARCH.md');
        const hasContext = phaseFiles.some((f) => f.endsWith('-CONTEXT.md') || f === 'CONTEXT.md');
        const hasVerification = phaseFiles.some((f) => f.endsWith('-VERIFICATION.md') || f === 'VERIFICATION.md');
        const completedPlanIds = new Set(summaries.map((s) => s.replace('-SUMMARY.md', '').replace('SUMMARY.md', '')));
        const incompletePlans = plans.filter((p) => {
            const planId = p.replace('-PLAN.md', '').replace('PLAN.md', '');
            return !completedPlanIds.has(planId);
        });
        return {
            found: true,
            directory: toPosixPath(path.join(relBase, match)),
            phase_number: etapaNumber,
            phase_name: etapaNome,
            phase_slug: etapaNome ? etapaNome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : null,
            plans,
            summaries,
            incomplete_plans: incompletePlans,
            has_research: hasResearch,
            has_context: hasContext,
            has_verification: hasVerification,
        };
    }
    catch (err) {
        process.stderr.write(`[core:searchEtapaInDir] Failed to search etapa directory: ${err.message}\n`);
        return null;
    }
}
export function findEtapaInternal(cwd, etapa) {
    if (!etapa)
        return null;
    const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
    const normalized = normalizeEtapaNome(etapa);
    const current = searchEtapaInDir(etapasDir, '.fase-ai/phases', normalized);
    if (current)
        return current;
    const milestonesDir = path.join(cwd, '.fase-ai', 'milestones');
    if (!fs.existsSync(milestonesDir))
        return null;
    try {
        const milestoneEntries = fs.readdirSync(milestonesDir, { withFileTypes: true });
        const archiveDirs = milestoneEntries
            .filter(e => e.isDirectory() && /^v[\d.]+-phases$/.test(e.name))
            .map(e => e.name)
            .sort()
            .reverse();
        for (const archiveName of archiveDirs) {
            const versionMatch = archiveName.match(/^(v[\d.]+)-phases$/);
            const version = versionMatch?.[1] ?? archiveName;
            const archivePath = path.join(milestonesDir, archiveName);
            const relBase = '.fase-ai/milestones/' + archiveName;
            const result = searchEtapaInDir(archivePath, relBase, normalized);
            if (result) {
                result.archived = version;
                return result;
            }
        }
    }
    catch (err) {
        process.stderr.write(`[core:findEtapaInternal] Failed to search archived etapas: ${err.message}\n`);
    }
    return null;
}
export function getArchivedEtapasDirs(cwd) {
    const milestonesDir = path.join(cwd, '.fase-ai', 'milestones');
    const results = [];
    if (!fs.existsSync(milestonesDir))
        return results;
    try {
        const milestoneEntries = fs.readdirSync(milestonesDir, { withFileTypes: true });
        const etapasDirs = milestoneEntries
            .filter(e => e.isDirectory() && /^v[\d.]+-phases$/.test(e.name))
            .map(e => e.name)
            .sort()
            .reverse();
        for (const archiveName of etapasDirs) {
            const versionMatch = archiveName.match(/^(v[\d.]+)-phases$/);
            const version = versionMatch?.[1] ?? archiveName;
            const archivePath = path.join(milestonesDir, archiveName);
            const entries = fs.readdirSync(archivePath, { withFileTypes: true });
            const dirs = entries.filter(e => e.isDirectory()).map(e => e.name).sort((a, b) => compareEtapaNum(a, b));
            for (const dir of dirs) {
                results.push({
                    name: dir,
                    milestone: version,
                    basePath: path.join('.fase-ai', 'milestones', archiveName),
                    fullPath: path.join(archivePath, dir),
                });
            }
        }
    }
    catch (err) {
        process.stderr.write(`[core:getArchivedEtapasDirs] Failed to read archived etapas: ${err.message}\n`);
    }
    return results;
}
// ─── Roadmap & model utilities ────────────────────────────────────────────────
export function getRoadmapEtapaInternal(cwd, etapaNum) {
    if (!etapaNum)
        return null;
    const roadmapPath = path.join(cwd, '.fase-ai', 'ROADMAP.md');
    if (!fs.existsSync(roadmapPath))
        return null;
    try {
        const content = fs.readFileSync(roadmapPath, 'utf-8');
        const escapedEtapa = escapeRegex(etapaNum.toString());
        const phasePattern = new RegExp(`#{2,4}\\s*(?:Phase|Etapa)\\s+${escapedEtapa}:\\s*([^\\n]+)`, 'i');
        const headerMatch = content.match(phasePattern);
        if (!headerMatch)
            return null;
        const etapaNome = headerMatch[1].trim();
        const headerIndex = headerMatch.index ?? 0;
        const restOfContent = content.slice(headerIndex);
        const nextHeaderMatch = restOfContent.match(/\n#{2,4}\s+(?:Phase|Etapa)\s+\d/i);
        const sectionEnd = nextHeaderMatch ? headerIndex + (nextHeaderMatch.index ?? 0) : content.length;
        const section = content.slice(headerIndex, sectionEnd).trim();
        const goalMatch = section.match(/\*\*Goal:\*\*\s*([^\n]+)/i);
        const goal = goalMatch ? goalMatch[1].trim() : null;
        return {
            found: true,
            phase_number: etapaNum.toString(),
            phase_name: etapaNome,
            goal,
            section,
        };
    }
    catch (err) {
        process.stderr.write(`[core:getRoadmapEtapaInternal] Failed to read roadmap: ${err.message}\n`);
        return null;
    }
}
export function resolveModelInternal(cwd, agentType) {
    const config = loadConfig(cwd);
    const override = config.model_overrides?.[agentType];
    if (override) {
        return override === 'opus' ? 'inherit' : override;
    }
    const profile = config.model_profile || 'balanced';
    const agentModels = MODEL_PROFILES[agentType];
    if (!agentModels)
        return 'sonnet';
    const resolved = agentModels[profile] || agentModels['balanced'] || 'sonnet';
    return resolved === 'opus' ? 'inherit' : resolved;
}
// ─── Misc utilities ───────────────────────────────────────────────────────────
export function pathExistsInternal(cwd, targetPath) {
    const fullPath = path.isAbsolute(targetPath) ? targetPath : path.join(cwd, targetPath);
    try {
        fs.statSync(fullPath);
        return true;
    }
    catch (err) {
        // Silently return false for non-existent paths (expected behavior)
        return false;
    }
}
export function generateSlugInternal(text) {
    if (!text)
        return null;
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
export function getMilestoneInfo(cwd) {
    try {
        const roadmap = fs.readFileSync(path.join(cwd, '.fase-ai', 'ROADMAP.md'), 'utf-8');
        const inProgressMatch = roadmap.match(/🚧\s*\*\*v(\d+\.\d+)\s+([^*]+)\*\*/);
        if (inProgressMatch) {
            return {
                version: 'v' + inProgressMatch[1],
                name: inProgressMatch[2].trim(),
            };
        }
        const cleaned = roadmap.replace(/<details>[\s\S]*?<\/details>/gi, '');
        const headingMatch = cleaned.match(/## .*v(\d+\.\d+)[:\s]+([^\n(]+)/);
        if (headingMatch) {
            return {
                version: 'v' + headingMatch[1],
                name: headingMatch[2].trim(),
            };
        }
        const versionMatch = cleaned.match(/v(\d+\.\d+)/);
        return {
            version: versionMatch ? versionMatch[0] : 'v1.0',
            name: 'milestone',
        };
    }
    catch (err) {
        process.stderr.write(`[core:getMilestoneInfo] Failed to read roadmap: ${err.message}\n`);
        return { version: 'v1.0', name: 'milestone' };
    }
}
export function getMilestoneEtapaFilter(cwd) {
    const milestonePhaseNums = new Set();
    try {
        const roadmap = fs.readFileSync(path.join(cwd, '.fase-ai', 'ROADMAP.md'), 'utf-8');
        const phasePattern = /#{2,4}\s*Phase\s+(\d+[A-Z]?(?:\.\d+)*)\s*:/gi;
        let m;
        while ((m = phasePattern.exec(roadmap)) !== null) {
            milestonePhaseNums.add(m[1]);
        }
    }
    catch (err) {
        process.stderr.write(`[core:getMilestoneEtapaFilter] Failed to read roadmap: ${err.message}\n`);
    }
    if (milestonePhaseNums.size === 0) {
        const passAll = (() => true);
        passAll.phaseCount = 0;
        return passAll;
    }
    const normalized = new Set([...milestonePhaseNums].map(n => (n.replace(/^0+/, '') || '0').toLowerCase()));
    function isDirInMilestone(dirName) {
        const m = dirName.match(/^0*(\d+[A-Za-z]?(?:\.\d+)*)/);
        if (!m)
            return false;
        return normalized.has(m[1].toLowerCase());
    }
    isDirInMilestone.phaseCount = milestonePhaseNums.size;
    return isDirInMilestone;
}
// ─── Disk space utilities ─────────────────────────────────────────────────────
/**
 * Validate environment variables and return status.
 * @returns Object with valid status, missing vars, and warnings
 */
export function validateEnvVars() {
    const result = { valid: true, missing: [], warnings: [] };
    // Optional but recommended
    if (!process.env.BRAVE_API_KEY) {
        result.warnings.push('BRAVE_API_KEY not set — Brave search features will be disabled');
    }
    // Log warnings
    result.warnings.forEach((warn) => {
        process.stderr.write(`[env] Warning: ${warn}\n`);
    });
    return result;
}
/**
 * Check if there's enough disk space at the target path.
 * @param targetPath - Path where file will be written
 * @param minBytes - Minimum required bytes (default: 1MB)
 * @returns true if enough space is available
 */
export function checkDiskSpace(targetPath, minBytes = 1024 * 1024) {
    try {
        const dir = path.dirname(targetPath);
        if (process.platform === 'win32') {
            // Windows: use fsutil
            const driveLetter = dir[0];
            const output = execSync(`fsutil volume diskfree ${driveLetter}:`, { encoding: 'utf8' });
            const match = output.match(/Total free bytes\s*:\s*(\d+)/);
            if (match) {
                const freeBytes = parseInt(match[1], 10);
                return freeBytes >= minBytes;
            }
        }
        else {
            // Unix/Linux/macOS: use df
            const output = execSync(`df -k "${dir}" | tail -1`, { encoding: 'utf8' });
            const parts = output.trim().split(/\s+/);
            if (parts.length >= 4) {
                const availableKB = parseInt(parts[3], 10) * 1024;
                return availableKB >= minBytes;
            }
        }
        // If we can't determine, assume OK but log warning
        process.stderr.write(`[core:checkDiskSpace] Could not verify disk space for ${targetPath}\n`);
        return true;
    }
    catch (err) {
        process.stderr.write(`[core:checkDiskSpace] Error checking disk space: ${err.message}\n`);
        // If check fails, assume OK to avoid blocking operations
        return true;
    }
}
//# sourceMappingURL=core.js.map