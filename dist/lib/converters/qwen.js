/**
 * Qwen Converter — Convert FASE content to Qwen Code format
 *
 * Qwen-specific transformations:
 * - Commands: markdown files with optional YAML frontmatter
 * - Frontmatter: only 'description' is supported (name, tools, color, skills stripped)
 * - Command name: comes from filename, not frontmatter
 * - Path replacements: ~/.claude → .qwen, ~/.fase → .qwen
 *
 * @module lib/converters/qwen
 */
import { applyPathReplacements, yamlQuote, } from '../conversion-utils.js';
/**
 * Convert frontmatter for Qwen format
 * Qwen Commands only support 'description' in frontmatter
 */
function convertQwenFrontmatter(content) {
    // Replace path references first
    let convertedContent = content;
    convertedContent = convertedContent.replace(/~\/\.claude\b/g, '.qwen');
    convertedContent = convertedContent.replace(/\$HOME\/\.claude\b/g, '.qwen');
    convertedContent = convertedContent.replace(/~\/\.fase\b/g, '.qwen');
    convertedContent = convertedContent.replace(/\$HOME\/\.fase\b/g, '.qwen');
    // Check if content has frontmatter
    if (!convertedContent.startsWith('---')) {
        return convertedContent;
    }
    const endIndex = convertedContent.indexOf('---', 3);
    if (endIndex === -1) {
        return convertedContent;
    }
    const frontmatter = convertedContent.substring(3, endIndex).trim();
    const body = convertedContent.substring(endIndex + 3);
    // Parse frontmatter line by line and extract only description
    const lines = frontmatter.split('\n');
    let description = null;
    for (const line of lines) {
        const trimmed = line.trim();
        // Extract description field
        if (trimmed.startsWith('description:')) {
            description = trimmed
                .substring(12)
                .trim()
                .replace(/^['"]|['"]$/g, '');
        }
        // name, tools, color, skills are ignored for Qwen Commands
    }
    // Build new frontmatter (only description if present)
    const newFrontmatter = description
        ? `---\ndescription: ${yamlQuote(description)}\n---`
        : '';
    return newFrontmatter ? `${newFrontmatter}\n${body}` : body;
}
/**
 * Qwen Converter
 */
export const QwenConverter = {
    name: 'qwen',
    dirName: '.qwen',
    convertAgent(content, context) {
        // Apply path replacements
        let converted = applyPathReplacements(content, this.getPathReplacements(context));
        // Convert frontmatter (Qwen only supports description)
        converted = convertQwenFrontmatter(converted);
        return {
            filename: '', // Filename determined by caller
            content: converted,
        };
    },
    convertCommand(content, filename, context) {
        // Apply path replacements
        let converted = applyPathReplacements(content, this.getPathReplacements(context));
        // Convert frontmatter
        converted = convertQwenFrontmatter(converted);
        return {
            filename: filename,
            content: converted,
        };
    },
    getToolMapping() {
        // Qwen uses same tool names as Claude
        return {};
    },
    getPathReplacements(_context) {
        // Qwen uses .qwen for all path replacements
        return [
            { from: '~/.claude/', to: '.qwen/' },
            { from: '$HOME/.claude/', to: '.qwen/' },
            { from: '~/.fase/', to: '.qwen/' },
            { from: '$HOME/.fase/', to: '.qwen/' },
        ];
    },
};
//# sourceMappingURL=qwen.js.map