# Command Path Standardization

> **Version**: 3.2.0 | Last Updated: 2026-03-25

## Overview

FASE commands use environment-agnostic path references that are converted to runtime-specific paths during installation. This allows the same command definitions to work across multiple environments (Claude Code, OpenCode, Gemini, Codex).

## Path Convention

### Source Files (`comandos/*.md`)

Source command files use universal path references:
- **Workflows**: `@~/.fase/workflows/workflow-name.md`
- **Templates**: `@~/.fase/templates/template-name.md`
- **References**: `@~/.fase/references/reference-name.md`
- **Runtime tools**: `$HOME/.fase/bin/fase-tools.cjs`

These paths are **environment-agnostic** and used in:
1. `<execution_context>` blocks (for Claude Code context loading)
2. Inline references within `<process>` sections
3. Bash code blocks for script execution

### Path Conversion During Installation

When FASE is installed via `npx fase-ai [--runtime]`, the installer (`bin/install.js`) converts these universal paths to runtime-specific locations:

| Runtime | Converted Path |
|---------|---|
| **Claude Code** | `~/.claude/fase/` |
| **Gemini** | `~/.gemini/fase/` |
| **OpenCode** | `~/.config/opencode/fase/` |
| **Codex** | `~/.codex/fase/` |

#### Example Conversions

**For Gemini Installation:**
```
Source:     @~/.fase/workflows/plan-phase.md
Installed:  @~/.gemini/fase/workflows/plan-phase.md
```

**For OpenCode Installation:**
```
Source:     $HOME/.fase/bin/fase-tools.cjs
Installed:  $HOME/.config/opencode/fase/bin/fase-tools.cjs
```

**For Claude Code Installation:**
```
Source:     ~/.fase/workflows/add-phase.md
Installed:  ~/.claude/fase/workflows/add-phase.md
```

## Implementation Details

### Installer Path Replacement Rules

The installer applies path replacements in three functions:

1. **`copyFlattenedCommands`** - for OpenCode (flat command structure)
2. **`copyCommandsAsCodexSkills`** - for Codex (skill structure)
3. **`copyWithPathReplacement`** - for Claude Code and Gemini

Replacement patterns:
- `~/\.fase/` → `<pathPrefix>fase/` (e.g., `~/.claude/fase/`)
- `$HOME/.fase/` → `<homePrefix>fase/` (e.g., `$HOME/.claude/fase/`)

For OpenCode specifically:
- `~/.fase` → `~/.config/opencode/fase`
- `$HOME/.fase` → `$HOME/.config/opencode/fase`

### Distributed Files (`bin/comandos/*.md`)

The `bin/` directory contains pre-built command files distributed via NPM. These files:
- Have `<execution_context>` blocks **removed** (not needed after installation)
- Have inline `~/.fase/` references **preserved** for installer to replace
- Contain fully translated Portuguese text
- Are installed to runtime-specific locations by the installer

## Workflow/Template Files

The actual workflow, template, and reference files are provided by:
1. **GSD (upstream project)** - provides the core workflow files
2. **FASE** - provides Portuguese-localized versions

These files are installed to the converted path location (e.g., `~/.claude/fase/workflows/`, `~/.gemini/fase/workflows/`).

## Development Usage

When developing locally with FASE command source files (`comandos/*.md`), you need workflow files available at `~/.fase/` for Claude Code to load via `<execution_context>` blocks. Options:

1. **Symlink to GSD installation:**
   ```bash
   ln -s ~/.claude/fase ~/.fase
   ```

2. **Point to development workflows:**
   If working on GSD workflows locally, adjust the symlink to point to your local GSD `workflows/` directory

3. **Install GSD first:**
   Ensure GSD is installed in your runtime environment before developing FASE commands

## Consistency Across Environments

All 32 FASE commands now follow the same path convention:
- ✅ 13 commands with workflow references use `@~/.fase/`
- ✅ 19 commands with no external references (self-contained)
- ✅ Installer properly converts paths for each runtime
- ✅ OpenCode receives correctly formatted `~/.config/opencode/fase/` paths

This ensures command compatibility across Claude Code, OpenCode, Gemini, and Codex without environment-specific branching in command logic.
