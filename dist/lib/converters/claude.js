/**
 * Claude Converter — Identity converter for Claude Code format
 *
 * Claude is the source format for FASE content. This converter provides
 * identity transformations with path replacements, useful for:
 * - Testing the converter interface
 * - Copying Claude files to target directories with path updates
 *
 * @module lib/converters/claude
 */
import { applyPathReplacements } from '../conversion-utils.js';
/**
 * Claude Converter
 *
 * Identity transformations: tool names unchanged, minimal frontmatter changes.
 * Applies path replacements for project-local installs.
 */
export const ClaudeConverter = {
    name: 'claude',
    dirName: '.claude',
    convertAgent(content, context) {
        // Apply path replacements only
        const converted = applyPathReplacements(content, this.getPathReplacements(context));
        return {
            filename: '', // Filename determined by caller
            content: converted,
        };
    },
    convertCommand(content, filename, context) {
        // Apply path replacements only
        const converted = applyPathReplacements(content, this.getPathReplacements(context));
        return {
            filename: filename,
            content: converted,
        };
    },
    getToolMapping() {
        // Identity mapping - Claude tools stay as-is
        return {};
    },
    getPathReplacements(context) {
        return [
            { from: '~/.claude/', to: context.pathPrefix },
            { from: '$HOME/.claude/', to: context.pathPrefix },
            { from: '~/.fase/', to: context.pathPrefix },
            { from: '$HOME/.fase/', to: context.pathPrefix },
        ];
    },
};
//# sourceMappingURL=claude.js.map