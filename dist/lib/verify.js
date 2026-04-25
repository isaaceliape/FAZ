/**
 * Verify — Verification suite, consistency, and health validation
 */
import fs from 'fs';
import path from 'path';
import { safeReadFile, normalizeEtapaNome, execGit, findEtapaInternal, getMilestoneInfo, output, error, } from './core.js';
import { extractFrontmatter, parseMustHavesBlock } from './frontmatter.js';
import { writeStateMd } from './state.js';
import { requireParam, resolveVerificationPath, loadVerificationFile, outputVerificationResult, isValidCommitHash, fileExists, extractAtReferences, extractBacktickReferences, } from './verification-utils.js';
export function cmdVerifySummary(cwd, summaryPath, checkFileCount, raw) {
    if (!summaryPath) {
        error('caminho-do-resumo obrigatório');
    }
    const fullPath = path.join(cwd, summaryPath);
    const checkCount = checkFileCount || 2;
    if (!fs.existsSync(fullPath)) {
        output({
            passed: false,
            checks: {
                summary_exists: false,
                files_created: { checked: 0, found: 0, missing: [] },
                commits_exist: false,
                self_check: 'not_found',
            },
            errors: ['SUMMARY.md não encontrado'],
        }, raw, 'failed');
        return;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const errors = [];
    const mentionedFiles = new Set();
    const patterns = [
        /`([^`]+\.[a-zA-Z]+)`/g,
        /(?:Created|Modified|Added|Updated|Edited):\s*`?([^\s`]+\.[a-zA-Z]+)`?/gi,
    ];
    for (const pattern of patterns) {
        let m;
        while ((m = pattern.exec(content)) !== null) {
            const filePath = m[1];
            if (filePath && !filePath.startsWith('http') && filePath.includes('/')) {
                mentionedFiles.add(filePath);
            }
        }
    }
    const filesToCheck = Array.from(mentionedFiles).slice(0, checkCount);
    const missing = [];
    for (const file of filesToCheck) {
        if (!fs.existsSync(path.join(cwd, file))) {
            missing.push(file);
        }
    }
    const commitHashPattern = /\b[0-9a-f]{7,40}\b/g;
    const hashes = content.match(commitHashPattern) || [];
    let commitsExist = false;
    if (hashes.length > 0) {
        for (const hash of hashes.slice(0, 3)) {
            const result = execGit(cwd, ['cat-file', '-t', hash]);
            if (result.exitCode === 0 && result.stdout === 'commit') {
                commitsExist = true;
                break;
            }
        }
    }
    let selfCheck = 'not_found';
    const selfCheckPattern = /##\s*(?:Self[- ]?Check|Verification|Quality Check)/i;
    if (selfCheckPattern.test(content)) {
        const passPattern = /(?:all\s+)?(?:pass|✓|✅|complete|succeeded)/i;
        const failPattern = /(?:fail|✗|❌|incomplete|blocked)/i;
        const checkSection = content.slice(content.search(selfCheckPattern));
        if (failPattern.test(checkSection)) {
            selfCheck = 'failed';
        }
        else if (passPattern.test(checkSection)) {
            selfCheck = 'passed';
        }
    }
    if (missing.length > 0)
        errors.push('Arquivos ausentes: ' + missing.join(', '));
    if (!commitsExist && hashes.length > 0)
        errors.push('Hashes de commit referenciados não encontrados no histórico git');
    if (selfCheck === 'failed')
        errors.push('Seção de auto-verificação indica falha');
    const checks = {
        summary_exists: true,
        files_created: {
            checked: filesToCheck.length,
            found: filesToCheck.length - missing.length,
            missing,
        },
        commits_exist: commitsExist,
        self_check: selfCheck,
    };
    const passed = missing.length === 0 && selfCheck !== 'failed';
    output({ passed, checks, errors }, raw, passed ? 'passed' : 'failed');
}
export function cmdVerifyPlanStructure(cwd, filePath, raw) {
    requireParam(filePath, 'caminho do arquivo');
    const fullPath = resolveVerificationPath(cwd, filePath);
    const content = loadVerificationFile(fullPath);
    if (!content) {
        output({ error: 'Arquivo não encontrado', path: filePath }, raw);
        return;
    }
    const fm = extractFrontmatter(content);
    const errors = [];
    const warnings = [];
    const required = [
        'etapa',
        'plan',
        'type',
        'etapa',
        'depends_on',
        'files_modified',
        'autonomous',
        'must_haves',
    ];
    for (const field of required) {
        if (fm[field] === undefined)
            errors.push(`Campo de frontmatter obrigatório ausente: ${field}`);
    }
    const taskPattern = /<task[^>]*>([\s\S]*?)<\/task>/g;
    const tasks = [];
    let taskMatch;
    while ((taskMatch = taskPattern.exec(content)) !== null) {
        const taskContent = taskMatch[1];
        const nameMatch = taskContent.match(/<name>([\s\S]*?)<\/name>/);
        const taskName = nameMatch ? nameMatch[1].trim() : 'unnamed';
        const hasFiles = /<files>/.test(taskContent);
        const hasAction = /<action>/.test(taskContent);
        const hasVerify = /<verify>/.test(taskContent);
        const hasDone = /<done>/.test(taskContent);
        if (!nameMatch)
            errors.push('Tarefa sem elemento <name>');
        if (!hasAction)
            errors.push(`Tarefa '${taskName}' sem <action>`);
        if (!hasVerify)
            warnings.push(`Tarefa '${taskName}' sem <verify>`);
        if (!hasDone)
            warnings.push(`Tarefa '${taskName}' sem <done>`);
        if (!hasFiles)
            warnings.push(`Tarefa '${taskName}' sem <files>`);
        tasks.push({ name: taskName, hasFiles, hasAction, hasVerify, hasDone });
    }
    if (tasks.length === 0)
        warnings.push('Nenhum elemento <task> encontrado');
    if (fm['etapa'] &&
        parseInt(String(fm['etapa']), 10) > 1 &&
        (!fm['depends_on'] || (Array.isArray(fm['depends_on']) && fm['depends_on'].length === 0))) {
        warnings.push('Etapa > 1 mas depends_on está vazio');
    }
    const hasCheckpoints = /<task\s+type=["']?checkpoint/.test(content);
    if (hasCheckpoints && fm['autonomous'] !== 'false' && fm['autonomous'] !== false) {
        errors.push('Tem tarefas de checkpoint mas autonomous não é false');
    }
    output({
        valid: errors.length === 0,
        errors,
        warnings,
        task_count: tasks.length,
        tasks,
        frontmatter_fields: Object.keys(fm),
    }, raw, errors.length === 0 ? 'valid' : 'invalid');
}
export function cmdVerifyPhaseCompleteness(cwd, phase, raw) {
    if (!phase) {
        error('fase obrigatória');
    }
    const phaseInfo = findEtapaInternal(cwd, phase);
    if (!phaseInfo || !phaseInfo.found) {
        output({ error: 'Fase não encontrada', phase }, raw);
        return;
    }
    const errors = [];
    const warnings = [];
    const phaseDir = path.join(cwd, phaseInfo.directory);
    let files;
    try {
        files = fs.readdirSync(phaseDir);
    }
    catch {
        output({ error: 'Não é possível ler diretório da fase' }, raw);
        return;
    }
    const plans = files.filter((f) => f.match(/-PLAN\.md$/i));
    const summaries = files.filter((f) => f.match(/-SUMMARY\.md$/i));
    const planIds = new Set(plans.map((p) => p.replace(/-PLAN\.md$/i, '')));
    const summaryIds = new Set(summaries.map((s) => s.replace(/-SUMMARY\.md$/i, '')));
    const incompletePlans = [...planIds].filter((id) => !summaryIds.has(id));
    if (incompletePlans.length > 0) {
        errors.push(`Planos sem resumos: ${incompletePlans.join(', ')}`);
    }
    const orphanSummaries = [...summaryIds].filter((id) => !planIds.has(id));
    if (orphanSummaries.length > 0) {
        warnings.push(`Resumos sem planos: ${orphanSummaries.join(', ')}`);
    }
    output({
        complete: errors.length === 0,
        phase: phaseInfo.phase_number,
        plan_count: plans.length,
        summary_count: summaries.length,
        incomplete_plans: incompletePlans,
        orphan_summaries: orphanSummaries,
        errors,
        warnings,
    }, raw, errors.length === 0 ? 'complete' : 'incomplete');
}
export function cmdVerifyReferences(cwd, filePath, raw) {
    requireParam(filePath, 'caminho do arquivo');
    const fullPath = resolveVerificationPath(cwd, filePath);
    const content = loadVerificationFile(fullPath);
    if (!content) {
        output({ error: 'Arquivo não encontrado', path: filePath }, raw);
        return;
    }
    const found = [];
    const missing = [];
    // Check @ references
    const atRefs = extractAtReferences(content);
    for (const ref of atRefs) {
        const resolved = ref.startsWith('~/')
            ? path.join(process.env['HOME'] || '', ref.slice(2))
            : path.join(cwd, ref);
        if (fileExists(resolved)) {
            found.push(ref);
        }
        else {
            missing.push(ref);
        }
    }
    // Check backtick file references
    const backtickRefs = extractBacktickReferences(content);
    for (const ref of backtickRefs) {
        if (found.includes(ref) || missing.includes(ref))
            continue;
        const resolved = path.join(cwd, ref);
        if (fileExists(resolved)) {
            found.push(ref);
        }
        else {
            missing.push(ref);
        }
    }
    outputVerificationResult({
        valid: missing.length === 0,
        found: found.length,
        missing,
        total: found.length + missing.length,
        errors: [],
    }, raw);
}
export function cmdVerifyCommits(cwd, hashes, raw) {
    if (!hashes || hashes.length === 0) {
        error('Pelo menos um hash de commit obrigatório');
    }
    const valid = [];
    const invalid = [];
    for (const hash of hashes) {
        if (isValidCommitHash(cwd, hash)) {
            valid.push(hash);
        }
        else {
            invalid.push(hash);
        }
    }
    outputVerificationResult({
        all_valid: invalid.length === 0,
        valid_hashes: valid,
        invalid_hashes: invalid,
        total: hashes.length,
        errors: [],
    }, raw);
}
export function cmdVerifyArtifacts(cwd, planFilePath, raw) {
    requireParam(planFilePath, 'caminho do arquivo de plano');
    const fullPath = resolveVerificationPath(cwd, planFilePath);
    const content = loadVerificationFile(fullPath);
    if (!content) {
        output({ error: 'Arquivo não encontrado', path: planFilePath }, raw);
        return;
    }
    const artifacts = parseMustHavesBlock(content, 'artifacts');
    if (artifacts.length === 0) {
        output({ error: 'Nenhum must_haves.artifacts encontrado em frontmatter', path: planFilePath }, raw);
        return;
    }
    const results = [];
    for (const artifactRaw of artifacts) {
        if (typeof artifactRaw === 'string')
            continue;
        const artifact = artifactRaw;
        const artPath = artifact.path;
        if (!artPath)
            continue;
        const artFullPath = path.join(cwd, artPath);
        const exists = fs.existsSync(artFullPath);
        const check = { path: artPath, exists, issues: [], passed: false };
        if (exists) {
            const fileContent = safeReadFile(artFullPath) || '';
            const lineCount = fileContent.split('\n').length;
            if (artifact.min_lines && lineCount < artifact.min_lines) {
                check.issues.push(`Apenas ${lineCount} linhas, precisa de ${artifact.min_lines}`);
            }
            if (artifact.contains && !fileContent.includes(artifact.contains)) {
                check.issues.push(`Padrão ausente: ${artifact.contains}`);
            }
            if (artifact.exports) {
                const exportList = Array.isArray(artifact.exports) ? artifact.exports : [artifact.exports];
                for (const exp of exportList) {
                    if (!fileContent.includes(exp))
                        check.issues.push(`Export ausente: ${exp}`);
                }
            }
            check.passed = check.issues.length === 0;
        }
        else {
            check.issues.push('Arquivo não encontrado');
        }
        results.push(check);
    }
    const passed = results.filter((r) => r.passed).length;
    output({
        all_passed: passed === results.length,
        passed,
        total: results.length,
        artifacts: results,
    }, raw, passed === results.length ? 'valid' : 'invalid');
}
export function cmdVerifyKeyLinks(cwd, planFilePath, raw) {
    requireParam(planFilePath, 'caminho do arquivo de plano');
    const fullPath = resolveVerificationPath(cwd, planFilePath);
    const content = loadVerificationFile(fullPath);
    if (!content) {
        output({ error: 'Arquivo não encontrado', path: planFilePath }, raw);
        return;
    }
    const keyLinks = parseMustHavesBlock(content, 'key_links');
    if (keyLinks.length === 0) {
        output({ error: 'Nenhum must_haves.key_links encontrado em frontmatter', path: planFilePath }, raw);
        return;
    }
    const results = [];
    for (const linkRaw of keyLinks) {
        if (typeof linkRaw === 'string')
            continue;
        const link = linkRaw;
        const check = {
            from: link.from,
            to: link.to,
            via: link.via || '',
            verified: false,
            detail: '',
        };
        const sourceContent = safeReadFile(path.join(cwd, link.from || ''));
        if (!sourceContent) {
            check.detail = 'Arquivo de origem não encontrado';
        }
        else if (link.pattern) {
            try {
                const regex = new RegExp(link.pattern);
                if (regex.test(sourceContent)) {
                    check.verified = true;
                    check.detail = 'Padrão encontrado na origem';
                }
                else {
                    const targetContent = safeReadFile(path.join(cwd, link.to || ''));
                    if (targetContent && regex.test(targetContent)) {
                        check.verified = true;
                        check.detail = 'Padrão encontrado no destino';
                    }
                    else {
                        check.detail = `Padrão "${link.pattern}" não encontrado na origem ou destino`;
                    }
                }
            }
            catch {
                check.detail = `Padrão regex inválido: ${link.pattern}`;
            }
        }
        else {
            if (sourceContent.includes(link.to || '')) {
                check.verified = true;
                check.detail = 'Destino referenciado na origem';
            }
            else {
                check.detail = 'Destino não referenciado na origem';
            }
        }
        results.push(check);
    }
    const verified = results.filter((r) => r.verified).length;
    output({
        all_verified: verified === results.length,
        verified,
        total: results.length,
        links: results,
    }, raw, verified === results.length ? 'valid' : 'invalid');
}
export function cmdValidateConsistency(cwd, raw) {
    const roadmapPath = path.join(cwd, '.fase-ai', 'ROADMAP.md');
    const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
    const errors = [];
    const warnings = [];
    if (!fs.existsSync(roadmapPath)) {
        errors.push('ROADMAP.md não encontrado');
        output({ passed: false, errors, warnings }, raw, 'failed');
        return;
    }
    const roadmapContent = fs.readFileSync(roadmapPath, 'utf-8');
    const roadmapPhases = new Set();
    const phasePattern = /#{2,4}\s*Phase\s+(\d+[A-Z]?(?:\.\d+)*)\s*:/gi;
    let m;
    while ((m = phasePattern.exec(roadmapContent)) !== null) {
        roadmapPhases.add(m[1]);
    }
    const diskPhases = new Set();
    try {
        const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
        const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
        for (const dir of dirs) {
            const dm = dir.match(/^(\d+[A-Z]?(?:\.\d+)*)/i);
            if (dm)
                diskPhases.add(dm[1]);
        }
    }
    catch { }
    for (const p of roadmapPhases) {
        if (!diskPhases.has(p) && !diskPhases.has(normalizeEtapaNome(p))) {
            warnings.push(`Fase ${p} em ROADMAP.md mas nenhum diretório no disco`);
        }
    }
    for (const p of diskPhases) {
        const unpadded = String(parseInt(p, 10));
        if (!roadmapPhases.has(p) && !roadmapPhases.has(unpadded)) {
            warnings.push(`Fase ${p} existe no disco mas não em ROADMAP.md`);
        }
    }
    const integerPhases = [...diskPhases]
        .filter((p) => !p.includes('.'))
        .map((p) => parseInt(p, 10))
        .sort((a, b) => a - b);
    for (let i = 1; i < integerPhases.length; i++) {
        if (integerPhases[i] !== integerPhases[i - 1] + 1) {
            warnings.push(`Lacuna na numeração de fases: ${integerPhases[i - 1]} → ${integerPhases[i]}`);
        }
    }
    try {
        const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
        const dirs = entries
            .filter((e) => e.isDirectory())
            .map((e) => e.name)
            .sort();
        for (const dir of dirs) {
            const phaseFiles = fs.readdirSync(path.join(etapasDir, dir));
            const plans = phaseFiles.filter((f) => f.endsWith('-PLAN.md')).sort();
            const planNums = plans
                .map((p) => {
                const pm = p.match(/-(\d{2})-PLAN\.md$/);
                return pm ? parseInt(pm[1], 10) : null;
            })
                .filter((n) => n !== null);
            for (let i = 1; i < planNums.length; i++) {
                if (planNums[i] !== planNums[i - 1] + 1) {
                    warnings.push(`Lacuna na numeração de planos em ${dir}: plano ${planNums[i - 1]} → ${planNums[i]}`);
                }
            }
            const summaries = phaseFiles.filter((f) => f.endsWith('-SUMMARY.md'));
            const planIds = new Set(plans.map((p) => p.replace('-PLAN.md', '')));
            const summaryIds = new Set(summaries.map((s) => s.replace('-SUMMARY.md', '')));
            for (const sid of summaryIds) {
                if (!planIds.has(sid)) {
                    warnings.push(`Resumo ${sid}-SUMMARY.md em ${dir} não tem PLAN.md correspondente`);
                }
            }
        }
    }
    catch { }
    try {
        const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
        const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
        for (const dir of dirs) {
            const phaseFiles = fs.readdirSync(path.join(etapasDir, dir));
            const plans = phaseFiles.filter((f) => f.endsWith('-PLAN.md'));
            for (const plan of plans) {
                const content = fs.readFileSync(path.join(etapasDir, dir, plan), 'utf-8');
                const fm = extractFrontmatter(content);
                if (!fm['etapa']) {
                    warnings.push(`${dir}/${plan}: ausência de 'etapa' em frontmatter`);
                }
            }
        }
    }
    catch { }
    const passed = errors.length === 0;
    output({ passed, errors, warnings, warning_count: warnings.length }, raw, passed ? 'passed' : 'failed');
}
export function cmdValidateHealth(cwd, options, raw) {
    const planejamentoDir = path.join(cwd, '.fase-ai');
    const projectPath = path.join(planejamentoDir, 'PROJECT.md');
    const roadmapPath = path.join(planejamentoDir, 'ROADMAP.md');
    const statePath = path.join(planejamentoDir, 'STATE.md');
    const configPath = path.join(planejamentoDir, 'config.json');
    const etapasDir = path.join(planejamentoDir, 'etapas');
    const errors = [];
    const warnings = [];
    const info = [];
    const repairs = [];
    const addIssue = (severity, code, message, fix, repairable = false) => {
        const issue = { code, message, fix, repairable };
        if (severity === 'error')
            errors.push(issue);
        else if (severity === 'warning')
            warnings.push(issue);
        else
            info.push(issue);
    };
    if (!fs.existsSync(planejamentoDir)) {
        addIssue('error', 'E001', 'diretório .fase-ai/ não encontrado', 'Execute /gsd:novo-projeto para inicializar');
        output({ status: 'quebrado', errors, warnings, info, repairable_count: 0 }, raw);
        return;
    }
    if (!fs.existsSync(projectPath)) {
        addIssue('error', 'E002', 'PROJECT.md não encontrado', 'Execute /gsd:novo-projeto para criar');
    }
    else {
        const content = fs.readFileSync(projectPath, 'utf-8');
        const requiredSections = ['## O Que É Isso', '## Valor Central', '## Requisitos'];
        for (const section of requiredSections) {
            if (!content.includes(section)) {
                addIssue('warning', 'W001', `PROJECT.md sem seção: ${section}`, 'Adicione seção manualmente');
            }
        }
    }
    if (!fs.existsSync(roadmapPath)) {
        addIssue('error', 'E003', 'ROADMAP.md não encontrado', 'Execute /gsd:novo-marco para criar roadmap');
    }
    if (!fs.existsSync(statePath)) {
        addIssue('error', 'E004', 'STATE.md não encontrado', 'Execute /gsd:saude --repair para regenerar', true);
        repairs.push('regenerateState');
    }
    else {
        const stateContent = fs.readFileSync(statePath, 'utf-8');
        const phaseRefs = [...stateContent.matchAll(/[Pp]hase\s+(\d+(?:\.\d+)*)/g)].map((mm) => mm[1]);
        const diskPhases = new Set();
        try {
            const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
            for (const e of entries) {
                if (e.isDirectory()) {
                    const mm = e.name.match(/^(\d+(?:\.\d+)*)/);
                    if (mm)
                        diskPhases.add(mm[1]);
                }
            }
        }
        catch { }
        for (const ref of phaseRefs) {
            const normalizedRef = String(parseInt(ref, 10)).padStart(2, '0');
            if (!diskPhases.has(ref) &&
                !diskPhases.has(normalizedRef) &&
                !diskPhases.has(String(parseInt(ref, 10)))) {
                if (diskPhases.size > 0) {
                    addIssue('warning', 'W002', `STATE.md referencia fase ${ref}, mas apenas fases ${[...diskPhases].sort().join(', ')} existem`, 'Execute /gsd:saude --repair para regenerar STATE.md', true);
                    if (!repairs.includes('regenerateState'))
                        repairs.push('regenerateState');
                }
            }
        }
    }
    if (!fs.existsSync(configPath)) {
        addIssue('warning', 'W003', 'config.json não encontrado', 'Execute /gsd:saude --repair para criar com padrões', true);
        repairs.push('createConfig');
    }
    else {
        try {
            const rawContent = fs.readFileSync(configPath, 'utf-8');
            const parsed = JSON.parse(rawContent);
            const validProfiles = ['quality', 'balanced', 'budget'];
            if (parsed['model_profile'] && !validProfiles.includes(parsed['model_profile'])) {
                addIssue('warning', 'W004', `config.json: model_profile inválido "${parsed['model_profile']}"`, `Valores válidos: ${validProfiles.join(', ')}`);
            }
        }
        catch (err) {
            addIssue('error', 'E005', `config.json: erro de parse JSON - ${err.message}`, 'Execute /gsd:saude --repair para resetar para padrões', true);
            repairs.push('resetConfig');
        }
    }
    if (fs.existsSync(configPath)) {
        try {
            const configRaw = fs.readFileSync(configPath, 'utf-8');
            const configParsed = JSON.parse(configRaw);
            if (configParsed['workflow'] &&
                configParsed['workflow']['nyquist_validation'] === undefined) {
                addIssue('warning', 'W008', 'config.json: workflow.nyquist_validation ausente (padrão ativado mas agentes podem pular)', 'Execute /gsd:saude --repair para adicionar chave', true);
                if (!repairs.includes('addNyquistKey'))
                    repairs.push('addNyquistKey');
            }
        }
        catch { }
    }
    try {
        const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
        for (const e of entries) {
            if (e.isDirectory() && !e.name.match(/^\d{2}(?:\.\d+)*-[\w-]+$/)) {
                addIssue('warning', 'W005', `Diretório de fase "${e.name}" não segue formato NN-nome`, 'Renomeie para corresponder ao padrão (ex: 01-setup)');
            }
        }
    }
    catch { }
    try {
        const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
        for (const e of entries) {
            if (!e.isDirectory())
                continue;
            const phaseFiles = fs.readdirSync(path.join(etapasDir, e.name));
            const plans = phaseFiles.filter((f) => f.endsWith('-PLAN.md') || f === 'PLAN.md');
            const summaries = phaseFiles.filter((f) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md');
            const summaryBases = new Set(summaries.map((s) => s.replace('-SUMMARY.md', '').replace('SUMMARY.md', '')));
            for (const plan of plans) {
                const planBase = plan.replace('-PLAN.md', '').replace('PLAN.md', '');
                if (!summaryBases.has(planBase)) {
                    addIssue('info', 'I001', `${e.name}/${plan} não tem SUMMARY.md`, 'Pode estar em progresso');
                }
            }
        }
    }
    catch { }
    try {
        const phaseEntries = fs.readdirSync(etapasDir, { withFileTypes: true });
        for (const e of phaseEntries) {
            if (!e.isDirectory())
                continue;
            const phaseFiles = fs.readdirSync(path.join(etapasDir, e.name));
            const hasResearch = phaseFiles.some((f) => f.endsWith('-RESEARCH.md'));
            const hasValidation = phaseFiles.some((f) => f.endsWith('-VALIDATION.md'));
            if (hasResearch && !hasValidation) {
                const researchFile = phaseFiles.find((f) => f.endsWith('-RESEARCH.md'));
                if (researchFile) {
                    const researchContent = fs.readFileSync(path.join(etapasDir, e.name, researchFile), 'utf-8');
                    if (researchContent.includes('## Validation Architecture')) {
                        addIssue('warning', 'W009', `Fase ${e.name}: tem Validation Architecture em RESEARCH.md mas nenhum VALIDATION.md`, 'Execute novamente /gsd:planejar-fase com --research para regenerar');
                    }
                }
            }
        }
    }
    catch { }
    if (fs.existsSync(roadmapPath)) {
        const roadmapContent = fs.readFileSync(roadmapPath, 'utf-8');
        const roadmapPhases = new Set();
        const phasePattern = /#{2,4}\s*Phase\s+(\d+[A-Z]?(?:\.\d+)*)\s*:/gi;
        let m;
        while ((m = phasePattern.exec(roadmapContent)) !== null) {
            roadmapPhases.add(m[1]);
        }
        const diskPhases = new Set();
        try {
            const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
            for (const e of entries) {
                if (e.isDirectory()) {
                    const dm = e.name.match(/^(\d+[A-Z]?(?:\.\d+)*)/i);
                    if (dm)
                        diskPhases.add(dm[1]);
                }
            }
        }
        catch { }
        for (const p of roadmapPhases) {
            const padded = String(parseInt(p, 10)).padStart(2, '0');
            if (!diskPhases.has(p) && !diskPhases.has(padded)) {
                addIssue('warning', 'W006', `Fase ${p} em ROADMAP.md mas nenhum diretório no disco`, 'Crie diretório de fase ou remova do roadmap');
            }
        }
        for (const p of diskPhases) {
            const unpadded = String(parseInt(p, 10));
            if (!roadmapPhases.has(p) && !roadmapPhases.has(unpadded)) {
                addIssue('warning', 'W007', `Fase ${p} existe no disco mas não em ROADMAP.md`, 'Adicione ao roadmap ou remova diretório');
            }
        }
    }
    const repairActions = [];
    if (options.repair && repairs.length > 0) {
        for (const repair of repairs) {
            try {
                switch (repair) {
                    case 'createConfig':
                    case 'resetConfig': {
                        const defaults = {
                            model_profile: 'balanced',
                            commit_docs: true,
                            search_gitignored: false,
                            branching_strategy: 'none',
                            research: true,
                            plan_checker: true,
                            verifier: true,
                            parallelization: true,
                        };
                        fs.writeFileSync(configPath, JSON.stringify(defaults, null, 2), 'utf-8');
                        repairActions.push({ action: repair, success: true, path: 'config.json' });
                        break;
                    }
                    case 'regenerateState': {
                        if (fs.existsSync(statePath)) {
                            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                            const backupPath = `${statePath}.bak-${timestamp}`;
                            fs.copyFileSync(statePath, backupPath);
                            repairActions.push({ action: 'backupState', success: true, path: backupPath });
                        }
                        const milestone = getMilestoneInfo(cwd);
                        let stateContent = `# Estado da Sessão\n\n`;
                        stateContent += `## Referência do Projeto\n\n`;
                        stateContent += `Veja: .fase-ai/PROJECT.md\n\n`;
                        stateContent += `## Posição\n\n`;
                        stateContent += `**Marco:** ${milestone.version} ${milestone.name}\n`;
                        stateContent += `**Fase atual:** (determinando...)\n`;
                        stateContent += `**Status:** Retomando\n\n`;
                        stateContent += `## Log de Sessão\n\n`;
                        stateContent += `- ${new Date().toISOString().split('T')[0]}: STATE.md regenerado por /gsd:saude --repair\n`;
                        writeStateMd(statePath, stateContent, cwd);
                        repairActions.push({ action: repair, success: true, path: 'STATE.md' });
                        break;
                    }
                    case 'addNyquistKey': {
                        if (fs.existsSync(configPath)) {
                            try {
                                const configRaw = fs.readFileSync(configPath, 'utf-8');
                                const configParsed = JSON.parse(configRaw);
                                if (!configParsed['workflow'])
                                    configParsed['workflow'] = {};
                                if (configParsed['workflow']['nyquist_validation'] === undefined) {
                                    configParsed['workflow']['nyquist_validation'] = true;
                                    fs.writeFileSync(configPath, JSON.stringify(configParsed, null, 2), 'utf-8');
                                }
                                repairActions.push({ action: repair, success: true, path: 'config.json' });
                            }
                            catch (err) {
                                repairActions.push({
                                    action: repair,
                                    success: false,
                                    error: err.message,
                                });
                            }
                        }
                        break;
                    }
                }
            }
            catch (err) {
                repairActions.push({ action: repair, success: false, error: err.message });
            }
        }
    }
    let status;
    if (errors.length > 0) {
        status = 'quebrado';
    }
    else if (warnings.length > 0) {
        status = 'degradado';
    }
    else {
        status = 'saudável';
    }
    const repairableCount = errors.filter((e) => e.repairable).length +
        warnings.filter((w) => w.repairable).length;
    output({
        status,
        errors,
        warnings,
        info,
        repairable_count: repairableCount,
        repairs_performed: repairActions.length > 0 ? repairActions : undefined,
    }, raw);
}
//# sourceMappingURL=verify.js.map