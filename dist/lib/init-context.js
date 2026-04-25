/**
 * InitContext — Shared context for FASE initialization commands
 *
 * Deepening of init.ts shallow aggregation. Provides a seam where
 * common context gathering (config, milestone, paths, models) can
 * be reused across all cmdInit* functions.
 *
 * Usage:
 *   const ctx = buildInitContext(cwd);
 *   output({
 *     ...ctx.base(),
 *     my_specific_field: value,
 *   }, raw);
 */
import path from 'path';
import { loadConfig } from './config.js';
import { getMilestoneInfo, pathExistsInternal, resolveModelInternal, findEtapaInternal, getRoadmapEtapaInternal, generateSlugInternal, toPosixPath, } from './core.js';
import fs from 'fs';
/**
 * Build common init context for any init command
 */
export function buildInitContext(cwd) {
    const config = loadConfig(cwd);
    const milestone = getMilestoneInfo(cwd);
    const paths = {
        state: pathExistsInternal(cwd, '.fase-ai/STATE.md'),
        roadmap: pathExistsInternal(cwd, '.fase-ai/ROADMAP.md'),
        project: pathExistsInternal(cwd, '.fase-ai/PROJECT.md'),
        planning: pathExistsInternal(cwd, '.fase-ai'),
        config: pathExistsInternal(cwd, '.fase-ai/config.json'),
        phases: pathExistsInternal(cwd, '.fase-ai/etapas'),
        archive: pathExistsInternal(cwd, '.fase-ai/archive'),
        codebase: pathExistsInternal(cwd, '.fase-ai/codebase'),
        todos: pathExistsInternal(cwd, '.fase-ai/todos'),
        quick: pathExistsInternal(cwd, '.fase-ai/quick'),
    };
    const resolveModel = (role) => resolveModelInternal(cwd, role);
    const base = () => ({
        commit_docs: config.commit_docs,
        milestone_version: milestone.version,
        milestone_name: milestone.name,
        milestone_slug: generateSlugInternal(milestone.name),
        state_exists: paths.state,
        roadmap_exists: paths.roadmap,
        project_exists: paths.project,
        planning_exists: paths.planning,
        config_exists: paths.config,
        state_path: '.fase-ai/STATE.md',
        roadmap_path: '.fase-ai/ROADMAP.md',
        project_path: '.fase-ai/PROJECT.md',
        config_path: '.fase-ai/config.json',
    });
    return {
        cwd,
        config,
        milestone,
        paths,
        resolveModel,
        base,
    };
}
/**
 * Build extended context for phase-related init commands
 */
export function buildPhaseContext(cwd, phase) {
    const baseCtx = buildInitContext(cwd);
    const phaseInfo = findEtapaInternal(cwd, phase);
    // Extract requirements from roadmap
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
    const phaseReqIds = reqExtracted && reqExtracted !== 'TBD' ? reqExtracted : null;
    // Phase-specific paths
    const phasePaths = {
        context: null,
        research: null,
        verification: null,
        uat: null,
    };
    if (phaseInfo?.directory) {
        const phaseDirFull = path.join(cwd, phaseInfo.directory);
        try {
            const files = fs.readdirSync(phaseDirFull);
            const contextFile = files.find((f) => f.endsWith('-CONTEXT.md') || f === 'CONTEXT.md');
            if (contextFile)
                phasePaths.context = toPosixPath(path.join(phaseInfo.directory, contextFile));
            const researchFile = files.find((f) => f.endsWith('-RESEARCH.md') || f === 'RESEARCH.md');
            if (researchFile)
                phasePaths.research = toPosixPath(path.join(phaseInfo.directory, researchFile));
            const verificationFile = files.find((f) => f.endsWith('-VERIFICATION.md') || f === 'VERIFICATION.md');
            if (verificationFile)
                phasePaths.verification = toPosixPath(path.join(phaseInfo.directory, verificationFile));
            const uatFile = files.find((f) => f.endsWith('-UAT.md') || f === 'UAT.md');
            if (uatFile)
                phasePaths.uat = toPosixPath(path.join(phaseInfo.directory, uatFile));
        }
        catch { }
    }
    const phaseBase = () => ({
        ...baseCtx.base(),
        phase_found: !!phaseInfo,
        phase_dir: phaseInfo?.directory || null,
        phase_number: phaseInfo?.phase_number || null,
        phase_name: phaseInfo?.phase_name || null,
        phase_slug: phaseInfo?.phase_slug || null,
        padded_phase: phaseInfo?.phase_number?.padStart(2, '0') || null,
        phase_req_ids: phaseReqIds,
        has_research: phaseInfo?.has_research || false,
        has_context: phaseInfo?.has_context || false,
        has_plans: (phaseInfo?.plans?.length || 0) > 0,
        has_verification: phaseInfo?.has_verification || false,
        plan_count: phaseInfo?.plans?.length || 0,
        context_path: phasePaths.context,
        research_path: phasePaths.research,
        verification_path: phasePaths.verification,
        uat_path: phasePaths.uat,
        requirements_path: '.fase-ai/REQUIREMENTS.md',
    });
    return {
        ...baseCtx,
        phase,
        phaseInfo,
        phaseReqIds,
        phasePaths,
        phaseBase,
    };
}
//# sourceMappingURL=init-context.js.map