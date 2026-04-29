/**
 * State Frontmatter Sync — Build and sync YAML frontmatter for STATE.md
 *
 * Handles frontmatter synchronization between STATE.md body content and
 * YAML frontmatter block with metadata derived from filesystem state.
 */
import fs from 'fs';
import path from 'path';
import { getMilestoneInfo, getMilestoneEtapaFilter } from '../core.js';
import { reconstructFrontmatter } from '../frontmatter.js';
import { stateExtractField } from './field-utils.js';
/**
 * Read text from argument or file path.
 * If filePath is provided, reads from file; otherwise returns value.
 */
export function readTextArgOrFile(cwd, value, filePath, label) {
    if (!filePath)
        return value ?? null;
    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
    try {
        return fs.readFileSync(resolvedPath, 'utf-8').trimEnd();
    }
    catch {
        throw new Error(`${label} file not found: ${filePath}`);
    }
}
/**
 * Build frontmatter object from STATE.md body content.
 * Extracts fields from body and enriches with filesystem-derived metadata.
 */
export function buildStateFrontmatter(bodyContent, cwd) {
    const etapaAtual = stateExtractField(bodyContent, 'Fase Atual');
    const etapaAtualName = stateExtractField(bodyContent, 'Nome da Fase Atual');
    const currentPlan = stateExtractField(bodyContent, 'Plano Atual');
    const totalEtapasRaw = stateExtractField(bodyContent, 'Total de Fases');
    const totalPlansRaw = stateExtractField(bodyContent, 'Total de Planos na Fase');
    const status = stateExtractField(bodyContent, 'Status');
    const progressRaw = stateExtractField(bodyContent, 'Progresso');
    const lastActivity = stateExtractField(bodyContent, 'Última Atividade');
    const stoppedAt = stateExtractField(bodyContent, 'Parado Em') || stateExtractField(bodyContent, 'Parado em');
    const pausedAt = stateExtractField(bodyContent, 'Pausado Em');
    let milestone = null;
    let milestoneName = null;
    if (cwd) {
        try {
            const info = getMilestoneInfo(cwd);
            milestone = info.version;
            milestoneName = info.name;
        }
        catch { }
    }
    let totalEtapas = totalEtapasRaw ? parseInt(totalEtapasRaw, 10) : null;
    let completedPhases = null;
    let totalPlans = totalPlansRaw ? parseInt(totalPlansRaw, 10) : null;
    let completedPlans = null;
    if (cwd) {
        try {
            const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
            if (fs.existsSync(etapasDir)) {
                const isDirInMilestone = getMilestoneEtapaFilter(cwd);
                const etapasDirs = fs
                    .readdirSync(etapasDir, { withFileTypes: true })
                    .filter((e) => e.isDirectory())
                    .map((e) => e.name)
                    .filter(isDirInMilestone);
                let diskTotalPlans = 0;
                let diskTotalSummaries = 0;
                let diskCompletedPhases = 0;
                for (const dir of etapasDirs) {
                    const files = fs.readdirSync(path.join(etapasDir, dir));
                    const plans = files.filter((f) => f.match(/-PLAN\.md$/i)).length;
                    const summaries = files.filter((f) => f.match(/-SUMMARY\.md$/i)).length;
                    diskTotalPlans += plans;
                    diskTotalSummaries += summaries;
                    if (plans > 0 && summaries >= plans)
                        diskCompletedPhases++;
                }
                totalEtapas =
                    isDirInMilestone.phaseCount > 0
                        ? Math.max(etapasDirs.length, isDirInMilestone.phaseCount)
                        : etapasDirs.length;
                completedPhases = diskCompletedPhases;
                totalPlans = diskTotalPlans;
                completedPlans = diskTotalSummaries;
            }
        }
        catch { }
    }
    let progressPercent = null;
    if (progressRaw) {
        const pctMatch = progressRaw.match(/(\d+)%/);
        if (pctMatch)
            progressPercent = parseInt(pctMatch[1], 10);
    }
    let normalizedStatus = status ?? 'unknown';
    const statusLower = (status ?? '').toLowerCase();
    if (statusLower.includes('paused') || statusLower.includes('stopped') || pausedAt) {
        normalizedStatus = 'paused';
    }
    else if (statusLower.includes('executing') || statusLower.includes('in progress')) {
        normalizedStatus = 'executing';
    }
    else if (statusLower.includes('planning') || statusLower.includes('ready to plan')) {
        normalizedStatus = 'planning';
    }
    else if (statusLower.includes('discussing')) {
        normalizedStatus = 'discussing';
    }
    else if (statusLower.includes('verif')) {
        normalizedStatus = 'verifying';
    }
    else if (statusLower.includes('complete') || statusLower.includes('done')) {
        normalizedStatus = 'completed';
    }
    else if (statusLower.includes('ready to execute')) {
        normalizedStatus = 'executing';
    }
    const fm = { gsd_state_version: '1.0' };
    if (milestone)
        fm['milestone'] = milestone;
    if (milestoneName)
        fm['milestone_name'] = milestoneName;
    if (etapaAtual)
        fm['current_phase'] = etapaAtual;
    if (etapaAtualName)
        fm['current_phase_name'] = etapaAtualName;
    if (currentPlan)
        fm['current_plan'] = currentPlan;
    fm['status'] = normalizedStatus;
    if (stoppedAt)
        fm['stopped_at'] = stoppedAt;
    if (pausedAt)
        fm['paused_at'] = pausedAt;
    fm['last_updated'] = new Date().toISOString();
    if (lastActivity)
        fm['last_activity'] = lastActivity;
    const progress = {};
    if (totalEtapas !== null)
        progress['total_phases'] = totalEtapas;
    if (completedPhases !== null)
        progress['completed_phases'] = completedPhases;
    if (totalPlans !== null)
        progress['total_plans'] = totalPlans;
    if (completedPlans !== null)
        progress['completed_plans'] = completedPlans;
    if (progressPercent !== null)
        progress['percent'] = progressPercent;
    if (Object.keys(progress).length > 0)
        fm['progress'] = progress;
    return fm;
}
/**
 * Strip YAML frontmatter block from content.
 */
export function stripFrontmatter(content) {
    return content.replace(/^---\n[\s\S]*?\n---\n*/, '');
}
/**
 * Sync STATE.md content with updated frontmatter.
 * Strips existing frontmatter, rebuilds from body content, and reconstructs.
 */
export function syncStateFrontmatter(content, cwd) {
    const body = stripFrontmatter(content);
    const fm = buildStateFrontmatter(body, cwd);
    const yamlStr = reconstructFrontmatter(fm);
    return `---\n${yamlStr}\n---\n\n${body}`;
}
//# sourceMappingURL=frontmatter-sync.js.map