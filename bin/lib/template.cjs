/**
 * Template — Template selection and fill operations
 */

const fs = require('fs');
const path = require('path');
const { normalizeEtapaNome, findEtapaInternal, generateSlugInternal, toPosixPath, output, error } = require('./core.cjs');
const { reconstructFrontmatter } = require('./frontmatter.cjs');

function cmdTemplateSelect(cwd, planPath, raw) {
  if (!planPath) {
    error('caminho-do-plano obrigatório');
  }

  try {
    const fullPath = path.join(cwd, planPath);
    const content = fs.readFileSync(fullPath, 'utf-8');

    // Simple heuristics
    const taskMatch = content.match(/###\s*Task\s*\d+/g) || [];
    const taskCount = taskMatch.length;

    const decisionMatch = content.match(/decision/gi) || [];
    const hasDecisions = decisionMatch.length > 0;

    // Count file mentions
    const fileMentions = new Set();
    const filePattern = /`([^`]+\.[a-zA-Z]+)`/g;
    let m;
    while ((m = filePattern.exec(content)) !== null) {
      if (m[1].includes('/') && !m[1].startsWith('http')) {
        fileMentions.add(m[1]);
      }
    }
    const fileCount = fileMentions.size;

    let template = 'templates/summary-standard.md';
    let type = 'standard';

    if (taskCount <= 2 && fileCount <= 3 && !hasDecisions) {
      template = 'templates/summary-minimal.md';
      type = 'minimal';
    } else if (hasDecisions || fileCount > 6 || taskCount > 5) {
      template = 'templates/summary-complex.md';
      type = 'complex';
    }

    const result = { template, type, taskCount, fileCount, hasDecisions };
    output(result, raw, template);
  } catch (e) {
    // Fallback to standard
    output({ template: 'templates/summary-standard.md', type: 'standard', error: e.message }, raw, 'templates/summary-standard.md');
  }
}

function cmdTemplateFill(cwd, templateType, options, raw) {
  if (!templateType) { error('tipo de modelo obrigatório: summary, plan ou verification'); }
  if (!options.phase) { error('--phase obrigatório'); }

  const phaseInfo = findEtapaInternal(cwd, options.phase);
  if (!phaseInfo || !phaseInfo.found) { output({ error: 'Fase não encontrada', phase: options.phase }, raw); return; }

  const padded = normalizeEtapaNome(options.phase);
  const today = new Date().toISOString().split('T')[0];
  const etapaNome = options.name || phaseInfo.phase_name || 'Unnamed';
  const phaseSlug = phaseInfo.phase_slug || generateSlugInternal(etapaNome);
  const phaseId = `${padded}-${phaseSlug}`;
  const planNum = (options.plan || '01').padStart(2, '0');
  const fields = options.fields || {};

  let frontmatter, body, fileName;

  switch (templateType) {
    case 'summary': {
      frontmatter = {
        phase: phaseId,
        plan: planNum,
        subsystem: '[primary category]',
        tags: [],
        provides: [],
        affects: [],
        'tech-stack': { added: [], patterns: [] },
        'key-files': { created: [], modified: [] },
        'key-decisions': [],
        'patterns-established': [],
        duration: '[X]min',
        completed: today,
        ...fields,
      };
      body = [
        `# Fase ${options.phase}: ${etapaNome} — Resumo`,
        '',
        '**[Resumo substantivo descrevendo o resultado]**',
        '',
        '## Desempenho',
        '- **Duração:** [tempo]',
        '- **Tarefas:** [contagem realizada]',
        '- **Arquivos modificados:** [contagem]',
        '',
        '## Realizações',
        '- [Resultado-chave 1]',
        '- [Resultado-chave 2]',
        '',
        '## Commits de Tarefas',
        '1. **Tarefa 1: [nome da tarefa]** - `hash`',
        '',
        '## Arquivos Criados/Modificados',
        '- `caminho/para/arquivo.ts` - O que faz',
        '',
        '## Decisões & Desvios',
        '[Decisões-chave ou "Nenhuma - seguiu o plano conforme especificado"]',
        '',
        '## Prontidão para Próxima Fase',
        '[O que está pronto para próxima fase]',
      ].join('\n');
      fileName = `${padded}-${planNum}-SUMMARY.md`;
      break;
    }
    case 'plan': {
      const planType = options.type || 'execute';
      const etapa = parseInt(options.etapa) || 1;
      frontmatter = {
        phase: phaseId,
        plan: planNum,
        type: planType,
        etapa,
        depends_on: [],
        files_modified: [],
        autonomous: true,
        user_setup: [],
        must_haves: { truths: [], artifacts: [], key_links: [] },
        ...fields,
      };
      body = [
        `# Fase ${options.phase} Plano ${planNum}: [Título]`,
        '',
        '## Objetivo',
        '- **O quê:** [O que este plano constrói]',
        '- **Por quê:** [Por que importa para o objetivo da fase]',
        '- **Saída:** [Entrega concreta]',
        '',
        '## Contexto',
        '@.fase-ai-local/PROJECT.md',
        '@.fase-ai-local/ROADMAP.md',
        '@.fase-ai-local/STATE.md',
        '',
        '## Tarefas',
        '',
        '<task type="code">',
        '  <name>[Nome da tarefa]</name>',
        '  <files>[caminhos de arquivo]</files>',
        '  <action>[O que fazer]</action>',
        '  <verify>[Como verificar]</verify>',
        '  <done>[Definição de feito]</done>',
        '</task>',
        '',
        '## Verificação',
        '[Como verificar que este plano atingiu seu objetivo]',
        '',
        '## Critérios de Sucesso',
        '- [ ] [Critério 1]',
        '- [ ] [Critério 2]',
      ].join('\n');
      fileName = `${padded}-${planNum}-PLAN.md`;
      break;
    }
    case 'verification': {
      frontmatter = {
        phase: phaseId,
        verified: new Date().toISOString(),
        status: 'pending',
        score: '0/0 must-haves verified',
        ...fields,
      };
      body = [
        `# Fase ${options.phase}: ${etapaNome} — Verificação`,
        '',
        '## Verdades Observáveis',
        '| # | Verdade | Status | Evidência |',
        '|---|---------|--------|-----------|',
        '| 1 | [Verdade] | pendente | |',
        '',
        '## Artefatos Obrigatórios',
        '| Artefato | Esperado | Status | Detalhes |',
        '|----------|----------|--------|----------|',
        '| [caminho] | [o quê] | pendente | |',
        '',
        '## Verificação de Links-Chave',
        '| De | Para | Via | Status | Detalhes |',
        '|----|------|-----|--------|----------|',
        '| [origem] | [destino] | [conexão] | pendente | |',
        '',
        '## Cobertura de Requisitos',
        '| Requisito | Status | Problema Bloqueador |',
        '|-----------|--------|-------------------|',
        '| [req] | pendente | |',
        '',
        '## Resultado',
        '[Verificação pendente]',
      ].join('\n');
      fileName = `${padded}-VERIFICATION.md`;
      break;
    }
    default:
      error(`Tipo de modelo desconhecido: ${templateType}. Disponíveis: summary, plan, verification`);
      return;
  }

  const fullContent = `---\n${reconstructFrontmatter(frontmatter)}\n---\n\n${body}\n`;
  const outPath = path.join(cwd, phaseInfo.directory, fileName);

  if (fs.existsSync(outPath)) {
    output({ error: 'Arquivo já existe', path: toPosixPath(path.relative(cwd, outPath)) }, raw);
    return;
  }

  fs.writeFileSync(outPath, fullContent, 'utf-8');
  const relPath = toPosixPath(path.relative(cwd, outPath));
  output({ created: true, path: relPath, template: templateType }, raw, relPath);
}

module.exports = { cmdTemplateSelect, cmdTemplateFill };
