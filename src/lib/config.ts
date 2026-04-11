/**
 * Config — Planning config CRUD operations
 */

import fs from 'fs';
import path from 'path';
import { output, error } from './core.js';

export function cmdConfigEnsureSection(cwd: string, raw: boolean): void {
  const configPath = path.join(cwd, '.fase-ai', 'config.json');
  const planejamentoDir = path.join(cwd, '.fase-ai');

  try {
    if (!fs.existsSync(planejamentoDir)) {
      fs.mkdirSync(planejamentoDir, { recursive: true });
    }
  } catch (err) {
    error('Falha ao criar diretório .fase-ai: ' + (err as Error).message);
  }

  if (fs.existsSync(configPath)) {
    output({ created: false, reason: 'already_exists' }, raw, 'exists');
    return;
  }

  const hasBraveSearch = !!process.env['BRAVE_API_KEY'];
  const userDefaults: Record<string, unknown> = {};

  const hardcoded = {
    model_profile: 'balanced',
    commit_docs: true,
    search_gitignored: false,
    branching_strategy: 'none',
    etapa_branch_template: 'gsd/phase-{phase}-{slug}',
    milestone_branch_template: 'gsd/{milestone}-{slug}',
    workflow: {
      research: true,
      plan_check: true,
      verifier: true,
      nyquist_validation: true,
    },
    parallelization: true,
    brave_search: hasBraveSearch,
  };

  const defaults = {
    ...hardcoded,
    ...userDefaults,
    workflow: { ...hardcoded.workflow, ...((userDefaults['workflow'] as Record<string, unknown>) ?? {}) },
  };

  try {
    fs.writeFileSync(configPath, JSON.stringify(defaults, null, 2), 'utf-8');
    output({ created: true, path: '.fase-ai/config.json' }, raw, 'created');
  } catch (err) {
    error('Falha ao criar config.json: ' + (err as Error).message);
  }
}

export function cmdConfigSet(cwd: string, keyPath: string, value: string, raw: boolean): void {
  const configPath = path.join(cwd, '.fase-ai', 'config.json');

  if (!keyPath) {
    error('Uso: config-set <chave.caminho> <valor>');
  }

  let parsedValue: unknown = value;
  if (value === 'true') parsedValue = true;
  else if (value === 'false') parsedValue = false;
  else if (!isNaN(Number(value)) && value !== '') parsedValue = Number(value);

  let config: Record<string, unknown> = {};
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
    }
  } catch (err) {
    error('Falha ao ler config.json: ' + (err as Error).message);
  }

  const keys = keyPath.split('.');
  let current: Record<string, unknown> = config;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = parsedValue;

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    output({ updated: true, key: keyPath, value: parsedValue }, raw, `${keyPath}=${parsedValue}`);
  } catch (err) {
    error('Falha ao escrever config.json: ' + (err as Error).message);
  }
}

export function cmdConfigGet(cwd: string, keyPath: string, raw: boolean): void {
  const configPath = path.join(cwd, '.fase-ai', 'config.json');

  if (!keyPath) {
    error('Uso: config-get <chave.caminho>');
  }

  let config: Record<string, unknown> = {};
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
    } else {
      error('Nenhum config.json encontrado em ' + configPath);
    }
  } catch (err) {
    if ((err as Error).message.startsWith('No config.json')) throw err;
    error('Falha ao ler config.json: ' + (err as Error).message);
  }

  const keys = keyPath.split('.');
  let current: unknown = config;
  for (const key of keys) {
    if (current === undefined || current === null || typeof current !== 'object') {
      error(`Chave não encontrada: ${keyPath}`);
    }
    current = (current as Record<string, unknown>)[key];
  }

  if (current === undefined) {
    error(`Chave não encontrada: ${keyPath}`);
  }

  output(current, raw, String(current));
}
