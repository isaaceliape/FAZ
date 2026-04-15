/**
 * Core — Shared utilities, constants, and internal helpers
 */
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
export type MilestoneEtapaFilter = ((dirName: string) => boolean) & {
    phaseCount: number;
};
/** Normaliza caminho relativo para usar sempre barras dianteiras (multi-plataforma). */
export declare function toPosixPath(p: string): string;
/** Guardrail: validates that a file path is inside .fase-ai directory */
export declare function ensureInsidePlanejamento(cwd: string, filePath: string, operation?: string): string;
/** Check if a path is inside .fase-ai without throwing */
export declare function isInsidePlanejamento(cwd: string, filePath: string): boolean;
/**
 * Guardrail: Validates that a user-provided path doesn't escape the project boundary (cwd).
 * Protects against path traversal attacks via ../../../etc/passwd patterns.
 *
 * @param cwd - Project root directory (trusted base)
 * @param userPath - User-provided path (untrusted input)
 * @returns Resolved absolute path if valid
 * @throws Error if path escapes project boundary
 */
export declare function validatePathInsideCwd(cwd: string, userPath: string): string;
export declare const MODEL_PROFILES: Record<string, ModelProfile>;
export declare function output(result: unknown, raw?: boolean, rawValue?: unknown): void;
export declare function error(message: string): never;
export declare function safeReadFile(filePath: string): string | null;
export declare function loadConfig(cwd: string): Config;
export declare function isGitIgnored(cwd: string, targetPath: string): boolean;
export declare function execGit(cwd: string, args: string[]): GitResult;
export declare function escapeRegex(value: unknown): string;
export declare function normalizeEtapaNome(etapa: unknown): string;
export declare function compareEtapaNum(a: string, b: string): number;
export declare function searchEtapaInDir(baseDir: string, relBase: string, normalized: string): EtapaInfo | null;
export declare function findEtapaInternal(cwd: string, etapa: string): EtapaInfo | null;
export declare function getArchivedEtapasDirs(cwd: string): ArchivedEtapaEntry[];
export declare function getRoadmapEtapaInternal(cwd: string, etapaNum: string | number): RoadmapEtapaInfo | null;
export declare function resolveModelInternal(cwd: string, agentType: string): string;
export declare function pathExistsInternal(cwd: string, targetPath: string): boolean;
export declare function generateSlugInternal(text: string | null | undefined): string | null;
export declare function getMilestoneInfo(cwd: string): MilestoneInfo;
export declare function getMilestoneEtapaFilter(cwd: string): MilestoneEtapaFilter;
/**
 * Validate environment variables and return status.
 * @returns Object with valid status, missing vars, and warnings
 */
export declare function validateEnvVars(): {
    valid: boolean;
    missing: string[];
    warnings: string[];
};
/**
 * Check if there's enough disk space at the target path.
 * @param targetPath - Path where file will be written
 * @param minBytes - Minimum required bytes (default: 1MB)
 * @returns true if enough space is available
 */
export declare function checkDiskSpace(targetPath: string, minBytes?: number): boolean;
