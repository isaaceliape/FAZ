#!/usr/bin/env node
/**
 * FASE Context Monitor Hook — Monitor de Contexto para PostToolUse/AfterTool
 * Injects warnings when context usage is high.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

// Constantes de limites e timeouts
const WARNING_THRESHOLD = 35; // Percentual de contexto restante para aviso
const CRITICAL_THRESHOLD = 25; // Percentual de contexto restante para crítico
const STALE_SECONDS = 60; // Tempo limite para dados de contexto (segundos)
const DEBOUNCE_CALLS = 5; // Número de chamadas antes de mostrar novo aviso
const STDIN_TIMEOUT_MS = 3000; // Timeout para leitura de stdin (milissegundos)

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), STDIN_TIMEOUT_MS);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const sessionId = data.session_id;

    if (!sessionId) {
      process.exit(0);
    }

    const tmpDir = os.tmpdir();
    const metricsPath = path.join(tmpDir, `claude-ctx-${sessionId}.json`);

    if (!fs.existsSync(metricsPath)) {
      process.exit(0);
    }

    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    const now = Math.floor(Date.now() / 1000);

    if (metrics.timestamp && (now - metrics.timestamp) > STALE_SECONDS) {
      process.exit(0);
    }

    const remaining = metrics.remaining_percentage;
    const usedPct = metrics.used_pct;

    if (remaining > WARNING_THRESHOLD) {
      process.exit(0);
    }

    const warnPath = path.join(tmpDir, `claude-ctx-${sessionId}-warned.json`);
    let warnData = { callsSinceWarn: 0, lastLevel: null };
    let firstWarn = true;

    if (fs.existsSync(warnPath)) {
      try {
        warnData = JSON.parse(fs.readFileSync(warnPath, 'utf8'));
        firstWarn = false;
      } catch (e) {
        // Arquivo corrompido, reinicia com dados padrão
        process.stderr.write(`[fase-context-monitor] Aviso de dados corrompido em ${warnPath}: ${e.message}\n`);
      }
    }

    warnData.callsSinceWarn = (warnData.callsSinceWarn || 0) + 1;

    const isCritical = remaining <= CRITICAL_THRESHOLD;
    const currentLevel = isCritical ? 'critical' : 'warning';

    const severityEscalated = currentLevel === 'critical' && warnData.lastLevel === 'warning';
    if (!firstWarn && (warnData.callsSinceWarn || 0) < DEBOUNCE_CALLS && !severityEscalated) {
      fs.writeFileSync(warnPath, JSON.stringify(warnData));
      process.exit(0);
    }

    warnData.callsSinceWarn = 0;
    warnData.lastLevel = currentLevel;
    fs.writeFileSync(warnPath, JSON.stringify(warnData));

    const cwd = data.cwd || process.cwd();
    const isGsdActive = fs.existsSync(path.join(cwd, '.fase-ai-local', 'STATE.md'));

    let message;
    if (isCritical) {
      message = isGsdActive
        ? `CONTEXTO CRÍTICO: Uso em ${usedPct}%. Restante: ${remaining}%. ` +
          'O contexto está quase esgotado. NÃO inicie trabalho complexo novo ou escreva arquivos de handoff — ' +
          'o estado do FASE já está registrado em STATE.md. Informe o usuário para que ele execute ' +
          '/fase:pausar-trabalho no próximo ponto de parada natural.'
        : `CONTEXTO CRÍTICO: Uso em ${usedPct}%. Restante: ${remaining}%. ` +
          'O contexto está quase esgotado. Informe ao usuário que o contexto está baixo e pergunte como ele ' +
          'quer prosseguir. NÃO salve estado ou escreva arquivos de handoff de forma autônoma, a menos que o usuário peça.';
    } else {
      message = isGsdActive
        ? `AVISO DE CONTEXTO: Uso em ${usedPct}%. Restante: ${remaining}%. ` +
          'O contexto está ficando limitado. Evite iniciar trabalho complexo novo. Se não estiver entre ' +
          'etapas definidas do plano, informe o usuário para que ele se prepare para pausar.'
        : `AVISO DE CONTEXTO: Uso em ${usedPct}%. Restante: ${remaining}%. ` +
          'Esteja ciente de que o contexto está ficando limitado. Evite exploração desnecessária ou ' +
          'iniciar trabalho complexo novo.';
    }

    const output = {
      hookSpecificOutput: {
        hookEventName: process.env.GEMINI_API_KEY ? "AfterTool" : "PostToolUse",
        additionalContext: message
      }
    };

    process.stdout.write(JSON.stringify(output));
  } catch (e) {
    // Erro ao processar métricas de contexto - falha silenciosa para não interferir com o hook
    process.stderr.write(`[fase-context-monitor] Erro ao processar contexto: ${e.message}\n`);
    process.exit(0);
  }
});
