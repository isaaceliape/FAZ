/**
 * Commands — CLI command handlers for fase-tools dispatcher
 *
 * This module contains synchronous CLI command handlers that output JSON
 * for AI agents. Each function corresponds to a command in fase-tools.ts.
 *
 * Async commands (websearch) are in research.ts.
 *
 * @module lib/commands
 */
import fs from 'fs';
import path from 'path';
import { loadConfig, isGitIgnored, execGit, normalizeEtapaNome, compareEtapaNum, getArchivedEtapasDirs, generateSlugInternal, getMilestoneInfo, resolveModelInternal, MODEL_PROFILES, toPosixPath, output, error, findEtapaInternal, } from './core.js';
import { extractFrontmatter } from './frontmatter.js';
/**
 * Validates that a user-provided path stays within the cwd boundary.
 * Prevents path traversal attacks (e.g., ../../../etc/passwd) including via symlinks.
 * @param cwd - The project root directory
 * @param userPath - The user-provided path to validate
 * @returns The resolved absolute path if valid
 * @throws Error if path escapes cwd boundary
 */
export function validatePathInsideCwd(cwd, userPath) {
    const resolved = path.resolve(cwd, userPath);
    const normalizedCwd = path.resolve(cwd) + path.sep;
    // Check logical path first
    if (resolved !== path.resolve(cwd) && !resolved.startsWith(normalizedCwd)) {
        error(`Path traversal detected: "${userPath}" escapes project boundary`);
    }
    // Resolve symlinks and check physical path
    try {
        const realPath = fs.realpathSync(resolved);
        const realCwd = fs.realpathSync(cwd);
        const normalizedRealCwd = realCwd + path.sep;
        if (realPath !== realCwd && !realPath.startsWith(normalizedRealCwd)) {
            error(`Path traversal detected via symlink: "${userPath}" resolves outside project boundary`);
        }
        return realPath;
    }
    catch {
        // File doesn't exist yet - that's OK for write operations
        // Just return the resolved logical path
        return resolved;
    }
}
/**
 * Sanitizes a filename by removing path separators and normalizing.
 * @param filename - User-provided filename
 * @returns Safe filename without path components
 */
export function sanitizeFilename(filename) {
    const base = path.basename(filename);
    if (base === '..' || base === '.' || base === '') {
        error(`Invalid filename: "${filename}"`);
    }
    return base;
}
export function cmdGenerateSlug(text, raw) {
    if (!text) {
        error('texto obrigatório para gerar slug');
    }
    const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    output({ slug }, raw, slug);
}
export function cmdCurrentTimestamp(format, raw) {
    const now = new Date();
    let result;
    switch (format) {
        case 'date':
            result = now.toISOString().split('T')[0];
            break;
        case 'filename':
            result = now.toISOString().replace(/:/g, '-').replace(/\..+/, '');
            break;
        case 'full':
        default:
            result = now.toISOString();
            break;
    }
    output({ timestamp: result }, raw, result);
}
export function cmdListTodos(cwd, area, raw) {
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
                // Apply area filter if specified
                if (area && todoArea !== area)
                    continue;
                count++;
                todos.push({
                    file,
                    created: createdMatch ? createdMatch[1].trim() : 'unknown',
                    title: titleMatch ? titleMatch[1].trim() : 'Sem título',
                    area: todoArea,
                    path: toPosixPath(path.join('.fase-ai', 'todos', 'pending', file)),
                });
            }
            catch (err) {
                // Skip malformed todo files but log for debugging
                process.stderr.write(`[cmdListTodos] Skipping malformed file ${file}: ${err.message}\n`);
            }
        }
    }
    catch (err) {
        // Log directory read errors but don't fail
        process.stderr.write(`[cmdListTodos] Error reading todos directory: ${err.message}\n`);
    }
    output({ count, todos }, raw, count.toString());
}
export function cmdVerifyPathExists(cwd, targetPath, raw) {
    if (!targetPath) {
        error('caminho obrigatório para verificação');
    }
    let fullPath;
    if (path.isAbsolute(targetPath)) {
        const normalizedCwd = path.resolve(cwd) + path.sep;
        const resolved = path.resolve(targetPath);
        if (resolved !== path.resolve(cwd) && !resolved.startsWith(normalizedCwd)) {
            error(`Path traversal detected: "${targetPath}" escapes project boundary`);
        }
        fullPath = resolved;
    }
    else {
        fullPath = validatePathInsideCwd(cwd, targetPath);
    }
    try {
        const stats = fs.statSync(fullPath);
        const type = stats.isDirectory() ? 'directory' : stats.isFile() ? 'file' : 'other';
        output({ exists: true, type }, raw, 'true');
    }
    catch (err) {
        // Path doesn't exist or can't be accessed - return false
        process.stderr.write(`[cmdVerifyPathExists] Path inaccessible: ${err.message}\n`);
        output({ exists: false, type: null }, raw, 'false');
    }
}
export function cmdHistoryDigest(cwd, raw) {
    const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
    const digest = { phases: {}, decisions: [], tech_stack: new Set() };
    const allPhaseDirs = [];
    // Add archived phases first (oldest milestones first)
    const archived = getArchivedEtapasDirs(cwd);
    for (const a of archived) {
        allPhaseDirs.push({ name: a.name, fullPath: a.fullPath, milestone: a.milestone });
    }
    // Add current phases
    if (fs.existsSync(etapasDir)) {
        try {
            const currentDirs = fs
                .readdirSync(etapasDir, { withFileTypes: true })
                .filter((e) => e.isDirectory())
                .map((e) => e.name)
                .sort();
            for (const dir of currentDirs) {
                allPhaseDirs.push({ name: dir, fullPath: path.join(etapasDir, dir), milestone: null });
            }
        }
        catch (err) {
            process.stderr.write(`[cmdHistoryDigest] Error reading phases directory: ${err.message}\n`);
        }
    }
    if (allPhaseDirs.length === 0) {
        digest.tech_stack = [];
        output(digest, raw);
        return;
    }
    try {
        for (const { name: dir, fullPath: dirPath } of allPhaseDirs) {
            const summaries = fs
                .readdirSync(dirPath)
                .filter((f) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md');
            for (const summary of summaries) {
                try {
                    const content = fs.readFileSync(path.join(dirPath, summary), 'utf-8');
                    const fm = extractFrontmatter(content);
                    const etapaNum = fm['etapa'] || dir.split('-')[0];
                    if (!digest.phases[etapaNum]) {
                        digest.phases[etapaNum] = {
                            name: fm['name'] ||
                                dir.split('-').slice(1).join(' ') ||
                                'Unknown',
                            provides: new Set(),
                            affects: new Set(),
                            patterns: new Set(),
                        };
                    }
                    const phase = digest.phases[etapaNum];
                    const depGraph = fm['dependency-graph'];
                    // Merge provides
                    if (depGraph?.provides && Array.isArray(depGraph.provides)) {
                        depGraph.provides.forEach((p) => phase.provides.add(p));
                    }
                    else if (fm['provides'] && Array.isArray(fm['provides'])) {
                        fm['provides'].forEach((p) => phase.provides.add(p));
                    }
                    // Merge affects
                    if (depGraph?.affects && Array.isArray(depGraph.affects)) {
                        depGraph.affects.forEach((a) => phase.affects.add(a));
                    }
                    // Merge patterns
                    if (fm['patterns-established'] && Array.isArray(fm['patterns-established'])) {
                        fm['patterns-established'].forEach((p) => phase.patterns.add(p));
                    }
                    // Merge decisions
                    if (fm['key-decisions'] && Array.isArray(fm['key-decisions'])) {
                        fm['key-decisions'].forEach((d) => {
                            digest.decisions.push({ phase: etapaNum, decision: d });
                        });
                    }
                    // Merge tech stack
                    const techStack = fm['tech-stack'];
                    if (techStack?.added && Array.isArray(techStack.added)) {
                        techStack.added.forEach((t) => {
                            digest.tech_stack.add(typeof t === 'string' ? t : t.name);
                        });
                    }
                }
                catch (err) {
                    // Skip malformed summaries but log for debugging
                    process.stderr.write(`[cmdHistoryDigest] Skipping malformed summary: ${err.message}\n`);
                }
            }
        }
        // Convert Sets to Arrays for JSON output
        Object.keys(digest.phases).forEach((p) => {
            const phase = digest.phases[p];
            digest.phases[p] = {
                name: phase.name,
                provides: [...phase.provides],
                affects: [...phase.affects],
                patterns: [...phase.patterns],
            };
        });
        digest.tech_stack = [...digest.tech_stack];
        output(digest, raw);
    }
    catch (e) {
        error('Falha ao gerar histórico do projeto: ' + e.message);
    }
}
export function cmdResolveModel(cwd, agentType, raw) {
    if (!agentType) {
        error('tipo-de-agente obrigatório');
    }
    const config = loadConfig(cwd);
    const profile = config.model_profile || 'balanced';
    const model = resolveModelInternal(cwd, agentType);
    const agentModels = MODEL_PROFILES[agentType];
    const result = agentModels ? { model, profile } : { model, profile, unknown_agent: true };
    output(result, raw, model);
}
export function cmdCommit(cwd, message, files, raw, amend) {
    if (!message && !amend) {
        error('mensagem de commit obrigatória ou --amend');
    }
    const config = loadConfig(cwd);
    // Check commit_docs config
    if (!config.commit_docs) {
        output({ committed: false, hash: null, reason: 'skipped_commit_docs_false' }, raw, 'skipped');
        return;
    }
    // Check if .fase-ai is gitignored
    if (isGitIgnored(cwd, '.fase-ai')) {
        output({ committed: false, hash: null, reason: 'skipped_gitignored' }, raw, 'skipped');
        return;
    }
    // Stage files
    const filesToStage = files && files.length > 0 ? files : ['.fase-ai/'];
    for (const file of filesToStage) {
        execGit(cwd, ['add', file]);
    }
    // Commit
    const commitArgs = amend ? ['commit', '--amend', '--no-edit'] : ['commit', '-m', message];
    const commitResult = execGit(cwd, commitArgs);
    if (commitResult.exitCode !== 0) {
        if (commitResult.stdout.includes('nothing to commit') ||
            commitResult.stderr.includes('nothing to commit')) {
            output({ committed: false, hash: null, reason: 'nothing_to_commit' }, raw, 'nothing');
            return;
        }
        output({ committed: false, hash: null, reason: 'nothing_to_commit', error: commitResult.stderr }, raw, 'nothing');
        return;
    }
    // Get short hash
    const hashResult = execGit(cwd, ['rev-parse', '--short', 'HEAD']);
    const hash = hashResult.exitCode === 0 ? hashResult.stdout : null;
    output({ committed: true, hash, reason: 'committed' }, raw, hash || 'committed');
}
function parseDecisions(decisionsList) {
    if (!decisionsList || !Array.isArray(decisionsList))
        return [];
    return decisionsList.map((d) => {
        const colonIdx = d.indexOf(':');
        if (colonIdx > 0) {
            return {
                summary: d.substring(0, colonIdx).trim(),
                rationale: d.substring(colonIdx + 1).trim(),
            };
        }
        return { summary: d, rationale: null };
    });
}
export function cmdSummaryExtract(cwd, summaryPath, fields, raw) {
    if (!summaryPath) {
        error('caminho-do-resumo obrigatório');
    }
    const fullPath = validatePathInsideCwd(cwd, summaryPath);
    if (!fs.existsSync(fullPath)) {
        output({ error: 'Arquivo não encontrado', path: summaryPath }, raw);
        return;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const fm = extractFrontmatter(content);
    const techStack = fm['tech-stack'];
    const fullResult = {
        path: summaryPath,
        one_liner: fm['one-liner'] || null,
        key_files: fm['key-files'] || [],
        tech_added: techStack?.added || [],
        patterns: fm['patterns-established'] || [],
        decisions: parseDecisions(fm['key-decisions']),
        requirements_completed: fm['requirements-completed'] || [],
    };
    // If fields specified, filter to only those fields
    if (fields && fields.length > 0) {
        const filtered = { path: summaryPath };
        for (const field of fields) {
            if (fullResult[field] !== undefined) {
                filtered[field] = fullResult[field];
            }
        }
        output(filtered, raw);
        return;
    }
    output(fullResult, raw);
}
export function cmdProgressRender(cwd, format, raw) {
    const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
    const milestone = getMilestoneInfo(cwd);
    const phases = [];
    let totalPlans = 0;
    let totalSummaries = 0;
    try {
        const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
        const dirs = entries
            .filter((e) => e.isDirectory())
            .map((e) => e.name)
            .sort((a, b) => compareEtapaNum(a, b));
        for (const dir of dirs) {
            const dm = dir.match(/^(\d+(?:\.\d+)*)-?(.*)/);
            const etapaNum = dm ? dm[1] : dir;
            const etapaNome = dm && dm[2] ? dm[2].replace(/-/g, ' ') : '';
            const phaseFiles = fs.readdirSync(path.join(etapasDir, dir));
            const plans = phaseFiles.filter((f) => f.endsWith('-PLAN.md') || f === 'PLAN.md').length;
            const summaries = phaseFiles.filter((f) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md').length;
            totalPlans += plans;
            totalSummaries += summaries;
            let status;
            if (plans === 0)
                status = 'Pendente';
            else if (summaries >= plans)
                status = 'Completo';
            else if (summaries > 0)
                status = 'Em Progresso';
            else
                status = 'Planejado';
            phases.push({ number: etapaNum, name: etapaNome, plans, summaries, status });
        }
    }
    catch (err) {
        process.stderr.write(`[cmdProgressRender] Error reading phases: ${err.message}\n`);
    }
    const percent = totalPlans > 0 ? Math.min(100, Math.round((totalSummaries / totalPlans) * 100)) : 0;
    if (format === 'table') {
        const barWidth = 10;
        const filled = Math.round((percent / 100) * barWidth);
        const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(barWidth - filled);
        let out = `# ${milestone.version} ${milestone.name}\n\n`;
        out += `**Progresso:** [${bar}] ${totalSummaries}/${totalPlans} planos (${percent}%)\n\n`;
        out += `| Fase | Nome | Planos | Status |\n`;
        out += `|------|------|--------|--------|\n`;
        for (const p of phases) {
            out += `| ${p.number} | ${p.name} | ${p.summaries}/${p.plans} | ${p.status} |\n`;
        }
        output({ rendered: out }, raw, out);
    }
    else if (format === 'bar') {
        const barWidth = 20;
        const filled = Math.round((percent / 100) * barWidth);
        const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(barWidth - filled);
        const text = `[${bar}] ${totalSummaries}/${totalPlans} planos (${percent}%)`;
        output({ bar: text, percent, completed: totalSummaries, total: totalPlans }, raw, text);
    }
    else {
        output({
            milestone_version: milestone.version,
            milestone_name: milestone.name,
            phases,
            total_plans: totalPlans,
            total_summaries: totalSummaries,
            percent,
        }, raw);
    }
}
export function cmdTodoComplete(cwd, filename, raw) {
    if (!filename) {
        error('nome de arquivo obrigatório');
    }
    const safeFilename = sanitizeFilename(filename);
    const pendingDir = path.join(cwd, '.fase-ai', 'todos', 'pending');
    const completedDir = path.join(cwd, '.fase-ai', 'todos', 'completed');
    const sourcePath = path.join(pendingDir, safeFilename);
    const destPath = path.join(completedDir, safeFilename);
    // Ensure completed directory exists
    try {
        fs.mkdirSync(completedDir, { recursive: true });
    }
    catch (err) {
        error(`Falha ao criar diretório completados: ${err.message}`);
    }
    // Atomic move with rename to avoid race condition
    // Read, add timestamp, write to temp, then atomic rename
    let content;
    try {
        content = fs.readFileSync(sourcePath, 'utf-8');
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            error(`Tarefa não encontrada: ${safeFilename}`);
        }
        error(`Falha ao ler tarefa: ${err.message}`);
    }
    const today = new Date().toISOString().split('T')[0];
    content = `completed: ${today}\n` + content;
    // Write to destination first, then unlink source
    // This is more atomic than delete-then-write pattern
    try {
        fs.writeFileSync(destPath, content, 'utf-8');
        fs.unlinkSync(sourcePath);
    }
    catch (err) {
        // Clean up partial write if source still exists
        try {
            if (fs.existsSync(destPath)) {
                fs.unlinkSync(destPath);
            }
        }
        catch (cleanupErr) {
            process.stderr.write(`[cmdTodoComplete] Cleanup failed: ${cleanupErr.message}\n`);
        }
        error(`Falha ao completar tarefa: ${err.message}`);
    }
    output({ completed: true, file: safeFilename, date: today }, raw, 'completed');
}
export function cmdScaffold(cwd, type, options, raw) {
    const { phase, name } = options;
    // Validate scaffold type against allowlist
    const allowedTypes = ['context', 'uat', 'verification', 'phase-dir'];
    if (!allowedTypes.includes(type)) {
        error(`Tipo de scaffold desconhecido: ${type}. Tipos disponíveis: ${allowedTypes.join(', ')}`);
    }
    // Validate phase name format if provided (alphanumeric, dashes, dots allowed)
    if (phase && !/^[\d.\-a-zA-Z]+$/.test(phase)) {
        error(`Formato de fase inválido: "${phase}". Use apenas letras, números, pontos e traços.`);
    }
    // Validate name if provided (alphanumeric, spaces, dashes allowed)
    if (name && !/^[\s\-a-zA-Z0-9]+$/.test(name)) {
        error(`Formato de nome inválido: "${name}". Use apenas letras, números, espaços e traços.`);
    }
    const padded = phase ? normalizeEtapaNome(phase) : '00';
    const today = new Date().toISOString().split('T')[0];
    // Find phase directory
    const phaseInfo = phase ? findEtapaInternal(cwd, phase) : null;
    const phaseDir = phaseInfo ? path.join(cwd, phaseInfo.directory) : null;
    if (phase && !phaseDir && type !== 'phase-dir') {
        error(`Diretório da fase ${phase} não encontrado`);
    }
    let filePath;
    let content;
    const phaseName = name || phaseInfo?.phase_name || 'Unnamed';
    switch (type) {
        case 'context': {
            filePath = path.join(phaseDir, `${padded}-CONTEXT.md`);
            content = `---\nphase: "${padded}"\nname: "${phaseName}"\ncreated: ${today}\n---\n\n# Fase ${phase}: ${phaseName} — Contexto\n\n## Decisões\n\n_Decisões serão capturadas durante /gsd:discuss-fase ${phase}_\n\n## Áreas de Discrição\n\n Áreas onde o executor pode usar julgamento_\n\n## Ideias Postergadas\n\n_Ideias para considerar posteriormente_\n`;
            break;
        }
        case 'uat': {
            filePath = path.join(phaseDir, `${padded}-UAT.md`);
            content = `---\nphase: "${padded}"\nname: "${phaseName}"\ncreated: ${today}\nstatus: pending\n---\n\n# Fase ${phase}: ${phaseName} — Teste de Aceitação do Usuário\n\n## Resultados dos Testes\n\n| # | Teste | Status | Observações |\n|---|------|--------|-------|\n\n## Resumo\n\n_Teste de aceitação pendente_\n`;
            break;
        }
        case 'verification': {
            filePath = path.join(phaseDir, `${padded}-VERIFICATION.md`);
            content = `---\nphase: "${padded}"\nname: "${phaseName}"\ncreated: ${today}\nstatus: pending\n---\n\n# Fase ${phase}: ${phaseName} — Verificação\n\n## Verificação Retroativa ao Objetivo\n\n**Objetivo da Fase:** [Do ROADMAP.md]\n\n## Verificações\n\n| # | Requisito | Status | Evidência |\n|---|------------|--------|----------|\n\n## Resultado\n\n_Verificação pendente_\n`;
            break;
        }
        case 'phase-dir': {
            if (!phase || !name) {
                error('fase e nome obrigatórios para scaffold phase-dir');
            }
            const slug = generateSlugInternal(name);
            const dirName = `${padded}-${slug}`;
            const phasesParent = path.join(cwd, '.fase-ai', 'etapas');
            fs.mkdirSync(phasesParent, { recursive: true });
            const dirPath = path.join(phasesParent, dirName);
            fs.mkdirSync(dirPath, { recursive: true });
            output({ created: true, directory: `.fase-ai/phases/${dirName}`, path: dirPath }, raw, dirPath);
            return;
        }
        default:
            error(`Tipo de scaffold desconhecido: ${type}. Tipos disponíveis: context, uat, verification, phase-dir`);
            return;
    }
    if (fs.existsSync(filePath)) {
        output({ created: false, reason: 'already_exists', path: filePath }, raw, 'exists');
        return;
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    const relPath = toPosixPath(path.relative(cwd, filePath));
    output({ created: true, path: relPath }, raw, relPath);
}
//# sourceMappingURL=commands.js.map