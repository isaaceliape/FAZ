/**
 * Core — Shared utilities, constants, and internal helpers
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModelProfile {
  quality: string;
  balanced: string;
  budget: string;
}

export interface Config {
  model_profile: string;
  commit_docs: boolean;
  search_gitignored: boolean;
  branching_strategy: string;
  etapa_branch_template: string;
  milestone_branch_template: string;
  research: boolean;
  plan_checker: boolean;
  verifier: boolean;
  nyquist_validation: boolean;
  parallelization: boolean;
  brave_search: boolean;
  model_overrides: Record<string, string> | null;
}

export interface EtapaInfo {
  found: boolean;
  directory: string;
  phase_number: string;
  phase_name: string | null;
  phase_slug: string | null;
  plans: string[];
  summaries: string[];
  incomplete_plans: string[];
  has_research: boolean;
  has_context: boolean;
  has_verification: boolean;
  archived?: string;
}

export interface GitResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface MilestoneInfo {
  version: string;
  name: string;
}

export interface ArchivedEtapaEntry {
  name: string;
  milestone: string;
  basePath: string;
  fullPath: string;
}

export interface RoadmapEtapaInfo {
  found: boolean;
  phase_number: string;
  phase_name: string;
  goal: string | null;
  section: string;
}

export type MilestoneEtapaFilter = ((dirName: string) => boolean) & { phaseCount: number };

// ─── Path helpers ─────────────────────────────────────────────────────────────

/** Normaliza caminho relativo para usar sempre barras dianteiras (multi-plataforma). */
export function toPosixPath(p: string): string {
  return p.split(path.sep).join('/');
}

/** Guardrail: validates that a file path is inside .fase-ai directory */
export function ensureInsidePlanejamento(cwd: string, filePath: string, operation = 'file operation'): string {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
  const planejPath = path.join(cwd, '.fase-ai');
  const normalizedFull = path.normalize(fullPath);
  const normalizedPlanej = path.normalize(planejPath);

  if (!normalizedFull.startsWith(normalizedPlanej + path.sep) && normalizedFull !== normalizedPlanej) {
    throw new Error(`${operation} must be inside .fase-ai/: ${filePath}`);
  }
  return fullPath;
}

/** Check if a path is inside .fase-ai without throwing */
export function isInsidePlanejamento(cwd: string, filePath: string): boolean {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
  const planejPath = path.join(cwd, '.fase-ai');
  const normalizedFull = path.normalize(fullPath);
  const normalizedPlanej = path.normalize(planejPath);
  return normalizedFull.startsWith(normalizedPlanej + path.sep) || normalizedFull === normalizedPlanej;
}

// ─── Model Profile Table ──────────────────────────────────────────────────────

export const MODEL_PROFILES: Record<string, ModelProfile> = {
  'gsd-planner':              { quality: 'opus', balanced: 'opus',   budget: 'sonnet' },
  'gsd-roadmapper':           { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
  'gsd-executor':             { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
  'gsd-phase-researcher':     { quality: 'opus', balanced: 'sonnet', budget: 'haiku' },
  'gsd-project-researcher':   { quality: 'opus', balanced: 'sonnet', budget: 'haiku' },
  'gsd-research-synthesizer': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-debugger':             { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
  'gsd-codebase-mapper':      { quality: 'sonnet', balanced: 'haiku', budget: 'haiku' },
  'gsd-verifier':             { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-plan-checker':         { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-integration-checker':  { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-nyquist-auditor':      { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
};

// ─── Output helpers ───────────────────────────────────────────────────────────

export function output(result: unknown, raw?: boolean, rawValue?: unknown): void {
  if (raw && rawValue !== undefined) {
    process.stdout.write(String(rawValue));
  } else {
    const json = JSON.stringify(result, null, 2);
    // Large payloads exceed Claude Code's Bash tool buffer (~50KB).
    // Write to tmpfile and output the path prefixed with @file: so callers can detect it.
    if (json.length > 50000) {
      const tmpPath = path.join(os.tmpdir(), `gsd-${Date.now()}.json`);
      fs.writeFileSync(tmpPath, json, 'utf-8');
      process.stdout.write('@file:' + tmpPath);
    } else {
      process.stdout.write(json);
    }
  }
  process.exit(0);
}

export function error(message: string): never {
  process.stderr.write('Erro: ' + message + '\n');
  process.exit(1);
}

// ─── File & Config utilities ──────────────────────────────────────────────────

export function safeReadFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export function loadConfig(cwd: string): Config {
  const configPath = path.join(cwd, '.fase-ai', 'config.json');
  const defaults: Config = {
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
    const parsed: Record<string, unknown> = JSON.parse(raw);

    // Migrate deprecated "depth" key to "granularity" with value mapping
    if ('depth' in parsed && !('granularity' in parsed)) {
      const depthToGranularity: Record<string, string> = { quick: 'coarse', standard: 'standard', comprehensive: 'fine' };
      parsed['granularity'] = depthToGranularity[parsed['depth'] as string] ?? parsed['depth'];
      delete parsed['depth'];
      try { fs.writeFileSync(configPath, JSON.stringify(parsed, null, 2), 'utf-8'); } catch {}
    }

    const get = (key: string, nested?: { section: string; field: string }): unknown => {
      if (parsed[key] !== undefined) return parsed[key];
      if (nested) {
        const section = parsed[nested.section];
        if (section && typeof section === 'object' && section !== null) {
          const val = (section as Record<string, unknown>)[nested.field];
          if (val !== undefined) return val;
        }
      }
      return undefined;
    };

    const parallelization = (() => {
      const val = get('parallelization');
      if (typeof val === 'boolean') return val;
      if (typeof val === 'object' && val !== null && 'enabled' in val) return (val as { enabled: boolean }).enabled;
      return defaults.parallelization;
    })();

    return {
      model_profile:              (get('model_profile') ?? defaults.model_profile) as string,
      commit_docs:                (get('commit_docs', { section: 'planning', field: 'commit_docs' }) ?? defaults.commit_docs) as boolean,
      search_gitignored:          (get('search_gitignored', { section: 'planning', field: 'search_gitignored' }) ?? defaults.search_gitignored) as boolean,
      branching_strategy:         (get('branching_strategy', { section: 'git', field: 'branching_strategy' }) ?? defaults.branching_strategy) as string,
      etapa_branch_template:      (get('etapa_branch_template', { section: 'git', field: 'etapa_branch_template' }) ?? defaults.etapa_branch_template) as string,
      milestone_branch_template:  (get('milestone_branch_template', { section: 'git', field: 'milestone_branch_template' }) ?? defaults.milestone_branch_template) as string,
      research:                   (get('research', { section: 'workflow', field: 'research' }) ?? defaults.research) as boolean,
      plan_checker:               (get('plan_checker', { section: 'workflow', field: 'plan_check' }) ?? defaults.plan_checker) as boolean,
      verifier:                   (get('verifier', { section: 'workflow', field: 'verifier' }) ?? defaults.verifier) as boolean,
      nyquist_validation:         (get('nyquist_validation', { section: 'workflow', field: 'nyquist_validation' }) ?? defaults.nyquist_validation) as boolean,
      parallelization,
      brave_search:               (get('brave_search') ?? defaults.brave_search) as boolean,
      model_overrides:            (parsed['model_overrides'] as Record<string, string> | null | undefined) ?? null,
    };
  } catch {
    return defaults;
  }
}

// ─── Git utilities ────────────────────────────────────────────────────────────

export function isGitIgnored(cwd: string, targetPath: string): boolean {
  try {
    // --no-index checks .gitignore rules regardless of whether the file is tracked.
    execSync('git check-ignore -q --no-index -- ' + targetPath.replace(/[^a-zA-Z0-9._\-/]/g, ''), {
      cwd,
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

export function execGit(cwd: string, args: string[]): GitResult {
  try {
    const escaped = args.map(a => {
      if (/^[a-zA-Z0-9._\-/=:@]+$/.test(a)) return a;
      return "'" + a.replace(/'/g, "'\\''") + "'";
    });
    const stdout = execSync('git ' + escaped.join(' '), {
      cwd,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    return { exitCode: 0, stdout: (stdout as string).trim(), stderr: '' };
  } catch (err) {
    const e = err as NodeJS.ErrnoException & { status?: number; stdout?: Buffer; stderr?: Buffer };
    return {
      exitCode: e.status ?? 1,
      stdout: (e.stdout ?? '').toString().trim(),
      stderr: (e.stderr ?? '').toString().trim(),
    };
  }
}

// ─── Etapa utilities ──────────────────────────────────────────────────────────

export function escapeRegex(value: unknown): string {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeEtapaNome(etapa: unknown): string {
  const match = String(etapa).match(/^(\d+)([A-Z])?((?:\.\d+)*)/i);
  if (!match) return String(etapa);
  const padded = match[1].padStart(2, '0');
  const letter = match[2] ? match[2].toUpperCase() : '';
  const decimal = match[3] ?? '';
  return padded + letter + decimal;
}

export function compareEtapaNum(a: string, b: string): number {
  const pa = String(a).match(/^(\d+)([A-Z])?((?:\.\d+)*)/i);
  const pb = String(b).match(/^(\d+)([A-Z])?((?:\.\d+)*)/i);
  if (!pa || !pb) return String(a).localeCompare(String(b));
  const intDiff = parseInt(pa[1], 10) - parseInt(pb[1], 10);
  if (intDiff !== 0) return intDiff;
  const la = (pa[2] ?? '').toUpperCase();
  const lb = (pb[2] ?? '').toUpperCase();
  if (la !== lb) {
    if (!la) return -1;
    if (!lb) return 1;
    return la < lb ? -1 : 1;
  }
  const aDecParts = pa[3] ? pa[3].slice(1).split('.').map(p => parseInt(p, 10)) : [];
  const bDecParts = pb[3] ? pb[3].slice(1).split('.').map(p => parseInt(p, 10)) : [];
  const maxLen = Math.max(aDecParts.length, bDecParts.length);
  if (aDecParts.length === 0 && bDecParts.length > 0) return -1;
  if (bDecParts.length === 0 && aDecParts.length > 0) return 1;
  for (let i = 0; i < maxLen; i++) {
    const av = Number.isFinite(aDecParts[i]) ? aDecParts[i] : 0;
    const bv = Number.isFinite(bDecParts[i]) ? bDecParts[i] : 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

export function searchEtapaInDir(baseDir: string, relBase: string, normalized: string): EtapaInfo | null {
  try {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort((a, b) => compareEtapaNum(a, b));
    const match = dirs.find((d) => d.startsWith(normalized));
    if (!match) return null;

    const dirMatch = match.match(/^(\d+[A-Z]?(?:\.\d+)*)-?(.*)/i);
    const etapaNumber = dirMatch ? dirMatch[1] : normalized;
    const etapaNome = dirMatch?.[2] ?? null;
    const phaseDir = path.join(baseDir, match);
    const phaseFiles = fs.readdirSync(phaseDir);

    const plans = phaseFiles.filter((f: string) => f.endsWith('-PLAN.md') || f === 'PLAN.md').sort();
    const summaries = phaseFiles.filter((f: string) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md').sort();
    const hasResearch = phaseFiles.some((f: string) => f.endsWith('-RESEARCH.md') || f === 'RESEARCH.md');
    const hasContext = phaseFiles.some((f: string) => f.endsWith('-CONTEXT.md') || f === 'CONTEXT.md');
    const hasVerification = phaseFiles.some((f: string) => f.endsWith('-VERIFICATION.md') || f === 'VERIFICATION.md');

    const completedPlanIds = new Set(
      summaries.map((s: string) => s.replace('-SUMMARY.md', '').replace('SUMMARY.md', ''))
    );
    const incompletePlans = plans.filter((p: string) => {
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
  } catch {
    return null;
  }
}

export function findEtapaInternal(cwd: string, etapa: string): EtapaInfo | null {
  if (!etapa) return null;

  const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
  const normalized = normalizeEtapaNome(etapa);

  const current = searchEtapaInDir(etapasDir, '.fase-ai/phases', normalized);
  if (current) return current;

  const milestonesDir = path.join(cwd, '.fase-ai', 'milestones');
  if (!fs.existsSync(milestonesDir)) return null;

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
  } catch {}

  return null;
}

export function getArchivedEtapasDirs(cwd: string): ArchivedEtapaEntry[] {
  const milestonesDir = path.join(cwd, '.fase-ai', 'milestones');
  const results: ArchivedEtapaEntry[] = [];

  if (!fs.existsSync(milestonesDir)) return results;

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
  } catch {}

  return results;
}

// ─── Roadmap & model utilities ────────────────────────────────────────────────

export function getRoadmapEtapaInternal(cwd: string, etapaNum: string | number): RoadmapEtapaInfo | null {
  if (!etapaNum) return null;
  const roadmapPath = path.join(cwd, '.fase-ai', 'ROADMAP.md');
  if (!fs.existsSync(roadmapPath)) return null;

  try {
    const content = fs.readFileSync(roadmapPath, 'utf-8');
    const escapedEtapa = escapeRegex(etapaNum.toString());
    const phasePattern = new RegExp(`#{2,4}\\s*(?:Phase|Etapa)\\s+${escapedEtapa}:\\s*([^\\n]+)`, 'i');
    const headerMatch = content.match(phasePattern);
    if (!headerMatch) return null;

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
  } catch {
    return null;
  }
}

export function resolveModelInternal(cwd: string, agentType: string): string {
  const config = loadConfig(cwd);

  const override = config.model_overrides?.[agentType];
  if (override) {
    return override === 'opus' ? 'inherit' : override;
  }

  const profile = config.model_profile || 'balanced';
  const agentModels = MODEL_PROFILES[agentType];
  if (!agentModels) return 'sonnet';
  const resolved = agentModels[profile as keyof ModelProfile] || agentModels['balanced'] || 'sonnet';
  return resolved === 'opus' ? 'inherit' : resolved;
}

// ─── Misc utilities ───────────────────────────────────────────────────────────

export function pathExistsInternal(cwd: string, targetPath: string): boolean {
  const fullPath = path.isAbsolute(targetPath) ? targetPath : path.join(cwd, targetPath);
  try {
    fs.statSync(fullPath);
    return true;
  } catch {
    return false;
  }
}

export function generateSlugInternal(text: string | null | undefined): string | null {
  if (!text) return null;
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function getMilestoneInfo(cwd: string): MilestoneInfo {
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
  } catch {
    return { version: 'v1.0', name: 'milestone' };
  }
}

export function getMilestoneEtapaFilter(cwd: string): MilestoneEtapaFilter {
  const milestonePhaseNums = new Set<string>();
  try {
    const roadmap = fs.readFileSync(path.join(cwd, '.fase-ai', 'ROADMAP.md'), 'utf-8');
    const phasePattern = /#{2,4}\s*Phase\s+(\d+[A-Z]?(?:\.\d+)*)\s*:/gi;
    let m: RegExpExecArray | null;
    while ((m = phasePattern.exec(roadmap)) !== null) {
      milestonePhaseNums.add(m[1]);
    }
  } catch {}

  if (milestonePhaseNums.size === 0) {
    const passAll = ((() => true) as unknown) as MilestoneEtapaFilter;
    passAll.phaseCount = 0;
    return passAll;
  }

  const normalized = new Set(
    [...milestonePhaseNums].map(n => (n.replace(/^0+/, '') || '0').toLowerCase())
  );

  function isDirInMilestone(dirName: string): boolean {
    const m = dirName.match(/^0*(\d+[A-Za-z]?(?:\.\d+)*)/);
    if (!m) return false;
    return normalized.has(m[1].toLowerCase());
  }
  (isDirInMilestone as MilestoneEtapaFilter).phaseCount = milestonePhaseNums.size;
  return isDirInMilestone as MilestoneEtapaFilter;
}
