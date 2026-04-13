#!/usr/bin/env node
/**
 * FASE Statusline Hook — Exibe: modelo | tarefa atual | diretório | uso do contexto
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Constantes de timeout e limites
const DEFAULT_STDIN_TIMEOUT_MS = 5000; // Default timeout para leitura de stdin
const PROGRESS_BAR_SEGMENTS = 10; // Número de segmentos na barra de progresso
const AUTO_COMPACT_BUFFER_PCT = 16.5; // Percentual de buffer para compactação automática
const COLOR_YELLOW_THRESHOLD = 50; // Limiar de uso para cor amarela
const COLOR_ORANGE_THRESHOLD = 65; // Limiar de uso para cor laranja
const COLOR_RED_THRESHOLD = 80; // Limiar de uso para cor vermelha (crítico)

// Lê JSON do stdin
let input = '';
// Guarda de timeout: se stdin não fechar em tempo limite (default: 5s),
// sai silenciosamente em vez de travar. Configurável via FASE_STATUSLINE_TIMEOUT
const STATUSLINE_TIMEOUT = parseInt(process.env.FASE_STATUSLINE_TIMEOUT || String(DEFAULT_STDIN_TIMEOUT_MS), 10);
const stdinTimeout = setTimeout(() => {
  process.stderr.write(`[fase-statusline] Timeout após ${STATUSLINE_TIMEOUT}ms\n`);
  process.exit(0);
}, STATUSLINE_TIMEOUT);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const model = data.model?.display_name || 'Claude';
    const dir = data.workspace?.current_dir || process.cwd();
    const session = data.session_id || '';
    const remaining = data.context_window?.remaining_percentage;

    // Exibição da janela de contexto
    let ctx = '';
    if (remaining != null) {
      const usableRemaining = Math.max(0, ((remaining - AUTO_COMPACT_BUFFER_PCT) / (100 - AUTO_COMPACT_BUFFER_PCT)) * 100);
      const used = Math.max(0, Math.min(100, Math.round(100 - usableRemaining)));

      // Escreve métricas de contexto no arquivo bridge
      if (session) {
        try {
          const bridgePath = path.join(os.tmpdir(), `claude-ctx-${session}.json`);
          const bridgeData = JSON.stringify({
            session_id: session,
            remaining_percentage: remaining,
            used_pct: used,
            timestamp: Math.floor(Date.now() / 1000)
          });
          fs.writeFileSync(bridgePath, bridgeData);
        } catch {
          // Falha silenciosa
        }
      }

      // Constrói barra de progresso com segmentos definidos
      const filled = Math.floor(used / (100 / PROGRESS_BAR_SEGMENTS));
      const bar = '█'.repeat(filled) + '░'.repeat(PROGRESS_BAR_SEGMENTS - filled);

      // Cor baseada nos limites configurados
      if (used < COLOR_YELLOW_THRESHOLD) {
        ctx = ` \x1b[32m${bar} ${used}%\x1b[0m`;
      } else if (used < COLOR_ORANGE_THRESHOLD) {
        ctx = ` \x1b[33m${bar} ${used}%\x1b[0m`;
      } else if (used < COLOR_RED_THRESHOLD) {
        ctx = ` \x1b[38;5;208m${bar} ${used}%\x1b[0m`;
      } else {
        ctx = ` \x1b[5;31m💀 ${bar} ${used}%\x1b[0m`;
      }
    }

    // Tarefa atual a partir dos todos
    let task = '';
    const homeDir = os.homedir();
    const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(homeDir, '.claude');
    const todosDir = path.join(claudeDir, 'todos');
    if (session && fs.existsSync(todosDir)) {
      try {
        const files = fs.readdirSync(todosDir)
          .filter(f => f.startsWith(session) && f.includes('-agent-') && f.endsWith('.json'))
          .map(f => ({ name: f, mtime: fs.statSync(path.join(todosDir, f)).mtime }))
          .sort((a, b) => b.mtime - a.mtime);

        if (files.length > 0) {
          try {
            const todos = JSON.parse(fs.readFileSync(path.join(todosDir, files[0].name), 'utf8'));
            const inProgress = todos.find(t => t.status === 'in_progress');
            if (inProgress) task = inProgress.activeForm || '';
          } catch {}
        }
      } catch {
        // Falha silenciosa
      }
    }

    // Atualização do FASE disponível?
    let faseUpdate = '';
    const cacheFile = path.join(claudeDir, 'cache', 'fase-update-check.json');
    if (fs.existsSync(cacheFile)) {
      try {
        const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        if (cache.update_available) {
          faseUpdate = '\x1b[33m⬆ /fase:atualizar\x1b[0m │ ';
        }
      } catch {}
    }

    // Saída
    const dirname = path.basename(dir);
    if (task) {
      process.stdout.write(`${faseUpdate}\x1b[2m${model}\x1b[0m │ \x1b[1m${task}\x1b[0m │ \x1b[2m${dirname}\x1b[0m${ctx}`);
    } else {
      process.stdout.write(`${faseUpdate}\x1b[2m${model}\x1b[0m │ \x1b[2m${dirname}\x1b[0m${ctx}`);
    }
  } catch {
    // Falha silenciosa
  }
});
