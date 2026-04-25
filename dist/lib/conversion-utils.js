/**
 * Conversion Utilities — Shared utilities for provider converters
 *
 * Common operations used across all provider converters:
 * - Frontmatter extraction and parsing
 * - YAML quoting and formatting
 * - Tool name mapping application
 * - Path replacement
 *
 * @module lib/conversion-utils
 */
/**
 * Color name to hex mapping for providers that require hex colors
 */
export const colorNameToHex = {
    cyan: '#00FFFF',
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    yellow: '#FFFF00',
    magenta: '#FF00FF',
    orange: '#FFA500',
    purple: '#800080',
    pink: '#FFC0CB',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#808080',
    grey: '#808080',
};
/**
 * Extract frontmatter and body from markdown content
 *
 * @param content - Markdown file content
 * @returns Object with frontmatter string (or null) and body
 */
export function extractFrontmatterAndBody(content) {
    if (!content.startsWith('---')) {
        return { frontmatter: null, body: content };
    }
    const endIndex = content.indexOf('---', 3);
    if (endIndex === -1) {
        return { frontmatter: null, body: content };
    }
    return {
        frontmatter: content.substring(3, endIndex).trim(),
        body: content.substring(endIndex + 3),
    };
}
/**
 * Extract a specific field from frontmatter string
 *
 * @param frontmatter - Frontmatter string (without --- delimiters)
 * @param fieldName - Field name to extract
 * @returns Field value or null if not found
 */
export function extractFrontmatterField(frontmatter, fieldName) {
    if (!frontmatter)
        return null;
    const regex = new RegExp(`^${fieldName}:\\s*(.+)$`, 'm');
    const match = frontmatter.match(regex);
    if (!match)
        return null;
    return match[1].trim().replace(/^['"]|['"]$/g, '');
}
/**
 * Convert string to single line (replace whitespace with single space)
 *
 * @param value - String with potential multi-line content
 * @returns Single-line string
 */
export function toSingleLine(value) {
    return value.replace(/\s+/g, ' ').trim();
}
/**
 * Quote a value for YAML (using JSON.stringify for proper escaping)
 *
 * @param value - String to quote
 * @returns YAML-quoted string
 */
export function yamlQuote(value) {
    return JSON.stringify(value);
}
/**
 * Apply tool name mapping to content
 *
 * Replaces tool name references in markdown content based on the provided mapping.
 * Handles both standalone references and tool list items.
 *
 * @param content - Content with tool name references
 * @param toolMapping - Map of Claude tool names to provider tool names
 * @returns Content with tool names replaced
 */
export function applyToolMapping(content, toolMapping) {
    let converted = content;
    for (const [claudeTool, providerTool] of Object.entries(toolMapping)) {
        // Replace standalone tool name references
        converted = converted.replace(new RegExp(`\\b${claudeTool}\\b`, 'g'), providerTool);
    }
    return converted;
}
/**
 * Apply path replacements to content
 *
 * @param content - Content with path references
 * @param replacements - Array of from/to replacement patterns
 * @returns Content with paths replaced
 */
export function applyPathReplacements(content, replacements) {
    let converted = content;
    for (const { from, to } of replacements) {
        converted = converted.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
    }
    return converted;
}
/**
 * Convert slash commands to skill mentions (for Codex)
 *
 * @param content - Content with slash commands
 * @returns Content with skill mentions
 */
export function convertSlashCommandsToSkillMentions(content) {
    let converted = content.replace(/\/fase-([a-z0-9-]+)/gi, (_, commandName) => {
        return `$fase-${String(commandName).toLowerCase()}`;
    });
    converted = converted.replace(/\/fase-help\b/g, '$fase-help');
    return converted;
}
/**
 * Strip HTML <sub> tags for terminal output
 *
 * Converts <sub>text</sub> to italic *(text)* for readable terminal output.
 *
 * @param content - Content with potential <sub> tags
 * @returns Content with <sub> tags converted
 */
export function stripSubTags(content) {
    return content.replace(/<sub>(.*?)<\/sub>/g, '*($1)*');
}
/**
 * Escape ${VAR} patterns for Gemini CLI compatibility
 *
 * Gemini's templateString() treats ${word} as template variables.
 * Convert to $VAR (no braces) which is equivalent bash.
 *
 * @param content - Content with potential ${VAR} patterns
 * @returns Content with ${VAR} converted to $VAR
 */
export function escapeTemplateVariables(content) {
    return content.replace(/\$\{(\w+)\}/g, '$$$1');
}
/**
 * Fix TOML escaping issues in agent instructions
 *
 * Handles:
 * - Backticks: \` → \\` (escapes backslashes for TOML)
 * - Grep patterns: \| → | (pipes don't need escaping in grep -E)
 *
 * @param content - Content with potential TOML escaping issues
 * @returns Content with TOML escaping fixed
 */
export function fixTomlEscaping(content) {
    let fixed = content;
    // Fix backtick escaping: \` becomes \\`
    fixed = fixed.replace(/\\`/g, '\\\\`');
    // Fix grep patterns: \| becomes | (pipes don't need escaping in grep -E)
    fixed = fixed.replace(/\\|/g, '|');
    return fixed;
}
/**
 * Normalize agent name to valid slug (lowercase, no accents)
 *
 * @param name - Agent name
 * @returns Normalized slug
 */
export function normalizeAgentName(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}
/**
 * Build YAML frontmatter from field map
 *
 * @param fields - Map of field name to value
 * @returns YAML frontmatter string with --- delimiters
 */
export function buildFrontmatter(fields) {
    const lines = [];
    for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) {
            lines.push(`${key}: ${yamlQuote(value)}`);
        }
    }
    if (lines.length === 0)
        return '';
    return `---\n${lines.join('\n')}\n---`;
}
/**
 * Parse allowed-tools from frontmatter
 *
 * Handles both YAML array format and comma-separated string format.
 *
 * @param frontmatter - Frontmatter string
 * @returns Array of tool names
 */
export function parseAllowedTools(frontmatter) {
    if (!frontmatter)
        return [];
    const tools = [];
    const lines = frontmatter.split('\n');
    let inAllowedTools = false;
    for (const line of lines) {
        const trimmed = line.trim();
        // Detect start of allowed-tools array
        if (trimmed.startsWith('allowed-tools:')) {
            inAllowedTools = true;
            // Check for inline comma-separated format
            const inlineValue = trimmed.substring(14).trim();
            if (inlineValue) {
                const parsed = inlineValue
                    .split(',')
                    .map((t) => t.trim())
                    .filter((t) => t);
                tools.push(...parsed);
                inAllowedTools = false;
            }
            continue;
        }
        // Detect inline tools: field (comma-separated string)
        if (trimmed.startsWith('tools:')) {
            const toolsValue = trimmed.substring(6).trim();
            if (toolsValue) {
                const parsed = toolsValue
                    .split(',')
                    .map((t) => t.trim())
                    .filter((t) => t);
                tools.push(...parsed);
            }
            continue;
        }
        // Collect array items
        if (inAllowedTools) {
            if (trimmed.startsWith('- ')) {
                tools.push(trimmed.substring(2).trim());
                continue;
            }
            else if (trimmed && !trimmed.startsWith('-')) {
                inAllowedTools = false;
            }
        }
    }
    return tools;
}
//# sourceMappingURL=conversion-utils.js.map