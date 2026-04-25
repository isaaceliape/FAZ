/**
 * OpenCode Converter — Convert FASE content to OpenCode format
 *
 * OpenCode-specific transformations:
 * - Tool names: lowercase, special mappings (AskUserQuestion → question)
 * - Colors: convert names to hex values
 * - Commands: flattened structure (fase-help.md, not help.md)
 * - Tools in frontmatter: object format with boolean values
 *
 * @module lib/converters/opencode
 */

import type {
  ProviderConverter,
  ConversionContext,
  ConvertedFile,
  PathReplacement,
} from '../provider-converter.js';
import {
  extractFrontmatterAndBody,
  colorNameToHex,
  applyPathReplacements,
  parseAllowedTools,
} from '../conversion-utils.js';

/**
 * Tool name mapping from Claude Code to OpenCode
 * OpenCode uses lowercase tool names; special mappings for renamed tools
 */
const CLAUDE_TO_OPENCODE_TOOLS: Record<string, string> = {
  AskUserQuestion: 'question',
  SlashCommand: 'skill',
  TodoWrite: 'todowrite',
  WebFetch: 'webfetch',
  WebSearch: 'websearch',
};

/**
 * Convert a Claude tool name to OpenCode format
 */
function convertToolName(claudeTool: string): string {
  if (CLAUDE_TO_OPENCODE_TOOLS[claudeTool]) {
    return CLAUDE_TO_OPENCODE_TOOLS[claudeTool];
  }
  if (claudeTool.startsWith('mcp__')) {
    return claudeTool;
  }
  return claudeTool.toLowerCase();
}

/**
 * Apply tool name replacements to content
 */
function applyOpenCodeToolReplacements(content: string): string {
  let converted = content;
  converted = converted.replace(/\bAskUserQuestion\b/g, 'question');
  converted = converted.replace(/\bSlashCommand\b/g, 'skill');
  converted = converted.replace(/\bTodoWrite\b/g, 'todowrite');
  // Replace /fase:command with /fase-command for opencode (flat command structure)
  converted = converted.replace(/\/fase:/g, '/fase-');
  // Replace general-purpose subagent type with OpenCode's equivalent "general"
  converted = converted.replace(/subagent_type="general-purpose"/g, 'subagent_type="general"');
  return converted;
}

/**
 * Convert frontmatter for OpenCode format
 */
function convertOpenCodeFrontmatter(content: string): string {
  const { frontmatter, body } = extractFrontmatterAndBody(content);
  if (!frontmatter) return content;

  const lines = frontmatter.split('\n');
  const newLines: string[] = [];
  const allowedTools = parseAllowedTools(frontmatter);
  let inAllowedTools = false;
  let inSkills = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip skills section entirely (not supported by OpenCode)
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

    // Remove name: field - opencode uses filename for command name
    if (trimmed.startsWith('name:')) {
      continue;
    }

    // Convert color names to hex for opencode
    if (trimmed.startsWith('color:')) {
      const colorValue = trimmed.substring(6).trim().toLowerCase();
      const hexColor = colorNameToHex[colorValue];
      if (hexColor) {
        newLines.push(`color: "${hexColor}"`);
      } else if (colorValue.startsWith('#')) {
        // Validate hex color format (#RGB or #RRGGBB)
        if (/^#[0-9a-f]{3}$|^#[0-9a-f]{6}$/i.test(colorValue)) {
          newLines.push(line);
        }
        // Skip invalid hex colors
      }
      continue;
    }

    // Keep other fields
    if (!inAllowedTools && !inSkills) {
      newLines.push(line);
    }
  }

  // Add tools object if we had allowed-tools
  if (allowedTools.length > 0) {
    newLines.push('tools:');
    for (const tool of allowedTools) {
      newLines.push(`  ${convertToolName(tool)}: true`);
    }
  }

  const newFrontmatter = newLines.join('\n').trim();
  return `---\n${newFrontmatter}\n---${body}`;
}

/**
 * OpenCode Converter
 */
export const OpenCodeConverter: ProviderConverter = {
  name: 'opencode',
  dirName: '.opencode',

  convertAgent(content: string, context: ConversionContext): ConvertedFile {
    // Apply tool replacements
    let converted = applyOpenCodeToolReplacements(content);
    // Apply path replacements
    converted = applyPathReplacements(converted, this.getPathReplacements(context));
    // Convert frontmatter
    converted = convertOpenCodeFrontmatter(converted);
    return {
      filename: '', // Filename determined by caller
      content: converted,
    };
  },

  convertCommand(content: string, filename: string, context: ConversionContext): ConvertedFile {
    // Apply tool replacements
    let converted = applyOpenCodeToolReplacements(content);
    // Apply path replacements
    converted = applyPathReplacements(converted, this.getPathReplacements(context));
    // Convert frontmatter
    converted = convertOpenCodeFrontmatter(converted);

    // Flatten filename: help.md → fase-help.md, debug/start.md → fase-debug-start.md
    const flatFilename = flattenFilename(filename);

    return {
      filename: flatFilename,
      content: converted,
    };
  },

  getToolMapping(): Record<string, string> {
    return CLAUDE_TO_OPENCODE_TOOLS;
  },

  getPathReplacements(context: ConversionContext): PathReplacement[] {
    return [
      { from: '~/.claude/', to: context.pathPrefix },
      { from: '$HOME/.claude/', to: context.pathPrefix },
      { from: '~/.fase/', to: `${context.pathPrefix}fase` },
      { from: '$HOME/.fase/', to: `${context.pathPrefix}fase` },
    ];
  },
};

/**
 * Flatten filename for OpenCode command structure
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
  const flatName = parts.join('-');
  return `fase-${flatName}.md`;
}
