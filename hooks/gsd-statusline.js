#!/usr/bin/env node
// Statusline do Claude Code — Edição FASE
// Exibe: modelo | tarefa atual | diretório | uso do contexto

const fs = require('fs');
const path = require('path');
const os = require('os');

// Lê JSON do stdin
let input = '';
// Guarda de timeout: se stdin não fechar em 3s (ex.: problemas de pipe no
// Windows/Git Bash), sai silenciosamente em vez de travar. Ver #775.
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
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

    // Exibição da janela de contexto (mostra porcentagem USADA escalada para o contexto utilizável)
    // O Claude Code reserva ~16,5% para o buffer de autocompact, então o contexto utilizável
    // é 83,5% da janela total. Normalizamos para mostrar 100% nesse ponto.
    const AUTO_COMPACT_BUFFER_PCT = 16.5;
    let ctx = '';
    if (remaining != null) {
      // Normaliza: subtrai o buffer do restante, escala para o intervalo utilizável
      const usableRemaining = Math.max(0, ((remaining - AUTO_COMPACT_BUFFER_PCT) / (100 - AUTO_COMPACT_BUFFER_PCT)) * 100);
      const used = Math.max(0, Math.min(100, Math.round(100 - usableRemaining)));

      // Escreve métricas de contexto no arquivo bridge para o hook PostToolUse de contexto.
      // O monitor lê este arquivo para injetar avisos ao agente quando o contexto está baixo.
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
        } catch (e) {
          // Falha silenciosa — bridge é melhor-esforço, não quebra a statusline
        }
      }

      // Constrói barra de progresso (10 segmentos)
      const filled = Math.floor(used / 10);
      const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

      // Cor baseada nos limites de contexto utilizável
      if (used < 50) {
        ctx = ` \x1b[32m${bar} ${used}%\x1b[0m`;
      } else if (used < 65) {
        ctx = ` \x1b[33m${bar} ${used}%\x1b[0m`;
      } else if (used < 80) {
        ctx = ` \x1b[38;5;208m${bar} ${used}%\x1b[0m`;
      } else {
        ctx = ` \x1b[5;31m💀 ${bar} ${used}%\x1b[0m`;
      }
    }

    // Tarefa atual a partir dos todos
    let task = '';
    const homeDir = os.homedir();
    // Respeita CLAUDE_CONFIG_DIR para configurações com diretório customizado (#870)
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
          } catch (e) {}
        }
      } catch (e) {
        // Falha silenciosa em erros de sistema de arquivos — não quebra a statusline
      }
    }

    // Atualização do FASE disponível?
    let gsdUpdate = '';
    const cacheFile = path.join(claudeDir, 'cache', 'gsd-update-check.json');
    if (fs.existsSync(cacheFile)) {
      try {
        const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        if (cache.update_available) {
          gsdUpdate = '\x1b[33m⬆ /fase:atualizar\x1b[0m │ ';
        }
      } catch (e) {}
    }

    // Saída
    const dirname = path.basename(dir);
    if (task) {
      process.stdout.write(`${gsdUpdate}\x1b[2m${model}\x1b[0m │ \x1b[1m${task}\x1b[0m │ \x1b[2m${dirname}\x1b[0m${ctx}`);
    } else {
      process.stdout.write(`${gsdUpdate}\x1b[2m${model}\x1b[0m │ \x1b[2m${dirname}\x1b[0m${ctx}`);
    }
  } catch (e) {
    // Falha silenciosa — não quebra a statusline em erros de parse
  }
});
