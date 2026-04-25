/**
 * Copilot Converter — Convert FASE content to GitHub Copilot format
 *
 * Copilot-specific transformations:
 * - Tool names: snake_case (similar to Gemini)
 * - Tools in frontmatter: boolean flags (tools: read_file: true)
 * - Commands: flattened structure (fase-help.md)
 * - /fase:command → /fase-command (flat command structure)
 * - name field: removed (uses filename)
 * - color/skills: removed (not supported)
 * - subagent_type: "general-purpose" → "general"
 *
 * @module lib/converters/copilot
 */

import type {
  ProviderConverter,
  ConversionContext,
  ConvertedFile,
  PathReplacement,
} from '../provider-converter.js';
import {
  extractFrontmatterAndBody,
  applyPathReplacements,
  parseAllowedTools,
} from '../conversion-utils.js';

/**
 * Tool name mapping from Claude Code to GitHub Copilot
 * GitHub Copilot uses similar tool names to Gemini CLI
 */
const CLAUDE_TO_COPILOT_TOOLS: Record<string, string> = {
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
 * Convert a Claude tool name to Copilot format
 * Filters out MCP tools and Task (auto-registered in Copilot)
 */
function convertCopilotToolName(claudeTool: string): string | null {
  if (claudeTool.startsWith('mcp__')) {
    return null; // MCP tools are auto-discovered
  }
  if (claudeTool === 'Task') {
    return null; // Task is auto-registered
  }
  if (CLAUDE_TO_COPILOT_TOOLS[claudeTool]) {
    return CLAUDE_TO_COPILOT_TOOLS[claudeTool];
  }
  return claudeTool.toLowerCase();
}

/**
 * Apply Copilot-specific content replacements
 */
function applyCopilotContentReplacements(content: string): string {
  let converted = content;
  // Replace tool name references
  converted = converted.replace(/\bAskUserQuestion\b/g, 'ask_user');
  converted = converted.replace(/\bSlashCommand\b/g, 'skill');
  converted = converted.replace(/\bTodoWrite\b/g, 'write_todos');
  // Replace /fase:command with /fase-command for copilot (flat command structure)
  converted = converted.replace(/\/fase:/g, '/fase-');
  // Replace general-purpose subagent type with Copilot's equivalent "general"
  converted = converted.replace(/subagent_type="general-purpose"/g, 'subagent_type="general"');
  return converted;
}

/**
 * Convert frontmatter for Copilot format
 */
function convertCopilotFrontmatter(content: string): string {
  const { frontmatter, body } = extractFrontmatterAndBody(content);
  if (!frontmatter) return content;

  const lines = frontmatter.split('\n');
  const newLines: string[] = [];
  const allowedTools = parseAllowedTools(frontmatter);
  let inAllowedTools = false;
  let inSkills = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip skills section entirely (not supported by Copilot)
    if (trimmed.startsWith('skills:')) {
      inSkills = true;
      continue;
    }
    if (inSkills) {
      if (trimmed.startsWith('- ') || (trimmed && line.startsWith('  '))) {
        continue;
      } else if (trimmed) {
        inSkills = false;
      }
    }

    // Skip allowed-tools array (we'll rebuild it)
    if (trimmed.startsWith('allowed-tools:')) {
      inAllowedTools = true;
      continue;
    }
    if (trimmed.startsWith('tools:') && !trimmed.substring(6).trim()) {
      inAllowedTools = true;
      continue;
    }

    // Collect allowed-tools items
    if (inAllowedTools) {
      if (trimmed.startsWith('- ')) {
        continue; // Skip, we're rebuilding
      } else if (trimmed && !trimmed.startsWith('-')) {
        inAllowedTools = false;
      }
      continue;
    }

    // Remove name: field - copilot uses filename for command name
    if (trimmed.startsWith('name:')) {
      continue;
    }

    // Skip color: field - copilot doesn't use colors
    if (trimmed.startsWith('color:')) {
      continue;
    }

    // Skip skills: field - copilot doesn't use this
    if (trimmed.startsWith('skills:')) {
      continue;
    }

    // Keep other fields (description, agent, argument-hint, etc.)
    if (!inAllowedTools && !inSkills) {
      newLines.push(line);
    }
  }

  // Convert allowed tools to boolean flags in frontmatter
  const toolsMap: Record<string, boolean> = {};
  for (const tool of allowedTools) {
    const copilotTool = convertCopilotToolName(tool);
    if (copilotTool) {
      toolsMap[copilotTool] = true;
    }
  }

  // Build new frontmatter
  let newFrontmatter = newLines.join('\n').trim();

  // Add tools section if there are any
  if (Object.keys(toolsMap).length > 0) {
    newFrontmatter += '\ntools:';
    for (const [toolName, value] of Object.entries(toolsMap)) {
      newFrontmatter += `\n  ${toolName}: ${value}`;
    }
  }

  return `---\n${newFrontmatter}\n---${body}`;
}

/**
 * Flatten filename for Copilot command structure
 *
 * @param filename - Source filename (e.g., 'help.md', 'debug/start.md')
 * @returns Flattened filename (e.g., 'fase-help.md', 'fase-debug-start.md')
 */
function flattenFilename(filename: string): string {
  // Remove .md extension
  const base = filename.replace('.md', '');
  // Split by path separator
  const parts = base.split('/');
  // Join with dashes and add fase- prefix
  return `fase-${parts.join('-')}.md`;
}

/**
 * Copilot Converter
 */
export const CopilotConverter: ProviderConverter = {
  name: 'copilot',
  dirName: '.copilot',

  convertAgent(content: string, context: ConversionContext): ConvertedFile {
    // Apply content replacements
    let converted = applyCopilotContentReplacements(content);
    // Apply path replacements
    converted = applyPathReplacements(converted, this.getPathReplacements(context));
    // Convert frontmatter
    converted = convertCopilotFrontmatter(converted);
    return {
      filename: '', // Filename determined by caller
      content: converted,
    };
  },

  convertCommand(content: string, filename: string, context: ConversionContext): ConvertedFile {
    // Apply content replacements
    let converted = applyCopilotContentReplacements(content);
    // Apply path replacements
    converted = applyPathReplacements(converted, this.getPathReplacements(context));
    // Convert frontmatter
    converted = convertCopilotFrontmatter(converted);

    // Flatten filename
    const flatFilename = flattenFilename(filename);

    return {
      filename: flatFilename,
      content: converted,
    };
  },

  getToolMapping(): Record<string, string> {
    return CLAUDE_TO_COPILOT_TOOLS;
  },

  getPathReplacements(context: ConversionContext): PathReplacement[] {
    return [
      { from: '~/.claude/', to: context.pathPrefix },
      { from: '$HOME/.claude/', to: context.pathPrefix },
      { from: '~/.fase/', to: context.pathPrefix },
      { from: '$HOME/.fase/', to: context.pathPrefix },
    ];
  },
};
