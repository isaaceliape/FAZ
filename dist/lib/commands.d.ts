/**
 * Validates that a user-provided path stays within the cwd boundary.
 * Prevents path traversal attacks (e.g., ../../../etc/passwd) including via symlinks.
 * @param cwd - The project root directory
 * @param userPath - The user-provided path to validate
 * @returns The resolved absolute path if valid
 * @throws Error if path escapes cwd boundary
 */
export declare function validatePathInsideCwd(cwd: string, userPath: string): string;
/**
 * Sanitizes a filename by removing path separators and normalizing.
 * @param filename - User-provided filename
 * @returns Safe filename without path components
 */
export declare function sanitizeFilename(filename: string): string;
export declare function cmdGenerateSlug(text: string, raw: boolean): void;
export declare function cmdCurrentTimestamp(format: string, raw: boolean): void;
export declare function cmdListTodos(cwd: string, area: string, raw: boolean): void;
export declare function cmdVerifyPathExists(cwd: string, targetPath: string, raw: boolean): void;
export declare function cmdHistoryDigest(cwd: string, raw: boolean): void;
export declare function cmdResolveModel(cwd: string, agentType: string, raw: boolean): void;
export declare function cmdCommit(cwd: string, message: string, files: string[], raw: boolean, amend: boolean): void;
export declare function cmdSummaryExtract(cwd: string, summaryPath: string, fields: string[], raw: boolean): void;
export declare function cmdProgressRender(cwd: string, format: string, raw: boolean): void;
export declare function cmdTodoComplete(cwd: string, filename: string, raw: boolean): void;
interface ScaffoldOptions {
    phase?: string;
    name?: string;
}
export declare function cmdScaffold(cwd: string, type: string, options: ScaffoldOptions, raw: boolean): void;
export {};
