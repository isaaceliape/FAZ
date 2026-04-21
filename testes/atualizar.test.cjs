/**
 * Testes para o comando fase:atualizar
 *
 * Cobre a lógica descrita em .github/commands/atualizar.md:
 *  1. Estrutura do arquivo de comando (todas as fases presentes)
 *  2. Framework de migrações versionadas (idempotência, rastreamento)
 *  3. Mecanismo de backup (criação, preservação de conteúdo, restauração)
 *  4. Validação de frontmatter dos agentes instalados
 *  5. Detecção de runtimes instalados
 *  6. Contagem de arquivos para exibição de diff antes/depois
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const COMMAND_FILE = path.join(__dirname, '..', '.github', 'commands', 'atualizar.md');

// ─── Helpers de teste ─────────────────────────────────────────────────────────

function createTempProject() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-atualizar-test-'));
  fs.mkdirSync(path.join(tmpDir, '.fase-ai-local'), { recursive: true });
  return tmpDir;
}

function cleanup(tmpDir) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ─── Reimplementações da lógica descrita em atualizar.md ─────────────────────
// Estas funções espelham os scripts bash das fases do comando para permitir
// testes unitários sem depender de shell ou de npx.

/** Phase 3 — Verifica se uma migração já foi aplicada */
function isMigrationApplied(migrationsFile, id) {
  if (!fs.existsSync(migrationsFile)) return false;
  return fs.readFileSync(migrationsFile, 'utf-8')
    .split('\n')
    .some(line => line.trim() === id);
}

/** Phase 3 — Registra uma migração como aplicada */
function recordMigration(migrationsFile, id) {
  fs.appendFileSync(migrationsFile, `${id}\n`);
}

/** Phase 0 — Cria snapshot dos arquivos instalados antes da atualização */
function createBackup(projectDir) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19).replace('T', '-');
  const backupDir = path.join(projectDir, '.fase-ai-local', '.backup', `pre-update-${stamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  for (const runtime of ['.claude', '.opencode', '.gemini', '.codex']) {
    const runtimePath = path.join(projectDir, runtime);
    if (!fs.existsSync(runtimePath)) continue;
    const backupRuntime = path.join(backupDir, runtime);
    fs.mkdirSync(backupRuntime, { recursive: true });
    for (const sub of ['agents', 'commands', 'command', 'skills']) {
      const src = path.join(runtimePath, sub);
      if (fs.existsSync(src)) {
        fs.cpSync(src, path.join(backupRuntime, sub), { recursive: true });
      }
    }
  }
  return backupDir;
}

/** Phase 0 — Restaura agentes e comandos a partir do backup */
function restoreFromBackup(backupDir, projectDir) {
  for (const runtime of ['.claude', '.opencode', '.gemini', '.codex']) {
    const backupRuntime = path.join(backupDir, runtime);
    if (!fs.existsSync(backupRuntime)) continue;
    for (const sub of ['agents', 'commands', 'command', 'skills']) {
      const src = path.join(backupRuntime, sub);
      const dst = path.join(projectDir, runtime, sub);
      if (fs.existsSync(src)) {
        fs.mkdirSync(dst, { recursive: true });
        fs.cpSync(src, dst, { recursive: true });
      }
    }
  }
}

/** Phase 2 — Detecta runtimes com arquivos fase-* instalados */
function detectInstalledRuntimes(projectDir) {
  const runtimes = [];
  const subdirsByRuntime = {
    '.claude':   ['agents', 'commands'],
    '.opencode': ['agents', 'command'],
    '.gemini':   ['agents'],
    '.codex':    ['agents', 'skills'],
  };
  for (const [runtime, subdirs] of Object.entries(subdirsByRuntime)) {
    const runtimePath = path.join(projectDir, runtime);
    if (!fs.existsSync(runtimePath)) continue;
    const hasFaseFiles = subdirs.some(sub => {
      const subPath = path.join(runtimePath, sub);
      if (!fs.existsSync(subPath)) return false;
      return fs.readdirSync(subPath).some(f => f.startsWith('fase-'));
    });
    if (hasFaseFiles) runtimes.push(runtime);
  }
  return runtimes;
}

/** Phase 5.2 — Valida campos obrigatórios no frontmatter de um agente */
function validateAgentFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parts = content.split('---');
  if (parts.length < 3) return { valid: false, missing: ['frontmatter block'] };
  const fm = parts[1];
  const missing = [];
  if (!fm.includes('name:'))        missing.push('name');
  if (!fm.includes('description:')) missing.push('description');
  // Aceita tanto allowed-tools: (comandos) quanto tools: (agentes legados)
  if (!fm.includes('allowed-tools:') && !fm.includes('tools:')) missing.push('allowed-tools');
  return { valid: missing.length === 0, missing };
}

/** Phase 2.5 — Conta arquivos fase-* instalados em um runtime */
function countFaseFiles(projectDir, runtimeDir) {
  function count(subdir) {
    const dir = path.join(projectDir, runtimeDir, subdir);
    if (!fs.existsSync(dir)) return 0;
    return fs.readdirSync(dir).filter(f => f.startsWith('fase-')).length;
  }
  return { agents: count('agents'), commands: count('commands') };
}

// ─── 1. Estrutura do arquivo de comando ───────────────────────────────────────

describe('atualizar.md — estrutura do arquivo', () => {
  let content;

  beforeEach(() => {
    content = fs.readFileSync(COMMAND_FILE, 'utf-8');
  });

  test('arquivo existe em .github/commands/', () => {
    assert.ok(fs.existsSync(COMMAND_FILE));
  });

  test('frontmatter tem name fase:atualizar e description', () => {
    const fm = content.split('---')[1] || '';
    assert.ok(fm.includes('name: fase:atualizar'));
    assert.ok(fm.includes('description:'));
  });

  test('Fase 0 define backup com timestamp em .fase-ai-local/.backup', () => {
    assert.ok(content.includes('Fase 0'));
    assert.ok(content.includes('.fase-ai-local/.backup'));
    assert.ok(content.includes('pre-update-'));
  });

  test('Fase 0 inclui procedimento de restauração', () => {
    assert.ok(content.includes('Restauração') || content.includes('restauração'));
    assert.ok(content.includes('cp -r'));
  });

  test('Fase 1 verifica versão instalada e a disponível no npm', () => {
    assert.ok(content.includes('Fase 1'));
    assert.ok(content.includes('npm view fase-ai version'));
    assert.ok(content.includes('VERSION'));
  });

  test('Fase 2 detecta os 4 runtimes suportados', () => {
    assert.ok(content.includes('Fase 2'));
    assert.ok(content.includes('.claude'));
    assert.ok(content.includes('.opencode'));
    assert.ok(content.includes('.gemini'));
    assert.ok(content.includes('.codex'));
  });

  test('Fase 2.5 conta arquivos antes da atualização para gerar diff', () => {
    assert.ok(content.includes('2.5'));
    // Deve mencionar variáveis de contagem ou palavras-chave de diff
    assert.ok(
      content.includes('AGENTES_ANTES') || content.includes('agentes=') || content.includes('antes'),
    );
  });

  test('Fase 3 referencia arquivo migrations-applied e define M-001 e M-002', () => {
    assert.ok(content.includes('Fase 3'));
    assert.ok(content.includes('migrations-applied'));
    assert.ok(content.includes('M-001'));
    assert.ok(content.includes('M-002'));
  });

  test('Fase 3 tem ponto de extensão para futuras migrações', () => {
    assert.ok(content.includes('M-003') || content.includes('M-NNN') || content.includes('novas migrações'));
  });

  test('Fase 4 usa npx fase-ai --atualizar', () => {
    assert.ok(content.includes('Fase 4'));
    assert.ok(content.includes('npx fase-ai --atualizar'));
  });

  test('Fase 5 valida frontmatter com os três campos obrigatórios', () => {
    assert.ok(content.includes('Fase 5'));
    assert.ok(content.includes('name:'));
    assert.ok(content.includes('description:'));
    assert.ok(content.includes('allowed-tools:'));
  });

  test('Fase 5 verifica agentes críticos do pipeline', () => {
    assert.ok(content.includes('fase-executor'));
    assert.ok(content.includes('fase-verificador'));
    assert.ok(content.includes('fase-planejador'));
  });

  test('Fase 6 inclui versão, runtimes, migrações, diff e backup no relatório', () => {
    assert.ok(content.includes('Fase 6'));
    assert.ok(content.includes('Versão anterior') || content.includes('versão anterior'));
    assert.ok(content.includes('Runtimes') || content.includes('runtimes'));
    assert.ok(content.includes('Migrações') || content.includes('migrações'));
    assert.ok(content.includes('Backup') || content.includes('backup'));
  });

  test('Fase 6 instrui reinicialização do runtime após atualização', () => {
    assert.ok(content.includes('reiniciar') || content.includes('Reiniciar'));
    assert.ok(content.includes('Claude Code'));
    assert.ok(content.includes('OpenCode'));
  });
});

// ─── 2. Framework de migrações ────────────────────────────────────────────────

describe('atualizar — framework de migrações versionadas', () => {
  let tmpDir;
  let migrationsFile;

  beforeEach(() => {
    tmpDir = createTempProject();
    migrationsFile = path.join(tmpDir, '.fase-ai-local', 'migrations-applied');
  });

  afterEach(() => cleanup(tmpDir));

  test('migração não registrada retorna false', () => {
    assert.strictEqual(isMigrationApplied(migrationsFile, 'M-001'), false);
  });

  test('migração registrada retorna true', () => {
    recordMigration(migrationsFile, 'M-001');
    assert.strictEqual(isMigrationApplied(migrationsFile, 'M-001'), true);
  });

  test('IDs de migração diferentes não se confundem', () => {
    recordMigration(migrationsFile, 'M-001');
    assert.strictEqual(isMigrationApplied(migrationsFile, 'M-002'), false);
    assert.strictEqual(isMigrationApplied(migrationsFile, 'M-010'), false);
  });

  test('múltiplas migrações registradas de forma independente', () => {
    recordMigration(migrationsFile, 'M-001');
    recordMigration(migrationsFile, 'M-002');
    assert.strictEqual(isMigrationApplied(migrationsFile, 'M-001'), true);
    assert.strictEqual(isMigrationApplied(migrationsFile, 'M-002'), true);
    assert.strictEqual(isMigrationApplied(migrationsFile, 'M-003'), false);
  });

  test('arquivo migrations-applied é criado ao registrar primeira migração', () => {
    assert.ok(!fs.existsSync(migrationsFile));
    recordMigration(migrationsFile, 'M-001');
    assert.ok(fs.existsSync(migrationsFile));
  });

  test('idempotência: verificar antes de registrar evita duplicatas', () => {
    // Simula o padrão: "if (!applied) record"
    if (!isMigrationApplied(migrationsFile, 'M-001')) recordMigration(migrationsFile, 'M-001');
    if (!isMigrationApplied(migrationsFile, 'M-001')) recordMigration(migrationsFile, 'M-001');

    const lines = fs.readFileSync(migrationsFile, 'utf-8')
      .split('\n')
      .filter(l => l.trim() === 'M-001');
    assert.strictEqual(lines.length, 1, 'M-001 deve aparecer exatamente uma vez');
  });

  test('M-001: renomeia .planejamento para .fase-ai-local quando existe', () => {
    const legacyDir = path.join(tmpDir, '.planejamento');
    fs.mkdirSync(legacyDir);
    fs.writeFileSync(path.join(legacyDir, 'STATE.md'), '# State\n');

    // Aplicar migração
    const targetDir = path.join(tmpDir, '.fase-ai-local');
    // Mover conteúdo do legado para destino (já existe, então copiar)
    fs.readdirSync(legacyDir).forEach(f => {
      fs.renameSync(path.join(legacyDir, f), path.join(targetDir, f));
    });
    fs.rmdirSync(legacyDir);
    recordMigration(migrationsFile, 'M-001');

    assert.ok(!fs.existsSync(legacyDir), '.planejamento deve ser removido');
    assert.ok(fs.existsSync(path.join(targetDir, 'STATE.md')), 'STATE.md deve existir no destino');
    assert.strictEqual(isMigrationApplied(migrationsFile, 'M-001'), true);
  });

  test('M-001: é marcada como aplicada mesmo quando .planejamento não existe', () => {
    assert.ok(!fs.existsSync(path.join(tmpDir, '.planejamento')));
    // Comportamento esperado: ignorar e registrar assim mesmo
    recordMigration(migrationsFile, 'M-001');
    assert.strictEqual(isMigrationApplied(migrationsFile, 'M-001'), true);
  });

  test('migrações são aplicadas em ordem crescente de ID', () => {
    ['M-001', 'M-002', 'M-003'].forEach(id => recordMigration(migrationsFile, id));
    const lines = fs.readFileSync(migrationsFile, 'utf-8')
      .split('\n')
      .filter(Boolean);
    assert.deepStrictEqual(lines, ['M-001', 'M-002', 'M-003']);
  });
});

// ─── 3. Mecanismo de backup ───────────────────────────────────────────────────

describe('atualizar — mecanismo de backup pré-atualização', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => cleanup(tmpDir));

  test('cria diretório dentro de .fase-ai-local/.backup com prefixo pre-update-', () => {
    const backupDir = createBackup(tmpDir);
    assert.ok(backupDir.includes(path.join('.fase-ai-local', '.backup')));
    assert.ok(path.basename(backupDir).startsWith('pre-update-'));
    assert.ok(fs.existsSync(backupDir));
  });

  test('cada chamada cria um diretório de backup distinto', (_, done) => {
    const b1 = createBackup(tmpDir);
    // Forçar timestamp diferente com pequena pausa
    setTimeout(() => {
      const b2 = createBackup(tmpDir);
      assert.notStrictEqual(b1, b2);
      done();
    }, 1100);
  });

  test('copia agentes do .claude para o backup', () => {
    const agentsDir = path.join(tmpDir, '.claude', 'agents');
    fs.mkdirSync(agentsDir, { recursive: true });
    fs.writeFileSync(path.join(agentsDir, 'fase-executor.md'), 'executor content');
    fs.writeFileSync(path.join(agentsDir, 'fase-verificador.md'), 'verificador content');

    const backupDir = createBackup(tmpDir);
    const backupAgents = path.join(backupDir, '.claude', 'agents');

    assert.ok(fs.existsSync(path.join(backupAgents, 'fase-executor.md')));
    assert.ok(fs.existsSync(path.join(backupAgents, 'fase-verificador.md')));
  });

  test('preserva o conteúdo exato dos arquivos copiados', () => {
    const agentsDir = path.join(tmpDir, '.claude', 'agents');
    fs.mkdirSync(agentsDir, { recursive: true });
    const original = '---\nname: fase:executor\ndescription: Executa tarefas\ntools:\n  - Bash\n---\n';
    fs.writeFileSync(path.join(agentsDir, 'fase-executor.md'), original);

    const backupDir = createBackup(tmpDir);
    const backed = fs.readFileSync(
      path.join(backupDir, '.claude', 'agents', 'fase-executor.md'),
      'utf-8'
    );
    assert.strictEqual(backed, original);
  });

  test('ignora runtimes não instalados sem lançar erro', () => {
    // Nenhum runtime configurado — não deve lançar
    assert.doesNotThrow(() => createBackup(tmpDir));
  });

  test('faz backup de múltiplos runtimes simultaneamente', () => {
    ['.claude', '.opencode'].forEach(rt => {
      const agentsDir = path.join(tmpDir, rt, 'agents');
      fs.mkdirSync(agentsDir, { recursive: true });
      fs.writeFileSync(path.join(agentsDir, 'fase-executor.md'), `${rt} content`);
    });

    const backupDir = createBackup(tmpDir);
    assert.ok(fs.existsSync(path.join(backupDir, '.claude', 'agents', 'fase-executor.md')));
    assert.ok(fs.existsSync(path.join(backupDir, '.opencode', 'agents', 'fase-executor.md')));
  });

  test('restaura agentes corrompidos a partir do backup', () => {
    const agentsDir = path.join(tmpDir, '.claude', 'agents');
    fs.mkdirSync(agentsDir, { recursive: true });
    fs.writeFileSync(path.join(agentsDir, 'fase-executor.md'), 'versão original');

    const backupDir = createBackup(tmpDir);

    // Simular corrupção durante a atualização
    fs.writeFileSync(path.join(agentsDir, 'fase-executor.md'), 'versão corrompida');

    restoreFromBackup(backupDir, tmpDir);
    const restored = fs.readFileSync(path.join(agentsDir, 'fase-executor.md'), 'utf-8');
    assert.strictEqual(restored, 'versão original');
  });

  test('restauração não afeta runtimes sem backup correspondente', () => {
    // Apenas .claude tem backup
    const claudeAgents = path.join(tmpDir, '.claude', 'agents');
    fs.mkdirSync(claudeAgents, { recursive: true });
    fs.writeFileSync(path.join(claudeAgents, 'fase-executor.md'), 'original');
    const backupDir = createBackup(tmpDir);

    // Criar .opencode após o backup (sem backup correspondente)
    const opencodeAgents = path.join(tmpDir, '.opencode', 'agents');
    fs.mkdirSync(opencodeAgents, { recursive: true });
    fs.writeFileSync(path.join(opencodeAgents, 'fase-executor.md'), 'opencode content');

    restoreFromBackup(backupDir, tmpDir);

    // .opencode não deve ser apagado — restauração só sobrescreve o que tem backup
    assert.ok(fs.existsSync(path.join(opencodeAgents, 'fase-executor.md')));
    assert.strictEqual(
      fs.readFileSync(path.join(opencodeAgents, 'fase-executor.md'), 'utf-8'),
      'opencode content'
    );
  });
});

// ─── 4. Validação de frontmatter ──────────────────────────────────────────────

describe('atualizar — validação de frontmatter dos agentes (Fase 5.2)', () => {
  let tmpDir;
  let agentsDir;

  beforeEach(() => {
    tmpDir = createTempProject();
    agentsDir = path.join(tmpDir, '.claude', 'agents');
    fs.mkdirSync(agentsDir, { recursive: true });
  });

  afterEach(() => cleanup(tmpDir));

  function writeAgent(name, content) {
    const filePath = path.join(agentsDir, `${name}.md`);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  test('frontmatter completo com allowed-tools passa', () => {
    const f = writeAgent('fase-executor',
      '---\nname: fase:executor\ndescription: Executa tarefas\nallowed-tools:\n  - Bash\n---\n');
    const r = validateAgentFrontmatter(f);
    assert.strictEqual(r.valid, true);
    assert.deepStrictEqual(r.missing, []);
  });

  test('frontmatter com tools: (agentes) passa como sinônimo de allowed-tools', () => {
    const f = writeAgent('fase-executor',
      '---\nname: fase:executor\ndescription: Executa tarefas\ntools:\n  - Bash\n---\n');
    const r = validateAgentFrontmatter(f);
    assert.strictEqual(r.valid, true);
  });

  test('campo name ausente é reportado', () => {
    const f = writeAgent('fase-executor',
      '---\ndescription: Executa tarefas\nallowed-tools:\n  - Bash\n---\n');
    const r = validateAgentFrontmatter(f);
    assert.strictEqual(r.valid, false);
    assert.ok(r.missing.includes('name'));
  });

  test('campo description ausente é reportado', () => {
    const f = writeAgent('fase-executor',
      '---\nname: fase:executor\nallowed-tools:\n  - Bash\n---\n');
    const r = validateAgentFrontmatter(f);
    assert.strictEqual(r.valid, false);
    assert.ok(r.missing.includes('description'));
  });

  test('campo allowed-tools ausente é reportado', () => {
    const f = writeAgent('fase-executor',
      '---\nname: fase:executor\ndescription: Executa tarefas\n---\n');
    const r = validateAgentFrontmatter(f);
    assert.strictEqual(r.valid, false);
    assert.ok(r.missing.includes('allowed-tools'));
  });

  test('frontmatter vazio reporta todos os campos em falta', () => {
    const f = writeAgent('fase-executor', '---\n---\n');
    const r = validateAgentFrontmatter(f);
    assert.strictEqual(r.valid, false);
    assert.ok(r.missing.includes('name'));
    assert.ok(r.missing.includes('description'));
    assert.ok(r.missing.includes('allowed-tools'));
  });

  test('arquivo sem delimitadores --- falha validação', () => {
    const f = writeAgent('fase-executor', 'name: fase:executor\ndescription: Executa tarefas\n');
    const r = validateAgentFrontmatter(f);
    assert.strictEqual(r.valid, false);
  });

  test('múltiplos campos ausentes são todos reportados', () => {
    const f = writeAgent('fase-executor', '---\nname: fase:executor\n---\n');
    const r = validateAgentFrontmatter(f);
    assert.strictEqual(r.valid, false);
    assert.ok(r.missing.includes('description'));
    assert.ok(r.missing.includes('allowed-tools'));
    assert.strictEqual(r.missing.length, 2);
  });

  test('conteúdo após o frontmatter não interfere na validação', () => {
    const f = writeAgent('fase-executor',
      '---\nname: fase:executor\ndescription: Desc\nallowed-tools:\n  - Bash\n---\n\n' +
      '# Sem description aqui — não deve confundir o parser\n');
    const r = validateAgentFrontmatter(f);
    assert.strictEqual(r.valid, true);
  });
});

// ─── 5. Detecção de runtimes instalados ───────────────────────────────────────

describe('atualizar — detecção de runtimes (Fase 2)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => cleanup(tmpDir));

  test('retorna lista vazia quando nenhum runtime tem arquivos fase-*', () => {
    assert.deepStrictEqual(detectInstalledRuntimes(tmpDir), []);
  });

  test('detecta .claude com agentes fase-*', () => {
    const dir = path.join(tmpDir, '.claude', 'agents');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'fase-executor.md'), '');
    assert.ok(detectInstalledRuntimes(tmpDir).includes('.claude'));
  });

  test('detecta .opencode com agentes fase-*', () => {
    const dir = path.join(tmpDir, '.opencode', 'agents');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'fase-executor.md'), '');
    assert.ok(detectInstalledRuntimes(tmpDir).includes('.opencode'));
  });

  test('detecta .gemini com agentes fase-*', () => {
    const dir = path.join(tmpDir, '.gemini', 'agents');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'fase-executor.md'), '');
    assert.ok(detectInstalledRuntimes(tmpDir).includes('.gemini'));
  });

  test('detecta .codex com skills fase-*', () => {
    const dir = path.join(tmpDir, '.codex', 'skills');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'fase-executor.md'), '');
    assert.ok(detectInstalledRuntimes(tmpDir).includes('.codex'));
  });

  test('detecta todos os 4 runtimes simultaneamente', () => {
    [
      ['.claude', 'agents'],
      ['.opencode', 'agents'],
      ['.gemini', 'agents'],
      ['.codex', 'skills'],
    ].forEach(([rt, sub]) => {
      const dir = path.join(tmpDir, rt, sub);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'fase-executor.md'), '');
    });
    const runtimes = detectInstalledRuntimes(tmpDir);
    assert.strictEqual(runtimes.length, 4);
  });

  test('não detecta runtime cujo diretório existe mas não tem arquivos fase-*', () => {
    const dir = path.join(tmpDir, '.claude', 'agents');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'outros-agente.md'), '');
    assert.ok(!detectInstalledRuntimes(tmpDir).includes('.claude'));
  });

  test('não detecta runtime sem subdiretório agents/ ou equivalent', () => {
    fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
    assert.ok(!detectInstalledRuntimes(tmpDir).includes('.claude'));
  });
});

// ─── 6. Contagem de arquivos para diff ────────────────────────────────────────

describe('atualizar — contagem de arquivos para diff antes/depois (Fase 2.5)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => cleanup(tmpDir));

  test('retorna zeros quando runtime não tem arquivos fase-*', () => {
    fs.mkdirSync(path.join(tmpDir, '.claude', 'agents'), { recursive: true });
    const c = countFaseFiles(tmpDir, '.claude');
    assert.strictEqual(c.agents, 0);
    assert.strictEqual(c.commands, 0);
  });

  test('conta apenas agentes com prefixo fase-*', () => {
    const dir = path.join(tmpDir, '.claude', 'agents');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'fase-executor.md'), '');
    fs.writeFileSync(path.join(dir, 'fase-verificador.md'), '');
    fs.writeFileSync(path.join(dir, 'outros-agente.md'), ''); // não deve contar

    const c = countFaseFiles(tmpDir, '.claude');
    assert.strictEqual(c.agents, 2);
  });

  test('conta apenas comandos com prefixo fase-*', () => {
    const dir = path.join(tmpDir, '.claude', 'commands');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'fase-atualizar.md'), '');
    fs.writeFileSync(path.join(dir, 'fase-debug.md'), '');

    const c = countFaseFiles(tmpDir, '.claude');
    assert.strictEqual(c.commands, 2);
  });

  test('diff reflete adição de agente entre dois snapshots', () => {
    const agentsDir = path.join(tmpDir, '.claude', 'agents');
    fs.mkdirSync(agentsDir, { recursive: true });
    fs.writeFileSync(path.join(agentsDir, 'fase-executor.md'), '');

    const antes = countFaseFiles(tmpDir, '.claude');
    fs.writeFileSync(path.join(agentsDir, 'fase-arquiteto.md'), ''); // novo agente
    const depois = countFaseFiles(tmpDir, '.claude');

    assert.strictEqual(depois.agents - antes.agents, 1);
  });

  test('diff reflete remoção de agente entre dois snapshots', () => {
    const agentsDir = path.join(tmpDir, '.claude', 'agents');
    fs.mkdirSync(agentsDir, { recursive: true });
    fs.writeFileSync(path.join(agentsDir, 'fase-executor.md'), '');
    fs.writeFileSync(path.join(agentsDir, 'fase-obsoleto.md'), '');

    const antes = countFaseFiles(tmpDir, '.claude');
    fs.unlinkSync(path.join(agentsDir, 'fase-obsoleto.md')); // removido na atualização
    const depois = countFaseFiles(tmpDir, '.claude');

    assert.strictEqual(antes.agents - depois.agents, 1);
  });

  test('retorna zeros sem lançar erro quando runtime não existe', () => {
    assert.doesNotThrow(() => {
      const c = countFaseFiles(tmpDir, '.claude');
      assert.strictEqual(c.agents, 0);
      assert.strictEqual(c.commands, 0);
    });
  });

  test('agentes e comandos são contados independentemente', () => {
    const agentsDir = path.join(tmpDir, '.claude', 'agents');
    const commandsDir = path.join(tmpDir, '.claude', 'commands');
    fs.mkdirSync(agentsDir, { recursive: true });
    fs.mkdirSync(commandsDir, { recursive: true });
    fs.writeFileSync(path.join(agentsDir, 'fase-executor.md'), '');
    fs.writeFileSync(path.join(commandsDir, 'fase-atualizar.md'), '');
    fs.writeFileSync(path.join(commandsDir, 'fase-debug.md'), '');

    const c = countFaseFiles(tmpDir, '.claude');
    assert.strictEqual(c.agents, 1);
    assert.strictEqual(c.commands, 2);
  });
});
