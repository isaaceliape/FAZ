/**
 * Gemini Converter — Convert FASE content to Gemini CLI format
 *
 * Gemini-specific transformations:
 * - Tool names: snake_case (read_file, write_file, run_shell_command)
 * - Tools in frontmatter: YAML array format (not object)
 * - Color: removed (causes validation error)
 * - MCP tools: excluded (auto-discovered at runtime)
 * - ${VAR} patterns: escaped to $VAR (Gemini treats ${word} as template variables)
 * - <sub> tags: stripped and converted to italic *(text)*
 * - Agent name: normalized to lowercase slug without accents
 *
 * @module lib/converters/gemini
 */
import { extractFrontmatterAndBody, applyPathReplacements, stripSubTags, escapeTemplateVariables, normalizeAgentName, } from '../conversion-utils.js';
/**
 * Tool name mapping from Claude Code to Gemini CLI
 * Gemini CLI uses snake_case built-in tool names
 */
const CLAUDE_TO_GEMINI_TOOLS = {
    Read: 'read_file',
    Write: 'write_file',
    Edit: 'replace',
    Bash: 'run_shell_command',
    Glob: 'glob',
    Grep: 'search_file_content',
    WebSearch: 'google_web_search',
    WebFetch: 'web_fetch',
    TodoWrite: 'write_todos',
    AskUserQuestion: 'ask_user',
};
/**
 * Convert a Claude tool name to Gemini format
 * Filters out MCP tools and Task (auto-registered in Gemini)
 */
function convertGeminiToolName(claudeTool) {
    if (claudeTool.startsWith('mcp__')) {
        return null; // MCP tools are auto-discovered
    }
    if (claudeTool === 'Task') {
        return null; // Task is auto-registered
    }
    if (CLAUDE_TO_GEMINI_TOOLS[claudeTool]) {
        return CLAUDE_TO_GEMINI_TOOLS[claudeTool];
    }
    return claudeTool.toLowerCase();
}
/**
 * Convert frontmatter for Gemini format
 */
function convertGeminiFrontmatter(content) {
    const { frontmatter, body } = extractFrontmatterAndBody(content);
    if (!frontmatter)
        return content;
    const lines = frontmatter.split('\n');
    const newLines = [];
    const tools = [];
    let inAllowedTools = false;
    let inSkills = false;
    for (const line of lines) {
        const trimmed = line.trim();
        // Skip skills section entirely (not supported by Gemini)
        if (trimmed.startsWith('skills:')) {
            inSkills = true;
            continue;
        }
        if (inSkills) {
            if (trimmed.startsWith('- ') || (trimmed && line.startsWith('  '))) {
                continue;
            }
            else if (trimmed) {
                inSkills = false;
            }
        }
        // Normalize agent name to valid slug (lowercase, no accents)
        if (trimmed.startsWith('name:')) {
            const nameValue = trimmed.substring(5).trim();
            const normalized = normalizeAgentName(nameValue.replace(/^['"]|['"]$/g, ''));
            newLines.push(`name: ${normalized}`);
            continue;
        }
        // Convert allowed-tools YAML array to tools list
        if (trimmed.startsWith('allowed-tools:')) {
            inAllowedTools = true;
            continue;
        }
        // Handle inline tools: field (comma-separated string)
        if (trimmed.startsWith('tools:')) {
            const toolsValue = trimmed.substring(6).trim();
            if (toolsValue) {
                const parsed = toolsValue
                    .split(',')
                    .map((t) => t.trim())
                    .filter((t) => t);
                for (const t of parsed) {
                    const mapped = convertGeminiToolName(t);
                    if (mapped)
                        tools.push(mapped);
                }
            }
            else {
                inAllowedTools = true;
            }
            continue;
        }
        // Strip color field (not supported by Gemini CLI)
        if (trimmed.startsWith('color:'))
            continue;
        // Collect allowed-tools/tools array items
        if (inAllowedTools) {
            if (trimmed.startsWith('- ')) {
                const mapped = convertGeminiToolName(trimmed.substring(2).trim());
                if (mapped)
                    tools.push(mapped);
                continue;
            }
            else if (trimmed && !trimmed.startsWith('-')) {
                inAllowedTools = false;
            }
        }
        if (!inAllowedTools && !inSkills) {
            newLines.push(line);
        }
    }
    // Add tools as YAML array (Gemini requires array format)
    if (tools.length > 0) {
        newLines.push('tools:');
        for (const tool of tools) {
            newLines.push(`  - ${tool}`);
        }
    }
    const newFrontmatter = newLines.join('\n').trim();
    // Escape ${VAR} patterns and strip <sub> tags
    const escapedBody = escapeTemplateVariables(body);
    const strippedBody = stripSubTags(escapedBody);
    return `---\n${newFrontmatter}\n---${strippedBody}`;
}
/**
 * Gemini Converter
 */
export const GeminiConverter = {
    name: 'gemini',
    dirName: '.gemini',
    convertAgent(content, context) {
        // Apply path replacements
        let converted = applyPathReplacements(content, this.getPathReplacements(context));
        // Convert frontmatter
        converted = convertGeminiFrontmatter(converted);
        return {
            filename: '', // Filename determined by caller
            content: converted,
        };
    },
    convertCommand(content, filename, context) {
        // Apply path replacements
        let converted = applyPathReplacements(content, this.getPathReplacements(context));
        // Convert frontmatter
        converted = convertGeminiFrontmatter(converted);
        return {
            filename: filename,
            content: converted,
        };
    },
    getToolMapping() {
        return CLAUDE_TO_GEMINI_TOOLS;
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
//# sourceMappingURL=gemini.js.map