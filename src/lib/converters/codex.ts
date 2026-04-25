/**
 * Codex Converter — Convert FASE content to Codex format
 *
 * Codex-specific transformations:
 * - Agents: Add <codex_agent_role> header block
 * - Commands: Convert to skills with SKILL.md structure
 * - Slash commands: /fase-command → $fase-command (skill mentions)
 * - $ARGUMENTS: → {{FASE_ARGS}}
 * - Per-agent .toml: Generated separately (handled by installer, not converter)
 *
 * Note: The per-agent .toml file generation is handled as a special case
 * in the installer, not in this converter interface.
 *
 * @module lib/converters/codex
 */

import type {
  ProviderConverter,
  ConversionContext,
  ConvertedFile,
  PathReplacement,
} from '../provider-converter.js';
import {
  extractFrontmatterAndBody,
  extractFrontmatterField,
  toSingleLine,
  yamlQuote,
  applyPathReplacements,
  convertSlashCommandsToSkillMentions,
} from '../conversion-utils.js';

/**
 * Convert Claude content to Codex markdown format
 */
function convertClaudeToCodexMarkdown(content: string): string {
  let converted = convertSlashCommandsToSkillMentions(content);
  converted = converted.replace(/\$ARGUMENTS\b/g, '{{FASE_ARGS}}');
  return converted;
}

/**
 * Get Codex skill adapter header for command skills
 */
function getCodexSkillAdapterHeader(skillName: string): string {
  const invocation = `$${skillName}`;
  return `<codex_skill_adapter>
## A. Skill Invocation
- This skill is invoked by mentioning \`${invocation}\`.
- Treat all user text after \`${invocation}\` as \`{{FASE_ARGS}}\`.
</codex_skill_adapter>
`;
}

/**
 * Convert frontmatter for Codex agent format
 */
function convertCodexAgentFrontmatter(content: string): string {
  const converted = convertClaudeToCodexMarkdown(content);
  const { frontmatter, body } = extractFrontmatterAndBody(converted);
  if (!frontmatter) return converted;

  const name = extractFrontmatterField(frontmatter, 'name') || 'unknown';
  const description = extractFrontmatterField(frontmatter, 'description') || '';
  const tools = extractFrontmatterField(frontmatter, 'tools') || '';

  const roleHeader = `<codex_agent_role>
role: ${name}
tools: ${tools}
purpose: ${toSingleLine(description)}
</codex_agent_role>`;

  const cleanFrontmatter = `---\nname: ${yamlQuote(name)}\ndescription: ${yamlQuote(toSingleLine(description))}\n---`;

  return `${cleanFrontmatter}\n\n${roleHeader}\n${body}`;
}

/**
 * Convert command to Codex skill format
 */
function convertCodexCommandSkill(content: string, skillName: string): string {
  const converted = convertClaudeToCodexMarkdown(content);
  const { frontmatter, body } = extractFrontmatterAndBody(converted);

  let description = `Run FASE workflow ${skillName}.`;
  if (frontmatter) {
    const maybeDescription = extractFrontmatterField(frontmatter, 'description');
    if (maybeDescription) {
      description = maybeDescription;
    }
  }
  description = toSingleLine(description);
  const shortDescription =
    description.length > 180 ? `${description.slice(0, 177)}...` : description;

  const adapter = getCodexSkillAdapterHeader(skillName);

  return `---\nname: ${yamlQuote(skillName)}\ndescription: ${yamlQuote(description)}\nmetadata:\n  short-description: ${yamlQuote(shortDescription)}\n---\n\n${adapter}\n\n${body.trimStart()}`;
}

/**
 * Flatten filename for Codex skill structure
 *
 * @param filename - Source filename (e.g., 'help.md', 'debug/start.md')
 * @returns Skill directory name (e.g., 'fase-help', 'fase-debug-start')
 */
function flattenToSkillName(filename: string): string {
  // Remove .md extension
  const base = filename.replace('.md', '');
  // Split by path separator
  const parts = base.split('/');
  // Join with dashes and add fase- prefix
  return `fase-${parts.join('-')}`;
}

/**
 * Codex Converter
 */
export const CodexConverter: ProviderConverter = {
  name: 'codex',
  dirName: '.codex',

  convertAgent(content: string, context: ConversionContext): ConvertedFile {
    // Apply path replacements
    let converted = applyPathReplacements(content, this.getPathReplacements(context));
    // Convert to Codex agent format
    converted = convertCodexAgentFrontmatter(converted);
    return {
      filename: '', // Filename determined by caller
      content: converted,
    };
  },

  convertCommand(content: string, filename: string, context: ConversionContext): ConvertedFile {
    // Apply path replacements
    let converted = applyPathReplacements(content, this.getPathReplacements(context));

    // Convert to skill name
    const skillName = flattenToSkillName(filename);

    // Convert to Codex skill format
    converted = convertCodexCommandSkill(converted, skillName);

    // Return with skill directory name (installer will create SKILL.md inside)
    return {
      filename: skillName, // Directory name, not .md file
      content: converted,
    };
  },

  getToolMapping(): Record<string, string> {
    // Codex uses same tool names as Claude
    return {};
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
