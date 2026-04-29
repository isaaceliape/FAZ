/**
 * State — STATE.md operations and progression engine
 *
 * This module provides command functions for STATE.md manipulation.
 * Core utilities are in submodules:
 *   - state/types.ts: Options interfaces
 *   - state/field-utils.ts: Field extraction/replacement
 *   - state/frontmatter-sync.ts: Frontmatter synchronization
 *   - state/lock.ts: PID-based file locking and writeStateMd
 */
import fs from 'fs';
import path from 'path';
import { output, error } from './core.js';
import { loadConfig } from './config.js';
import { extractFrontmatter } from './frontmatter.js';
import { stateExtractField, stateReplaceField } from './state/field-utils.js';
import { readTextArgOrFile, buildStateFrontmatter, stripFrontmatter } from './state/frontmatter-sync.js';
import { writeStateMd } from './state/lock.js';
export { stateExtractField, stateReplaceField } from './state/field-utils.js';
export { writeStateMd } from './state/lock.js';
// ─── Commands ────────────────────────────────────────────────────────────────
export function cmdStateLoad(cwd, raw) {
    const config = loadConfig(cwd);
    const planejamentoDir = path.join(cwd, '.fase-ai');
    let stateRaw = '';
    try {
        stateRaw = fs.readFileSync(path.join(planejamentoDir, 'STATE.md'), 'utf-8');
    }
    catch (err) {
        // STATE.md doesn't exist yet - that's OK for new projects
        process.stderr.write(`[state:cmdStateLoad] STATE.md not found: ${err.message}\n`);
    }
    const configExists = fs.existsSync(path.join(planejamentoDir, 'config.json'));
    const roadmapExists = fs.existsSync(path.join(planejamentoDir, 'ROADMAP.md'));
    const stateExists = stateRaw.length > 0;
    if (raw) {
        const c = config;
        const lines = [
            `model_profile=${c.model_profile}`,
            `commit_docs=${c.commit_docs}`,
            `branching_strategy=${c.branching_strategy}`,
            `etapa_branch_template=${c.etapa_branch_template}`,
            `milestone_branch_template=${c.milestone_branch_template}`,
            `parallelization=${c.parallelization}`,
            `research=${c.research}`,
            `plan_checker=${c.plan_checker}`,
            `verifier=${c.verifier}`,
            `config_exists=${configExists}`,
            `roadmap_exists=${roadmapExists}`,
            `state_exists=${stateExists}`,
        ];
        process.stdout.write(lines.join('\n'));
        process.exit(0);
    }
    output({
        config,
        state_raw: stateRaw,
        state_exists: stateExists,
        roadmap_exists: roadmapExists,
        config_exists: configExists,
    });
}
export function cmdStateGet(cwd, section, raw) {
    const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
    try {
        const content = fs.readFileSync(statePath, 'utf-8');
        if (!section) {
            output({ content }, raw, content);
            return;
        }
        const fieldEscaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const boldPattern = new RegExp(`\\*\\*${fieldEscaped}:\\*\\*\\s*(.*)`, 'i');
        const boldMatch = content.match(boldPattern);
        if (boldMatch) {
            output({ [section]: boldMatch[1].trim() }, raw, boldMatch[1].trim());
            return;
        }
        const plainPattern = new RegExp(`^${fieldEscaped}:\\s*(.*)`, 'im');
        const plainMatch = content.match(plainPattern);
        if (plainMatch) {
            output({ [section]: plainMatch[1].trim() }, raw, plainMatch[1].trim());
            return;
        }
        const sectionPattern = new RegExp(`##\\s*${fieldEscaped}\\s*\n([\\s\\S]*?)(?=\\n##|$)`, 'i');
        const sectionMatch = content.match(sectionPattern);
        if (sectionMatch) {
            output({ [section]: sectionMatch[1].trim() }, raw, sectionMatch[1].trim());
            return;
        }
        output({ error: `Seção ou campo "${section}" não encontrado` }, raw, '');
    }
    catch (err) {
        process.stderr.write(`[state:cmdStateGet] Error reading STATE.md: ${err.message}\n`);
        error('STATE.md não encontrado');
    }
}
export function cmdStatePatch(cwd, patches, raw) {
    const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
    try {
        let content = fs.readFileSync(statePath, 'utf-8');
        const results = { updated: [], failed: [] };
        for (const [field, value] of Object.entries(patches)) {
            const fieldEscaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const boldPattern = new RegExp(`(\\*\\*${fieldEscaped}:\\*\\*\\s*)(.*)`, 'i');
            const plainPattern = new RegExp(`(^${fieldEscaped}:\\s*)(.*)`, 'im');
            if (boldPattern.test(content)) {
                content = content.replace(boldPattern, (_match, prefix) => `${prefix}${value}`);
                results.updated.push(field);
            }
            else if (plainPattern.test(content)) {
                content = content.replace(plainPattern, (_match, prefix) => `${prefix}${value}`);
                results.updated.push(field);
            }
            else {
                results.failed.push(field);
            }
        }
        if (results.updated.length > 0)
            writeStateMd(statePath, content, cwd);
        output(results, raw, results.updated.length > 0 ? 'true' : 'false');
    }
    catch (err) {
        process.stderr.write(`[state:cmdStatePatch] Error: ${err.message}\n`);
        error('STATE.md not found');
    }
}
export function cmdStateUpdate(cwd, field, value) {
    if (!field || value === undefined)
        error('campo e valor obrigatórios para atualização de estado');
    const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
    try {
        let content = fs.readFileSync(statePath, 'utf-8');
        const fieldEscaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const boldPattern = new RegExp(`(\\*\\*${fieldEscaped}:\\*\\*\\s*)(.*)`, 'i');
        const plainPattern = new RegExp(`(^${fieldEscaped}:\\s*)(.*)`, 'im');
        if (boldPattern.test(content)) {
            content = content.replace(boldPattern, (_match, prefix) => `${prefix}${value}`);
            writeStateMd(statePath, content, cwd);
            output({ updated: true });
        }
        else if (plainPattern.test(content)) {
            content = content.replace(plainPattern, (_match, prefix) => `${prefix}${value}`);
            writeStateMd(statePath, content, cwd);
            output({ updated: true });
        }
        else {
            output({ updated: false, reason: `Campo "${field}" não encontrado em STATE.md` });
        }
    }
    catch {
        output({ updated: false, reason: 'STATE.md not found' });
    }
}
export function cmdStateAdvancePlan(cwd, raw) {
    const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
    if (!fs.existsSync(statePath)) {
        output({ error: 'STATE.md not found' }, raw);
        return;
    }
    let content = fs.readFileSync(statePath, 'utf-8');
    const currentPlan = parseInt(stateExtractField(content, 'Current Plan') ?? '', 10);
    const totalPlans = parseInt(stateExtractField(content, 'Total Plans in Phase') ?? '', 10);
    const today = new Date().toISOString().split('T')[0];
    if (isNaN(currentPlan) || isNaN(totalPlans)) {
        output({ error: 'Não é possível analisar Plano Atual ou Total de Planos da Fase do STATE.md' }, raw);
        return;
    }
    if (currentPlan >= totalPlans) {
        content =
            stateReplaceField(content, 'Status', 'Fase completa — pronta para verificação') ?? content;
        content = stateReplaceField(content, 'Last Activity', today) ?? content;
        writeStateMd(statePath, content, cwd);
        output({
            advanced: false,
            reason: 'last_plan',
            current_plan: currentPlan,
            total_plans: totalPlans,
            status: 'ready_for_verification',
        }, raw, 'false');
    }
    else {
        const newPlan = currentPlan + 1;
        content = stateReplaceField(content, 'Plano Atual', String(newPlan)) ?? content;
        content = stateReplaceField(content, 'Status', 'Pronto para executar') ?? content;
        content = stateReplaceField(content, 'Last Activity', today) ?? content;
        writeStateMd(statePath, content, cwd);
        output({
            advanced: true,
            previous_plan: currentPlan,
            current_plan: newPlan,
            total_plans: totalPlans,
        }, raw, 'true');
    }
}
export function cmdStateRecordMetric(cwd, options, raw) {
    const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
    if (!fs.existsSync(statePath)) {
        output({ error: 'STATE.md not found' }, raw);
        return;
    }
    let content = fs.readFileSync(statePath, 'utf-8');
    const { phase, plan, duration, tasks, files } = options;
    if (!phase || !plan || !duration) {
        output({ error: 'fase, plano e duração obrigatórios' }, raw);
        return;
    }
    const metricsPattern = /(##\s*Métricas de Desempenho[\s\S]*?\n\|[^\n]+\n\|[-|\s]+\n)([\s\S]*?)(?=\n##|\n$|$)/i;
    const metricsMatch = content.match(metricsPattern);
    if (metricsMatch) {
        let tableBody = metricsMatch[2].trimEnd();
        const newRow = `| Etapa ${phase} P${plan} | ${duration} | ${tasks ?? '-'} tasks | ${files ?? '-'} files |`;
        if (tableBody.trim() === '' || tableBody.includes('None yet')) {
            tableBody = newRow;
        }
        else {
            tableBody = tableBody + '\n' + newRow;
        }
        content = content.replace(metricsPattern, (_match, header) => `${header}${tableBody}\n`);
        writeStateMd(statePath, content, cwd);
        output({ recorded: true, phase, plan, duration }, raw, 'true');
    }
    else {
        output({ recorded: false, reason: 'Seção de Métricas de Desempenho não encontrada em STATE.md' }, raw, 'false');
    }
}
export function cmdStateUpdateProgress(cwd, raw) {
    const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
    if (!fs.existsSync(statePath)) {
        output({ error: 'STATE.md not found' }, raw);
        return;
    }
    let content = fs.readFileSync(statePath, 'utf-8');
    const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
    let totalPlans = 0;
    let totalSummaries = 0;
    if (fs.existsSync(etapasDir)) {
        const etapasDirs = fs
            .readdirSync(etapasDir, { withFileTypes: true })
            .filter((e) => e.isDirectory())
            .map((e) => e.name);
        for (const dir of etapasDirs) {
            const files = fs.readdirSync(path.join(etapasDir, dir));
            totalPlans += files.filter((f) => f.match(/-PLAN\.md$/i)).length;
            totalSummaries += files.filter((f) => f.match(/-SUMMARY\.md$/i)).length;
        }
    }
    const percent = totalPlans > 0 ? Math.min(100, Math.round((totalSummaries / totalPlans) * 100)) : 0;
    const barWidth = 10;
    const filled = Math.round((percent / 100) * barWidth);
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(barWidth - filled);
    const progressStr = `[${bar}] ${percent}%`;
    const boldProgressPattern = /(\*\*Progresso:\*\*\s*).*/i;
    const plainProgressPattern = /^(Progresso:\s*).*/im;
    if (boldProgressPattern.test(content)) {
        content = content.replace(boldProgressPattern, (_match, prefix) => `${prefix}${progressStr}`);
        writeStateMd(statePath, content, cwd);
        output({ updated: true, percent, completed: totalSummaries, total: totalPlans, bar: progressStr }, raw, progressStr);
    }
    else if (plainProgressPattern.test(content)) {
        content = content.replace(plainProgressPattern, (_match, prefix) => `${prefix}${progressStr}`);
        writeStateMd(statePath, content, cwd);
        output({ updated: true, percent, completed: totalSummaries, total: totalPlans, bar: progressStr }, raw, progressStr);
    }
    else {
        output({ updated: false, reason: 'Campo de Progresso não encontrado em STATE.md' }, raw, 'false');
    }
}
export function cmdStateAddDecision(cwd, options, raw) {
    const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
    if (!fs.existsSync(statePath)) {
        output({ error: 'STATE.md not found' }, raw);
        return;
    }
    const { phase, summary, summary_file, rationale, rationale_file } = options;
    let summaryText = null;
    let rationaleText = '';
    try {
        summaryText = readTextArgOrFile(cwd, summary, summary_file, 'summary');
        rationaleText = readTextArgOrFile(cwd, rationale ?? '', rationale_file, 'rationale') ?? '';
    }
    catch (err) {
        output({ added: false, reason: err.message }, raw, 'false');
        return;
    }
    if (!summaryText) {
        output({ error: 'resumo obrigatório' }, raw);
        return;
    }
    let content = fs.readFileSync(statePath, 'utf-8');
    const entry = `- [Etapa ${phase ?? '?'}]: ${summaryText}${rationaleText ? ` — ${rationaleText}` : ''}`;
    const sectionPattern = /(###?\s*(?:Decisões|Decisões Tomadas|Decisões Acumuladas)\s*\n)([\s\S]*?)(?=\n###?|\n##[^#]|$)/i;
    const match = content.match(sectionPattern);
    if (match) {
        let sectionBody = match[2];
        sectionBody = sectionBody
            .replace(/Nenhuma ainda\.?\s*\n?/gi, '')
            .replace(/Nenhuma decisão ainda\.?\s*\n?/gi, '');
        sectionBody = sectionBody.trimEnd() + '\n' + entry + '\n';
        content = content.replace(sectionPattern, (_match, header) => `${header}${sectionBody}`);
        writeStateMd(statePath, content, cwd);
        output({ added: true, decision: entry }, raw, 'true');
    }
    else {
        output({ added: false, reason: 'Seção de Decisões não encontrada em STATE.md' }, raw, 'false');
    }
}
export function cmdStateAddBlocker(cwd, text, raw) {
    const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
    if (!fs.existsSync(statePath)) {
        output({ error: 'STATE.md not found' }, raw);
        return;
    }
    const blockerOptions = typeof text === 'object' && text !== null ? text : { text: text };
    let blockerText = null;
    try {
        blockerText = readTextArgOrFile(cwd, blockerOptions.text, blockerOptions.text_file, 'blocker');
    }
    catch (err) {
        output({ added: false, reason: err.message }, raw, 'false');
        return;
    }
    if (!blockerText) {
        output({ error: 'texto obrigatório' }, raw);
        return;
    }
    let content = fs.readFileSync(statePath, 'utf-8');
    const entry = `- ${blockerText}`;
    const sectionPattern = /(###?\s*(?:Bloqueadores|Bloqueadores\/Preocupações|Preocupações)\s*\n)([\s\S]*?)(?=\n###?|\n##[^#]|$)/i;
    const match = content.match(sectionPattern);
    if (match) {
        let sectionBody = match[2];
        sectionBody = sectionBody
            .replace(/Nenhum\.?\s*\n?/gi, '')
            .replace(/Nenhum ainda\.?\s*\n?/gi, '');
        sectionBody = sectionBody.trimEnd() + '\n' + entry + '\n';
        content = content.replace(sectionPattern, (_match, header) => `${header}${sectionBody}`);
        writeStateMd(statePath, content, cwd);
        output({ added: true, blocker: blockerText }, raw, 'true');
    }
    else {
        output({ added: false, reason: 'Seção de Bloqueadores não encontrada em STATE.md' }, raw, 'false');
    }
}
export function cmdStateResolveBlocker(cwd, text, raw) {
    const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
    if (!fs.existsSync(statePath)) {
        output({ error: 'STATE.md não encontrado' }, raw);
        return;
    }
    if (!text) {
        output({ error: 'texto obrigatório' }, raw);
        return;
    }
    let content = fs.readFileSync(statePath, 'utf-8');
    const sectionPattern = /(###?\s*(?:Bloqueadores|Bloqueadores\/Preocupações|Preocupações)\s*\n)([\s\S]*?)(?=\n###?|\n##[^#]|$)/i;
    const match = content.match(sectionPattern);
    if (match) {
        const sectionBody = match[2];
        const lines = sectionBody.split('\n');
        const filtered = lines.filter((line) => {
            if (!line.startsWith('- '))
                return true;
            return !line.toLowerCase().includes(text.toLowerCase());
        });
        let newBody = filtered.join('\n');
        if (!newBody.trim() || !newBody.includes('- '))
            newBody = 'Nenhum\n';
        content = content.replace(sectionPattern, (_match, header) => `${header}${newBody}`);
        writeStateMd(statePath, content, cwd);
        output({ resolved: true, blocker: text }, raw, 'true');
    }
    else {
        output({ resolved: false, reason: 'Seção de Bloqueadores não encontrada em STATE.md' }, raw, 'false');
    }
}
export function cmdStateRecordSession(cwd, options, raw) {
    const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
    if (!fs.existsSync(statePath)) {
        output({ error: 'STATE.md not found' }, raw);
        return;
    }
    let content = fs.readFileSync(statePath, 'utf-8');
    const now = new Date().toISOString();
    const updated = [];
    let result = stateReplaceField(content, 'Última sessão', now);
    if (result) {
        content = result;
        updated.push('Última sessão');
    }
    result = stateReplaceField(content, 'Última Data', now);
    if (result) {
        content = result;
        updated.push('Última Data');
    }
    if (options.stopped_at) {
        result = stateReplaceField(content, 'Parado Em', options.stopped_at);
        if (!result)
            result = stateReplaceField(content, 'Parado em', options.stopped_at);
        if (result) {
            content = result;
            updated.push('Parado Em');
        }
    }
    const resumeFile = options.resume_file ?? 'Nenhum';
    result = stateReplaceField(content, 'Arquivo para Retomar', resumeFile);
    if (!result)
        result = stateReplaceField(content, 'Arquivo para retomar', resumeFile);
    if (result) {
        content = result;
        updated.push('Arquivo para Retomar');
    }
    if (updated.length > 0) {
        writeStateMd(statePath, content, cwd);
        output({ recorded: true, updated }, raw, 'true');
    }
    else {
        output({ recorded: false, reason: 'Nenhum campo de sessão encontrado em STATE.md' }, raw, 'false');
    }
}
export function cmdStateSnapshot(cwd, raw) {
    const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
    if (!fs.existsSync(statePath)) {
        output({ error: 'STATE.md not found' }, raw);
        return;
    }
    const content = fs.readFileSync(statePath, 'utf-8');
    const etapaAtual = stateExtractField(content, 'Current Phase');
    const etapaAtualName = stateExtractField(content, 'Current Etapa Name');
    const totalEtapasRaw = stateExtractField(content, 'Total Phases');
    const currentPlan = stateExtractField(content, 'Current Plan');
    const totalPlansRaw = stateExtractField(content, 'Total Plans in Phase');
    const status = stateExtractField(content, 'Status');
    const progressRaw = stateExtractField(content, 'Progress');
    const lastActivity = stateExtractField(content, 'Last Activity');
    const lastActivityDesc = stateExtractField(content, 'Last Activity Description');
    const pausedAt = stateExtractField(content, 'Paused At');
    const totalEtapas = totalEtapasRaw ? parseInt(totalEtapasRaw, 10) : null;
    const totalPlansEmEtapa = totalPlansRaw ? parseInt(totalPlansRaw, 10) : null;
    const progressPercent = progressRaw ? parseInt(progressRaw.replace('%', ''), 10) : null;
    const decisions = [];
    const decisionsMatch = content.match(/##\s*(?:Decisões Tomadas|Decisions Made)[\s\S]*?\n\|[^\n]+\n\|[-|\s]+\n([\s\S]*?)(?=\n##|\n$|$)/i);
    if (decisionsMatch) {
        const rows = decisionsMatch[1]
            .trim()
            .split('\n')
            .filter((r) => r.includes('|'));
        for (const row of rows) {
            const cells = row
                .split('|')
                .map((c) => c.trim())
                .filter(Boolean);
            if (cells.length >= 3)
                decisions.push({ phase: cells[0], summary: cells[1], rationale: cells[2] });
        }
    }
    const blockers = [];
    const blockersMatch = content.match(/##\s*(?:Bloqueadores|Blockers)\s*\n([\s\S]*?)(?=\n##|$)/i);
    if (blockersMatch) {
        const items = blockersMatch[1].match(/^-\s+(.+)$/gm) ?? [];
        for (const item of items)
            blockers.push(item.replace(/^-\s+/, '').trim());
    }
    const session = {
        last_date: null,
        stopped_at: null,
        resume_file: null,
    };
    const sessionMatch = content.match(/##\s*(?:Sessão|Session)\s*\n([\s\S]*?)(?=\n##|$)/i);
    if (sessionMatch) {
        const s = sessionMatch[1];
        const lastDateMatch = s.match(/\*\*(?:Última Data|Last Date):\*\*\s*(.+)/i) ??
            s.match(/^(?:Última Data|Last Date):\s*(.+)/im);
        const stoppedAtMatch = s.match(/\*\*(?:Parado Em|Stopped At):\*\*\s*(.+)/i) ??
            s.match(/^(?:Parado Em|Stopped At):\s*(.+)/im);
        const resumeFileMatch = s.match(/\*\*(?:Arquivo para Retomar|Resume File):\*\*\s*(.+)/i) ??
            s.match(/^(?:Arquivo para Retomar|Resume File):\s*(.+)/im);
        if (lastDateMatch)
            session.last_date = lastDateMatch[1].trim();
        if (stoppedAtMatch)
            session.stopped_at = stoppedAtMatch[1].trim();
        if (resumeFileMatch)
            session.resume_file = resumeFileMatch[1].trim();
    }
    output({
        current_phase: etapaAtual,
        current_phase_name: etapaAtualName,
        total_phases: totalEtapas,
        current_plan: currentPlan,
        total_plans_in_phase: totalPlansEmEtapa,
        status,
        progress_percent: progressPercent,
        last_activity: lastActivity,
        last_activity_desc: lastActivityDesc,
        decisions,
        blockers,
        paused_at: pausedAt,
        session,
    }, raw);
}
export function cmdStateJson(cwd, raw) {
    const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
    if (!fs.existsSync(statePath)) {
        output({ error: 'STATE.md not found' }, raw, 'STATE.md not found');
        return;
    }
    const content = fs.readFileSync(statePath, 'utf-8');
    const fm = extractFrontmatter(content);
    if (!fm || Object.keys(fm).length === 0) {
        const body = stripFrontmatter(content);
        const built = buildStateFrontmatter(body, cwd);
        output(built, raw, JSON.stringify(built, null, 2));
        return;
    }
    output(fm, raw, JSON.stringify(fm, null, 2));
}
//# sourceMappingURL=state.js.map