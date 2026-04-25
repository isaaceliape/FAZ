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
import { loadConfig, Config } from './config.js';
import {
  getMilestoneInfo,
  pathExistsInternal,
  resolveModelInternal,
  findEtapaInternal,
  getRoadmapEtapaInternal,
  generateSlugInternal,
  toPosixPath,
} from './core.js';
import fs from 'fs';

/**
 * Milestone information returned by getMilestoneInfo
 */
export interface MilestoneInfo {
  version: string;
  name: string;
}

/**
 * Phase information returned by findEtapaInternal
 */
export interface PhaseInfo {
  found: boolean;
  directory: string;
  phase_number: string | null;
  phase_name: string | null;
  phase_slug: string | null;
  plans: string[];
  summaries: string[];
  incomplete_plans: string[];
  has_research: boolean;
  has_context: boolean;
  has_verification: boolean;
}

/**
 * Path existence checks for common .fase-ai paths
 */
export interface PathStatus {
  state: boolean;
  roadmap: boolean;
  project: boolean;
  planning: boolean;
  config: boolean;
  phases: boolean;
  archive: boolean;
  codebase: boolean;
  todos: boolean;
  quick: boolean;
}

/**
 * Common context available to all init commands
 */
export interface InitContext {
  cwd: string;
  config: Config;
  milestone: MilestoneInfo;
  paths: PathStatus;

  /** Resolve a model by role (e.g., 'gsd-executor') */
  resolveModel(role: string): string;

  /** Get base object with common fields for output */
  base(): Record<string, unknown>;
}

/**
 * Extended context for phase-related init commands
 */
export interface PhaseContext extends InitContext {
  phase: string;
  phaseInfo: PhaseInfo | null;
  phaseReqIds: string | null;

  /** Phase-specific paths (relative to cwd) */
  phasePaths: {
    context: string | null;
    research: string | null;
    verification: string | null;
    uat: string | null;
  };

  /** Get base object with phase fields */
  phaseBase(): Record<string, unknown>;
}

/**
 * Build common init context for any init command
 */
export function buildInitContext(cwd: string): InitContext {
  const config = loadConfig(cwd);
  const milestone = getMilestoneInfo(cwd);

  const paths: PathStatus = {
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

  const resolveModel = (role: string): string => resolveModelInternal(cwd, role);

  const base = (): Record<string, unknown> => ({
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
export function buildPhaseContext(cwd: string, phase: string): PhaseContext {
  const baseCtx = buildInitContext(cwd);
  const phaseInfo = findEtapaInternal(cwd, phase);

  // Extract requirements from roadmap
  const roadmapEtapa = getRoadmapEtapaInternal(cwd, phase);
  const reqMatch = roadmapEtapa?.section?.match(/^\*\*Requirements\*\*:[^\S\n]*([^\n]*)$/m);
  const reqExtracted = reqMatch
    ? reqMatch[1]
        .replace(/[\[\]]/g, '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
        .join(', ')
    : null;
  const phaseReqIds = reqExtracted && reqExtracted !== 'TBD' ? reqExtracted : null;

  // Phase-specific paths
  const phasePaths: {
    context: string | null;
    research: string | null;
    verification: string | null;
    uat: string | null;
  } = {
    context: null,
    research: null,
    verification: null,
    uat: null,
  };

  if (phaseInfo?.directory) {
    const phaseDirFull = path.join(cwd, phaseInfo.directory);
    try {
      const files = fs.readdirSync(phaseDirFull);
      const contextFile = files.find(
        (f: string) => f.endsWith('-CONTEXT.md') || f === 'CONTEXT.md'
      );
      if (contextFile)
        phasePaths.context = toPosixPath(path.join(phaseInfo.directory, contextFile));
      const researchFile = files.find(
        (f: string) => f.endsWith('-RESEARCH.md') || f === 'RESEARCH.md'
      );
      if (researchFile)
        phasePaths.research = toPosixPath(path.join(phaseInfo.directory, researchFile));
      const verificationFile = files.find(
        (f: string) => f.endsWith('-VERIFICATION.md') || f === 'VERIFICATION.md'
      );
      if (verificationFile)
        phasePaths.verification = toPosixPath(path.join(phaseInfo.directory, verificationFile));
      const uatFile = files.find((f: string) => f.endsWith('-UAT.md') || f === 'UAT.md');
      if (uatFile) phasePaths.uat = toPosixPath(path.join(phaseInfo.directory, uatFile));
    } catch {}
  }

  const phaseBase = (): Record<string, unknown> => ({
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
