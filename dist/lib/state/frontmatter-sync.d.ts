/**
 * State Frontmatter Sync — Build and sync YAML frontmatter for STATE.md
 *
 * Handles frontmatter synchronization between STATE.md body content and
 * YAML frontmatter block with metadata derived from filesystem state.
 */
import { type ParsedFrontmatter } from '../frontmatter.js';
/**
 * Read text from argument or file path.
 * If filePath is provided, reads from file; otherwise returns value.
 */
export declare function readTextArgOrFile(cwd: string, value: string | undefined, filePath: string | undefined, label: string): string | null;
/**
 * Build frontmatter object from STATE.md body content.
 * Extracts fields from body and enriches with filesystem-derived metadata.
 */
export declare function buildStateFrontmatter(bodyContent: string, cwd: string | null): ParsedFrontmatter;
/**
 * Strip YAML frontmatter block from content.
 */
export declare function stripFrontmatter(content: string): string;
/**
 * Sync STATE.md content with updated frontmatter.
 * Strips existing frontmatter, rebuilds from body content, and reconstructs.
 */
export declare function syncStateFrontmatter(content: string, cwd: string): string;
