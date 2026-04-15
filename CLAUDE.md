# FASE & Claude Code Integration

## Isolation Policy

**FASE is now 100% project-local.** All state, configuration, and data lives within the project directory.

### ✅ FASE Controls (Project-Local Only)
- **Project state**: `.fase-ai/` (in project root) — All FASE data (config, plans, todos, phases)
- **Project directory**: Everything under the working directory

### ✅ Claude Code Controls
- **User configuration**: `~/.claude/` — Claude Code settings, hooks, plugins
- **FASE hooks**: Reference the hook file from the repo path (never writes to `~/.claude/`)

### 🚫 FASE Never Touches
- `~/.claude/` (read-only for version cache)
- `~/.gsd/`
- `~/.fase/`
- `~/.fase-ai/` (global — removed in v3.4+)
- Any user configuration directories

## Architecture Notes

- **analytics.ts**: DISABLED — no tracking, no global files
- **config.ts**: Uses environment variables only (BRAVE_API_KEY)
- **init.ts**: Uses environment variables only (BRAVE_API_KEY)
- **version-check.ts**: Only reads external cache from `~/.claude/cache/` (never writes)
- **hooks directory**: External reference only — hook paths point to repo, not installed globally

## Hook Configuration

To use FASE hooks in Claude Code:

1. The hook file (`hooks/fase-context-monitor.js`) stays in the repo
2. Reference it from `~/.claude/settings.json`:
   ```json
   {
     "hooks": {
       "PostToolUse": [{
         "hooks": [{
           "type": "command",
           "command": "node /path/to/repos/FASE/hooks/fase-context-monitor.js"
         }]
       }]
     }
   }
   ```
3. Claude Code runs the hook, but FASE itself never modifies `~/.claude/`

## Development Guidelines

When adding new features:
- ✅ Store all FASE state in `.fase-ai/` (project root)
- ✅ Read from environment variables only (e.g., `BRAVE_API_KEY`)
- ✅ Never access home directory files (`~/`, `os.homedir()`)
- ✅ Keep everything project-local for portability
- 🚫 Never write to user home directories
- 🚫 Never modify Claude Code or other tool settings
- 🚫 Never use global configuration files or state
