/**
 * Init — Compound init commands for workflow bootstrapping
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { loadConfig, resolveModelInternal, findEtapaInternal, getRoadmapEtapaInternal, pathExistsInternal, generateSlugInternal, getMilestoneInfo, toPosixPath, output, error, } from './core.js';
/**
 * Validates that a directory path is safe for use with shell commands.
 * Checks that the directory exists and doesn't contain suspicious patterns.
 * @param dir - Directory path to validate
 * @throws Error if directory is invalid or unsafe
 */
function validateCwdForShell(dir) {
    if (!dir) {
        throw new Error('Directory path is empty');
    }
    // Check for path traversal attempts
    if (dir.includes('..') || dir.includes(';') || dir.includes('|') || dir.includes('&')) {
        throw new Error(`Invalid directory path: ${dir}`);
    }
    // Verify directory exists
    if (!fs.existsSync(dir)) {
        throw new Error(`Directory does not exist: ${dir}`);
    }
    const stats = fs.statSync(dir);
    if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${dir}`);
    }
    // Verify it's within user's home or project directories (basic trust check)
    const resolved = path.resolve(dir);
    const homeDir = os.homedir();
    if (!resolved.startsWith(homeDir)) {
        // Allow /tmp for temporary operations
        if (!resolved.startsWith('/tmp') && !resolved.startsWith(path.sep + 'tmp')) {
            process.stderr.write(`[init] Warning: Using directory outside home: ${resolved}\n`);
        }
    }
}
/**
 * Recursively searches for code files in a directory.
 * Safe alternative to shell find command.
 * @param dir - Directory to search
 * @param maxDepth - Maximum recursion depth
 * @param extensions - File extensions to look for
 * @returns Array of matching file paths
 */
function findCodeFiles(dir, maxDepth, extensions) {
    const results = [];
    const skipDirs = [
        'node_modules',
        '.git',
        '.svn',
        '.hg',
        '__pycache__',
        'vendor',
        'dist',
        'build',
    ];
    function search(currentDir, depth) {
        if (depth > maxDepth)
            return;
        try {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && !skipDirs.includes(entry.name)) {
                    search(path.join(currentDir, entry.name), depth + 1);
                }
                else if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    if (extensions.includes(ext)) {
                        results.push(path.join(currentDir, entry.name));
                        if (results.length >= 5)
                            return;
                    }
                }
            }
        }
        catch {
            // Skip directories we can't read
        }
    }
    search(dir, 0);
    return results;
}
export function cmdInitExecutePhase(cwd, phase, raw) {
    if (!phase) {
        error('fase obrigatória');
    }
    const config = loadConfig(cwd);
    const phaseInfo = findEtapaInternal(cwd, phase);
    const milestone = getMilestoneInfo(cwd);
    const roadmapEtapa = getRoadmapEtapaInternal(cwd, phase);
    const reqMatch = roadmapEtapa?.section?.match(/^\*\*Requirements\*\*:[^\S\n]*([^\n]*)$/m);
    const reqExtracted = reqMatch
        ? reqMatch[1]
            .replace(/[\[\]]/g, '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .join(', ')
        : null;
    const phase_req_ids = reqExtracted && reqExtracted !== 'TBD' ? reqExtracted : null;
    const branchName = config.branching_strategy === 'phase' && phaseInfo
        ? config.etapa_branch_template
            .replace('{phase}', phaseInfo.phase_number ?? '')
            .replace('{slug}', phaseInfo.phase_slug || 'phase')
        : config.branching_strategy === 'milestone'
            ? config.milestone_branch_template
                .replace('{milestone}', milestone.version)
                .replace('{slug}', generateSlugInternal(milestone.name) || 'milestone')
            : null;
    const result = {
        executor_model: resolveModelInternal(cwd, 'gsd-executor'),
        verifier_model: resolveModelInternal(cwd, 'gsd-verifier'),
        commit_docs: config.commit_docs,
        parallelization: config.parallelization,
        branching_strategy: config.branching_strategy,
        etapa_branch_template: config.etapa_branch_template,
        milestone_branch_template: config.milestone_branch_template,
        verifier_enabled: config.verifier,
        phase_found: !!phaseInfo,
        phase_dir: phaseInfo?.directory || null,
        phase_number: phaseInfo?.phase_number || null,
        phase_name: phaseInfo?.phase_name || null,
        phase_slug: phaseInfo?.phase_slug || null,
        phase_req_ids,
        plans: phaseInfo?.plans || [],
        summaries: phaseInfo?.summaries || [],
        incomplete_plans: phaseInfo?.incomplete_plans || [],
        plan_count: phaseInfo?.plans?.length || 0,
        incomplete_count: phaseInfo?.incomplete_plans?.length || 0,
        branch_name: branchName,
        milestone_version: milestone.version,
        milestone_name: milestone.name,
        milestone_slug: generateSlugInternal(milestone.name),
        state_exists: pathExistsInternal(cwd, '.fase-ai/STATE.md'),
        roadmap_exists: pathExistsInternal(cwd, '.fase-ai/ROADMAP.md'),
        config_exists: pathExistsInternal(cwd, '.fase-ai/config.json'),
        state_path: '.fase-ai/STATE.md',
        roadmap_path: '.fase-ai/ROADMAP.md',
        config_path: '.fase-ai/config.json',
    };
    output(result, raw);
}
export function cmdInitPlanPhase(cwd, phase, raw) {
    if (!phase) {
        error('fase obrigatória');
    }
    const config = loadConfig(cwd);
    const phaseInfo = findEtapaInternal(cwd, phase);
    const roadmapEtapa = getRoadmapEtapaInternal(cwd, phase);
    const reqMatch = roadmapEtapa?.section?.match(/^\*\*Requirements\*\*:[^\S\n]*([^\n]*)$/m);
    const reqExtracted = reqMatch
        ? reqMatch[1]
            .replace(/[\[\]]/g, '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .join(', ')
        : null;
    const phase_req_ids = reqExtracted && reqExtracted !== 'TBD' ? reqExtracted : null;
    const result = {
        researcher_model: resolveModelInternal(cwd, 'gsd-phase-researcher'),
        planner_model: resolveModelInternal(cwd, 'gsd-planner'),
        checker_model: resolveModelInternal(cwd, 'gsd-plan-checker'),
        research_enabled: config.research,
        plan_checker_enabled: config.plan_checker,
        nyquist_validation_enabled: config.nyquist_validation,
        commit_docs: config.commit_docs,
        phase_found: !!phaseInfo,
        phase_dir: phaseInfo?.directory || null,
        phase_number: phaseInfo?.phase_number || null,
        phase_name: phaseInfo?.phase_name || null,
        phase_slug: phaseInfo?.phase_slug || null,
        padded_phase: phaseInfo?.phase_number?.padStart(2, '0') || null,
        phase_req_ids,
        has_research: phaseInfo?.has_research || false,
        has_context: phaseInfo?.has_context || false,
        has_plans: (phaseInfo?.plans?.length || 0) > 0,
        plan_count: phaseInfo?.plans?.length || 0,
        planning_exists: pathExistsInternal(cwd, '.fase-ai'),
        roadmap_exists: pathExistsInternal(cwd, '.fase-ai/ROADMAP.md'),
        state_path: '.fase-ai/STATE.md',
        roadmap_path: '.fase-ai/ROADMAP.md',
        requirements_path: '.fase-ai/REQUIREMENTS.md',
    };
    if (phaseInfo?.directory) {
        const phaseDirFull = path.join(cwd, phaseInfo.directory);
        try {
            const files = fs.readdirSync(phaseDirFull);
            const contextFile = files.find((f) => f.endsWith('-CONTEXT.md') || f === 'CONTEXT.md');
            if (contextFile)
                result.context_path = toPosixPath(path.join(phaseInfo.directory, contextFile));
            const researchFile = files.find((f) => f.endsWith('-RESEARCH.md') || f === 'RESEARCH.md');
            if (researchFile)
                result.research_path = toPosixPath(path.join(phaseInfo.directory, researchFile));
            const verificationFile = files.find((f) => f.endsWith('-VERIFICATION.md') || f === 'VERIFICATION.md');
            if (verificationFile)
                result.verification_path = toPosixPath(path.join(phaseInfo.directory, verificationFile));
            const uatFile = files.find((f) => f.endsWith('-UAT.md') || f === 'UAT.md');
            if (uatFile)
                result.uat_path = toPosixPath(path.join(phaseInfo.directory, uatFile));
        }
        catch { }
    }
    output(result, raw);
}
export function cmdInitNewProject(cwd, raw) {
    const config = loadConfig(cwd);
    const hasBraveSearch = !!process.env['BRAVE_API_KEY'];
    let hasCode = false;
    let hasPackageFile = false;
    // Validate cwd before use with file operations
    try {
        validateCwdForShell(cwd);
        const codeExtensions = ['.ts', '.js', '.py', '.go', '.rs', '.swift', '.java'];
        const codeFiles = findCodeFiles(cwd, 3, codeExtensions);
        hasCode = codeFiles.length > 0;
    }
    catch (err) {
        process.stderr.write(`[cmdInitNewProject] Error scanning for code files: ${err.message}\n`);
    }
    hasPackageFile =
        pathExistsInternal(cwd, 'package.json') ||
            pathExistsInternal(cwd, 'requirements.txt') ||
            pathExistsInternal(cwd, 'Cargo.toml') ||
            pathExistsInternal(cwd, 'go.mod') ||
            pathExistsInternal(cwd, 'Package.swift');
    const result = {
        researcher_model: resolveModelInternal(cwd, 'gsd-project-researcher'),
        synthesizer_model: resolveModelInternal(cwd, 'gsd-research-synthesizer'),
        roadmapper_model: resolveModelInternal(cwd, 'gsd-roadmapper'),
        commit_docs: config.commit_docs,
        project_exists: pathExistsInternal(cwd, '.fase-ai/PROJECT.md'),
        has_codebase_map: pathExistsInternal(cwd, '.fase-ai/codebase'),
        planning_exists: pathExistsInternal(cwd, '.fase-ai'),
        has_existing_code: hasCode,
        has_package_file: hasPackageFile,
        is_brownfield: hasCode || hasPackageFile,
        needs_codebase_map: (hasCode || hasPackageFile) && !pathExistsInternal(cwd, '.fase-ai/codebase'),
        has_git: pathExistsInternal(cwd, '.git'),
        brave_search_available: hasBraveSearch,
        project_path: '.fase-ai/PROJECT.md',
    };
    output(result, raw);
}
export function cmdInitNewMilestone(cwd, raw) {
    const config = loadConfig(cwd);
    const milestone = getMilestoneInfo(cwd);
    const result = {
        researcher_model: resolveModelInternal(cwd, 'gsd-project-researcher'),
        synthesizer_model: resolveModelInternal(cwd, 'gsd-research-synthesizer'),
        roadmapper_model: resolveModelInternal(cwd, 'gsd-roadmapper'),
        commit_docs: config.commit_docs,
        research_enabled: config.research,
        current_milestone: milestone.version,
        current_milestone_name: milestone.name,
        project_exists: pathExistsInternal(cwd, '.fase-ai/PROJECT.md'),
        roadmap_exists: pathExistsInternal(cwd, '.fase-ai/ROADMAP.md'),
        state_exists: pathExistsInternal(cwd, '.fase-ai/STATE.md'),
        project_path: '.fase-ai/PROJECT.md',
        roadmap_path: '.fase-ai/ROADMAP.md',
        state_path: '.fase-ai/STATE.md',
    };
    output(result, raw);
}
export function cmdInitQuick(cwd, description, raw) {
    const config = loadConfig(cwd);
    const now = new Date();
    const slug = description ? generateSlugInternal(description)?.substring(0, 40) : null;
    const quickDir = path.join(cwd, '.fase-ai', 'quick');
    let nextNum = 1;
    try {
        const existing = fs
            .readdirSync(quickDir)
            .filter((f) => /^\d+-/.test(f))
            .map((f) => parseInt(f.split('-')[0], 10))
            .filter((n) => !isNaN(n));
        if (existing.length > 0) {
            nextNum = Math.max(...existing) + 1;
        }
    }
    catch { }
    const result = {
        planner_model: resolveModelInternal(cwd, 'gsd-planner'),
        executor_model: resolveModelInternal(cwd, 'gsd-executor'),
        checker_model: resolveModelInternal(cwd, 'gsd-plan-checker'),
        verifier_model: resolveModelInternal(cwd, 'gsd-verifier'),
        commit_docs: config.commit_docs,
        next_num: nextNum,
        slug: slug,
        description: description || null,
        date: now.toISOString().split('T')[0],
        timestamp: now.toISOString(),
        quick_dir: '.fase-ai/quick',
        task_dir: slug ? `.fase-ai/quick/${nextNum}-${slug}` : null,
        roadmap_exists: pathExistsInternal(cwd, '.fase-ai/ROADMAP.md'),
        planning_exists: pathExistsInternal(cwd, '.fase-ai'),
    };
    output(result, raw);
}
export function cmdInitResume(cwd, raw) {
    const config = loadConfig(cwd);
    let interruptedAgentId = null;
    try {
        interruptedAgentId = fs
            .readFileSync(path.join(cwd, '.fase-ai', 'current-agent-id.txt'), 'utf-8')
            .trim();
    }
    catch { }
    const result = {
        state_exists: pathExistsInternal(cwd, '.fase-ai/STATE.md'),
        roadmap_exists: pathExistsInternal(cwd, '.fase-ai/ROADMAP.md'),
        project_exists: pathExistsInternal(cwd, '.fase-ai/PROJECT.md'),
        planning_exists: pathExistsInternal(cwd, '.fase-ai'),
        state_path: '.fase-ai/STATE.md',
        roadmap_path: '.fase-ai/ROADMAP.md',
        project_path: '.fase-ai/PROJECT.md',
        has_interrupted_agent: !!interruptedAgentId,
        interrupted_agent_id: interruptedAgentId,
        commit_docs: config.commit_docs,
    };
    output(result, raw);
}
export function cmdInitVerifyWork(cwd, phase, raw) {
    if (!phase) {
        error('fase obrigatória');
    }
    const config = loadConfig(cwd);
    const phaseInfo = findEtapaInternal(cwd, phase);
    const result = {
        planner_model: resolveModelInternal(cwd, 'gsd-planner'),
        checker_model: resolveModelInternal(cwd, 'gsd-plan-checker'),
        commit_docs: config.commit_docs,
        phase_found: !!phaseInfo,
        phase_dir: phaseInfo?.directory || null,
        phase_number: phaseInfo?.phase_number || null,
        phase_name: phaseInfo?.phase_name || null,
        has_verification: phaseInfo?.has_verification || false,
    };
    output(result, raw);
}
export function cmdInitPhaseOp(cwd, phase, raw) {
    const config = loadConfig(cwd);
    let phaseInfo = findEtapaInternal(cwd, phase);
    if (!phaseInfo) {
        const roadmapEtapa = getRoadmapEtapaInternal(cwd, phase);
        if (roadmapEtapa?.found) {
            const etapaNome = roadmapEtapa.phase_name;
            phaseInfo = {
                found: true,
                directory: null,
                phase_number: roadmapEtapa.phase_number,
                phase_name: etapaNome,
                phase_slug: etapaNome
                    ? etapaNome
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '')
                    : null,
                plans: [],
                summaries: [],
                incomplete_plans: [],
                has_research: false,
                has_context: false,
                has_verification: false,
            };
        }
    }
    const result = {
        commit_docs: config.commit_docs,
        brave_search: config.brave_search,
        phase_found: !!phaseInfo,
        phase_dir: phaseInfo?.directory || null,
        phase_number: phaseInfo?.phase_number || null,
        phase_name: phaseInfo?.phase_name || null,
        phase_slug: phaseInfo?.phase_slug || null,
        padded_phase: phaseInfo?.phase_number?.padStart(2, '0') || null,
        has_research: phaseInfo?.has_research || false,
        has_context: phaseInfo?.has_context || false,
        has_plans: (phaseInfo?.plans?.length || 0) > 0,
        has_verification: phaseInfo?.has_verification || false,
        plan_count: phaseInfo?.plans?.length || 0,
        roadmap_exists: pathExistsInternal(cwd, '.fase-ai/ROADMAP.md'),
        planning_exists: pathExistsInternal(cwd, '.fase-ai'),
        state_path: '.fase-ai/STATE.md',
        roadmap_path: '.fase-ai/ROADMAP.md',
        requirements_path: '.fase-ai/REQUIREMENTS.md',
    };
    if (phaseInfo?.directory) {
        const phaseDirFull = path.join(cwd, phaseInfo.directory);
        try {
            const files = fs.readdirSync(phaseDirFull);
            const contextFile = files.find((f) => f.endsWith('-CONTEXT.md') || f === 'CONTEXT.md');
            if (contextFile)
                result.context_path = toPosixPath(path.join(phaseInfo.directory, contextFile));
            const researchFile = files.find((f) => f.endsWith('-RESEARCH.md') || f === 'RESEARCH.md');
            if (researchFile)
                result.research_path = toPosixPath(path.join(phaseInfo.directory, researchFile));
            const verificationFile = files.find((f) => f.endsWith('-VERIFICATION.md') || f === 'VERIFICATION.md');
            if (verificationFile)
                result.verification_path = toPosixPath(path.join(phaseInfo.directory, verificationFile));
            const uatFile = files.find((f) => f.endsWith('-UAT.md') || f === 'UAT.md');
            if (uatFile)
                result.uat_path = toPosixPath(path.join(phaseInfo.directory, uatFile));
        }
        catch { }
    }
    output(result, raw);
}
export function cmdInitTodos(cwd, area, raw) {
    const config = loadConfig(cwd);
    const now = new Date();
    const pendingDir = path.join(cwd, '.fase-ai', 'todos', 'pending');
    let count = 0;
    const todos = [];
    try {
        const files = fs.readdirSync(pendingDir).filter((f) => f.endsWith('.md'));
        for (const file of files) {
            try {
                const content = fs.readFileSync(path.join(pendingDir, file), 'utf-8');
                const createdMatch = content.match(/^created:\s*(.+)$/m);
                const titleMatch = content.match(/^title:\s*(.+)$/m);
                const areaMatch = content.match(/^area:\s*(.+)$/m);
                const todoArea = areaMatch ? areaMatch[1].trim() : 'general';
                if (area && todoArea !== area)
                    continue;
                count++;
                todos.push({
                    file,
                    created: createdMatch ? createdMatch[1].trim() : 'unknown',
                    title: titleMatch ? titleMatch[1].trim() : 'Sem título',
                    area: todoArea,
                    path: '.fase-ai/todos/pending/' + file,
                });
            }
            catch { }
        }
    }
    catch { }
    const result = {
        commit_docs: config.commit_docs,
        date: now.toISOString().split('T')[0],
        timestamp: now.toISOString(),
        todo_count: count,
        todos,
        area_filter: area || null,
        pending_dir: '.fase-ai/todos/pending',
        completed_dir: '.fase-ai/todos/completed',
        planning_exists: pathExistsInternal(cwd, '.fase-ai'),
        todos_dir_exists: pathExistsInternal(cwd, '.fase-ai/todos'),
        pending_dir_exists: pathExistsInternal(cwd, '.fase-ai/todos/pending'),
    };
    output(result, raw);
}
export function cmdInitMilestoneOp(cwd, raw) {
    const config = loadConfig(cwd);
    const milestone = getMilestoneInfo(cwd);
    let phaseCount = 0;
    let completedPhases = 0;
    const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
    try {
        const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
        const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
        phaseCount = dirs.length;
        for (const dir of dirs) {
            try {
                const phaseFiles = fs.readdirSync(path.join(etapasDir, dir));
                const hasSummary = phaseFiles.some((f) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md');
                if (hasSummary)
                    completedPhases++;
            }
            catch { }
        }
    }
    catch { }
    const archiveDir = path.join(cwd, '.fase-ai', 'archive');
    let archivedMilestones = [];
    try {
        archivedMilestones = fs
            .readdirSync(archiveDir, { withFileTypes: true })
            .filter((e) => e.isDirectory())
            .map((e) => e.name);
    }
    catch { }
    const result = {
        commit_docs: config.commit_docs,
        milestone_version: milestone.version,
        milestone_name: milestone.name,
        milestone_slug: generateSlugInternal(milestone.name),
        phase_count: phaseCount,
        completed_phases: completedPhases,
        all_phases_complete: phaseCount > 0 && phaseCount === completedPhases,
        archived_milestones: archivedMilestones,
        archive_count: archivedMilestones.length,
        project_exists: pathExistsInternal(cwd, '.fase-ai/PROJECT.md'),
        roadmap_exists: pathExistsInternal(cwd, '.fase-ai/ROADMAP.md'),
        state_exists: pathExistsInternal(cwd, '.fase-ai/STATE.md'),
        archive_exists: pathExistsInternal(cwd, '.fase-ai/archive'),
        phases_dir_exists: pathExistsInternal(cwd, '.fase-ai/phases'),
    };
    output(result, raw);
}
export function cmdInitMapCodebase(cwd, raw) {
    const config = loadConfig(cwd);
    const codebaseDir = path.join(cwd, '.fase-ai', 'codebase');
    let existingMaps = [];
    try {
        existingMaps = fs.readdirSync(codebaseDir).filter((f) => f.endsWith('.md'));
    }
    catch { }
    const result = {
        mapper_model: resolveModelInternal(cwd, 'gsd-codebase-mapper'),
        commit_docs: config.commit_docs,
        search_gitignored: config.search_gitignored,
        parallelization: config.parallelization,
        codebase_dir: '.fase-ai/codebase',
        existing_maps: existingMaps,
        has_maps: existingMaps.length > 0,
        planning_exists: pathExistsInternal(cwd, '.fase-ai'),
        codebase_dir_exists: pathExistsInternal(cwd, '.fase-ai/codebase'),
    };
    output(result, raw);
}
export function cmdInitProgress(cwd, raw) {
    const config = loadConfig(cwd);
    const milestone = getMilestoneInfo(cwd);
    const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
    const phases = [];
    let etapaAtual = null;
    let nextEtapa = null;
    try {
        const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
        const dirs = entries
            .filter((e) => e.isDirectory())
            .map((e) => e.name)
            .sort();
        for (const dir of dirs) {
            const match = dir.match(/^(\d+(?:\.\d+)*)-?(.*)/);
            const etapaNumber = match ? match[1] : dir;
            const etapaNome = match && match[2] ? match[2] : null;
            const phasePath = path.join(etapasDir, dir);
            const phaseFiles = fs.readdirSync(phasePath);
            const plans = phaseFiles.filter((f) => f.endsWith('-PLAN.md') || f === 'PLAN.md');
            const summaries = phaseFiles.filter((f) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md');
            const hasResearch = phaseFiles.some((f) => f.endsWith('-RESEARCH.md') || f === 'RESEARCH.md');
            const status = summaries.length >= plans.length && plans.length > 0
                ? 'complete'
                : plans.length > 0
                    ? 'in_progress'
                    : hasResearch
                        ? 'researched'
                        : 'pending';
            const phaseInfo = {
                number: etapaNumber,
                name: etapaNome,
                directory: '.fase-ai/phases/' + dir,
                status,
                plan_count: plans.length,
                summary_count: summaries.length,
                has_research: hasResearch,
            };
            phases.push(phaseInfo);
            if (!etapaAtual && (status === 'in_progress' || status === 'researched')) {
                etapaAtual = phaseInfo;
            }
            if (!nextEtapa && status === 'pending') {
                nextEtapa = phaseInfo;
            }
        }
    }
    catch { }
    let pausedAt = null;
    try {
        const state = fs.readFileSync(path.join(cwd, '.fase-ai', 'STATE.md'), 'utf-8');
        const pauseMatch = state.match(/\*\*Paused At:\*\*\s*(.+)/);
        if (pauseMatch)
            pausedAt = pauseMatch[1].trim();
    }
    catch { }
    const result = {
        executor_model: resolveModelInternal(cwd, 'gsd-executor'),
        planner_model: resolveModelInternal(cwd, 'gsd-planner'),
        commit_docs: config.commit_docs,
        milestone_version: milestone.version,
        milestone_name: milestone.name,
        phases,
        phase_count: phases.length,
        completed_count: phases.filter((p) => p.status === 'complete').length,
        in_progress_count: phases.filter((p) => p.status === 'in_progress').length,
        current_phase: etapaAtual,
        next_phase: nextEtapa,
        paused_at: pausedAt,
        has_work_in_progress: !!etapaAtual,
        project_exists: pathExistsInternal(cwd, '.fase-ai/PROJECT.md'),
        roadmap_exists: pathExistsInternal(cwd, '.fase-ai/ROADMAP.md'),
        state_exists: pathExistsInternal(cwd, '.fase-ai/STATE.md'),
        state_path: '.fase-ai/STATE.md',
        roadmap_path: '.fase-ai/ROADMAP.md',
        project_path: '.fase-ai/PROJECT.md',
        config_path: '.fase-ai/config.json',
    };
    output(result, raw);
}
//# sourceMappingURL=init.js.map