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
import { Config } from './config.js';
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
export declare function buildInitContext(cwd: string): InitContext;
/**
 * Build extended context for phase-related init commands
 */
export declare function buildPhaseContext(cwd: string, phase: string): PhaseContext;
