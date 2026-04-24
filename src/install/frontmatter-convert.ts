/**
 * Frontmatter Conversion — Convert agent frontmatter between provider formats
 *
 * Handles conversion of Claude Code agent format to OpenCode, Gemini, and Codex formats.
 * Includes tool name mapping, color conversion, and format-specific transformations.
 *
 * @module install/frontmatter-convert
 */

/**
 * Color name to hex mapping for opencode compatibility
 */
export const colorNameToHex: Record<string, string> = {
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
 * Tool name mapping from Claude Code to OpenCode
 * OpenCode uses lowercase tool names; special mappings for renamed tools
 */
export const claudeToOpencodeTools: Record<string, string> = {
  AskUserQuestion: 'question',
  SlashCommand: 'skill',
  TodoWrite: 'todowrite',
  WebFetch: 'webfetch',
  WebSearch: 'websearch',
};

/**
 * Tool name mapping from Claude Code to Gemini CLI
 * Gemini CLI uses snake_case built-in tool names
 */
export const claudeToGeminiTools: Record<string, string> = {
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
 * Tool name mapping from Claude Code to GitHub Copilot
 * GitHub Copilot uses similar tool names to Gemini CLI
 */
export const claudeToCopilotTools: Record<string, string> = {
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
 * Convert a Claude Code tool name to OpenCode format
 *
 * @param claudeTool - Claude Code tool name
 * @returns OpenCode tool name
 */
export function convertToolName(claudeTool: string): string {
  if (claudeToOpencodeTools[claudeTool]) {
    return claudeToOpencodeTools[claudeTool];
  }
  if (claudeTool.startsWith('mcp__')) {
    return claudeTool;
  }
  return claudeTool.toLowerCase();
}

/**
 * Convert a Claude Code tool name to Gemini CLI format
 * Filters out MCP tools and Task (auto-registered in Gemini)
 *
 * @param claudeTool - Claude Code tool name
 * @returns Gemini tool name or null if should be excluded
 */
export function convertGeminiToolName(claudeTool: string): string | null {
  if (claudeTool.startsWith('mcp__')) {
    return null;
  }
  if (claudeTool === 'Task') {
    return null;
  }
  if (claudeToGeminiTools[claudeTool]) {
    return claudeToGeminiTools[claudeTool];
  }
  return claudeTool.toLowerCase();
}

/**
 * Convert a Claude Code tool name to GitHub Copilot format
 * Filters out MCP tools and Task (auto-registered in Copilot)
 *
 * @param claudeTool - Claude Code tool name
 * @returns Copilot tool name or null if should be excluded
 */
export function convertCopilotToolName(claudeTool: string): string | null {
  if (claudeTool.startsWith('mcp__')) {
    return null;
  }
  if (claudeTool === 'Task') {
    return null;
  }
  if (claudeToCopilotTools[claudeTool]) {
    return claudeToCopilotTools[claudeTool];
  }
  return claudeTool.toLowerCase();
}

/**
 * Extract frontmatter and body from markdown content
 *
 * @param content - Markdown file content
 * @returns Object with frontmatter string and body
 */
export function extractFrontmatterAndBody(content: string): {
  frontmatter: string | null;
  body: string;
} {
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
 * Extract a specific field from frontmatter
 *
 * @param frontmatter - Frontmatter string
 * @param fieldName - Field name to extract
 * @returns Field value or null
 */
export function extractFrontmatterField(frontmatter: string, fieldName: string): string | null {
  const regex = new RegExp(`^${fieldName}:\\s*(.+)$`, 'm');
  const match = frontmatter.match(regex);
  if (!match) return null;
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

/**
 * Convert string to single line (replace whitespace with single space)
 */
export function toSingleLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Quote a value for YAML
 */
export function yamlQuote(value: string): string {
  return JSON.stringify(value);
}

/**
 * Convert slash commands to Codex skill mentions
 *
 * @param content - Content with slash commands
 * @returns Content with skill mentions
 */
export function convertSlashCommandsToCodexSkillMentions(content: string): string {
  let converted = content.replace(/\/fase-([a-z0-9-]+)/gi, (_, commandName) => {
    return `$fase-${String(commandName).toLowerCase()}`;
  });
  converted = converted.replace(/\/fase-help\b/g, '$fase-help');
  return converted;
}

/**
 * Convert Claude agent content to Codex format
 *
 * @param content - Claude agent content
 * @returns Codex agent content
 */
export function convertClaudeToCodexMarkdown(content: string): string {
  let converted = convertSlashCommandsToCodexSkillMentions(content);
  converted = converted.replace(/\$ARGUMENTS\b/g, '{{FASE_ARGS}}');
  return converted;
}

/**
 * Get Codex skill adapter header
 *
 * @param skillName - Name of the skill
 * @returns Skill adapter header markdown
 */
export function getCodexSkillAdapterHeader(skillName: string): string {
  const invocation = `$${skillName}`;
  return `<codex_skill_adapter>
## A. Skill Invocation
- This skill is invoked by mentioning \`${invocation}\`.
- Treat all user text after \`${invocation}\` as \`{{FASE_ARGS}}\`.
</codex_skill_adapter>
`;
}

/**
 * Convert Claude Code agent content to Qwen Code command format
 * Qwen Commands use markdown files with optional YAML frontmatter
 * - Only 'description' is supported in frontmatter
 * - tools, color, skills are stripped (not supported)
 * - Command name comes from filename, not frontmatter
 *
 * @param content - Claude agent content
 * @returns Qwen command content
 */
export function convertClaudeToQwenCommand(content: string): string {
  // Replace tool name references in content
  let convertedContent = content;
  // Replace ~/.claude and $HOME/.claude with Qwen's config location
  convertedContent = convertedContent.replace(/~\/\.claude\b/g, '~/.qwen');
  convertedContent = convertedContent.replace(/\$HOME\/\.claude\b/g, '$HOME/.qwen');
  // Replace ~/.fase and $HOME/.fase with Qwen's config location
  convertedContent = convertedContent.replace(/~\/\.fase\b/g, '~/.qwen');
  convertedContent = convertedContent.replace(/\$HOME\/\.fase\b/g, '$HOME/.qwen');

  // Check if content has frontmatter
  if (!convertedContent.startsWith('---')) {
    return convertedContent;
  }

  // Find the end of frontmatter
  const endIndex = convertedContent.indexOf('---', 3);
  if (endIndex === -1) {
    return convertedContent;
  }

  const frontmatter = convertedContent.substring(3, endIndex).trim();
  const body = convertedContent.substring(endIndex + 3);

  // Parse frontmatter line by line and extract only description
  const lines = frontmatter.split('\n');
  let description: string | null = null;

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
  const newFrontmatter = description ? `---\ndescription: ${JSON.stringify(description)}\n---` : '';

  return newFrontmatter ? `${newFrontmatter}\n${body}` : body;
}

/**
 * Convert Claude Code agent content to GitHub Copilot command format
 * Copilot commands use:
 * - snake_case tool names (read_file, write_file, bash, etc.)
 * - lowercase field names (description, agent, tools)
 * - tools as boolean flags instead of allowed-tools array
 *
 * @param content - Claude agent content
 * @returns Copilot command content
 */
export function convertClaudeToCopilotCommand(content: string): string {
  // Replace tool name references in content
  let convertedContent = content;
  convertedContent = convertedContent.replace(/\bAskUserQuestion\b/g, 'ask_user');
  convertedContent = convertedContent.replace(/\bSlashCommand\b/g, 'skill');
  convertedContent = convertedContent.replace(/\bTodoWrite\b/g, 'write_todos');
  // Replace /fase:command with /fase-command for copilot (flat command structure)
  convertedContent = convertedContent.replace(/\/fase:/g, '/fase-');
  // Replace ~/.claude and $HOME/.claude with Copilot's config location
  convertedContent = convertedContent.replace(/~\/\.claude\b/g, '~/.copilot');
  convertedContent = convertedContent.replace(/\$HOME\/\.claude\b/g, '$HOME/.copilot');
  // Replace ~/.fase and $HOME/.fase with Copilot's config location
  convertedContent = convertedContent.replace(/~\/\.fase\b/g, '~/.copilot');
  convertedContent = convertedContent.replace(/\$HOME\/\.fase\b/g, '$HOME/.copilot');
  // Replace general-purpose subagent type with Copilot's equivalent "general"
  convertedContent = convertedContent.replace(
    /subagent_type="general-purpose"/g,
    'subagent_type="general"'
  );

  // Check if content has frontmatter
  if (!convertedContent.startsWith('---')) {
    return convertedContent;
  }

  // Find the end of frontmatter
  const endIndex = convertedContent.indexOf('---', 3);
  if (endIndex === -1) {
    return convertedContent;
  }

  const frontmatter = convertedContent.substring(3, endIndex).trim();
  const body = convertedContent.substring(endIndex + 3);

  // Parse frontmatter line by line
  const lines = frontmatter.split('\n');
  const newLines = [];
  let inAllowedTools = false;
  const allowedTools = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect start of allowed-tools array
    if (trimmed.startsWith('allowed-tools:')) {
      inAllowedTools = true;
      continue;
    }

    // Detect inline tools: field (comma-separated string)
    if (trimmed.startsWith('tools:')) {
      const toolsValue = trimmed.substring(6).trim();
      if (toolsValue) {
        const tools = toolsValue
          .split(',')
          .map((t: string) => t.trim())
          .filter((t: string) => t);
        allowedTools.push(...tools);
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

    // Collect allowed-tools items
    if (inAllowedTools) {
      if (trimmed.startsWith('- ')) {
        allowedTools.push(trimmed.substring(2).trim());
        continue;
      } else if (trimmed && !trimmed.startsWith('-')) {
        inAllowedTools = false;
        newLines.push(line);
        continue;
      }
      // Skip tool list items
      continue;
    }

    // Keep other fields as-is (description, agent, argument-hint, etc.)
    newLines.push(line);
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
  let newFrontmatter = '---\n';
  newFrontmatter += newLines
    .map((line) => line || '')
    .join('\n')
    .trim();

  // Add tools section if there are any
  if (Object.keys(toolsMap).length > 0) {
    // Remove trailing whitespace from frontmatter
    newFrontmatter = newFrontmatter.replace(/\s+$/, '');
    newFrontmatter += '\ntools:\n';
    for (const [toolName, value] of Object.entries(toolsMap)) {
      newFrontmatter += `  ${toolName}: ${value}\n`;
    }
  }

  newFrontmatter += '---';

  return `${newFrontmatter}\n${body}`;
}
