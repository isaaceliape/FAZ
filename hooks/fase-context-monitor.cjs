#!/usr/bin/env node
// Monitor de Contexto - hook PostToolUse/AfterTool (Gemini usa AfterTool)
// Lê métricas de contexto do arquivo bridge da statusline e injeta
// avisos quando o uso do contexto está alto. Isso torna o AGENTE consciente dos
// limites de contexto (a statusline só mostra ao usuário).
//
// Como funciona:
// 1. O hook de statusline escreve métricas em /tmp/claude-ctx-{session_id}.json
// 2. Este hook lê essas métricas após cada uso de ferramenta
// 3. Quando o contexto restante cai abaixo dos limites, injeta um aviso
//    como additionalContext, que o agente vê em sua conversa
//
// Limites:
//   AVISO    (restante <= 35%): Agente deve encerrar a tarefa atual
//   CRÍTICO  (restante <= 25%): Agente deve parar imediatamente e salvar estado
//
// Debounce: 5 usos de ferramenta entre avisos para evitar spam
// Escalada de severidade ignora o debounce (AVISO -> CRÍTICO dispara imediatamente)

const fs = require('fs');
const os = require('os');
const path = require('path');

const WARNING_THRESHOLD = 35;  // remaining_percentage <= 35%
const CRITICAL_THRESHOLD = 25; // remaining_percentage <= 25%
const STALE_SECONDS = 60;      // ignora métricas com mais de 60s
const DEBOUNCE_CALLS = 5;      // mínimo de usos de ferramenta entre avisos

let input = '';
// Guarda de timeout: se stdin não fechar em 3s (ex.: problemas de pipe no
// Windows/Git Bash), sai silenciosamente em vez de travar até o Claude Code
// matar o processo e reportar "erro de hook". Ver #775.
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
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

    // Se não há arquivo de métricas, é um subagente ou sessão nova — sai silenciosamente
    if (!fs.existsSync(metricsPath)) {
      process.exit(0);
    }

    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    const now = Math.floor(Date.now() / 1000);

    // Ignora métricas obsoletas
    if (metrics.timestamp && (now - metrics.timestamp) > STALE_SECONDS) {
      process.exit(0);
    }

    const remaining = metrics.remaining_percentage;
    const usedPct = metrics.used_pct;

    // Nenhum aviso necessário
    if (remaining > WARNING_THRESHOLD) {
      process.exit(0);
    }

    // Debounce: verifica se avisou recentemente
    const warnPath = path.join(tmpDir, `claude-ctx-${sessionId}-warned.json`);
    let warnData = { callsSinceWarn: 0, lastLevel: null };
    let firstWarn = true;

    if (fs.existsSync(warnPath)) {
      try {
        warnData = JSON.parse(fs.readFileSync(warnPath, 'utf8'));
        firstWarn = false;
      } catch (e) {
        // Arquivo corrompido, reinicia
      }
    }

    warnData.callsSinceWarn = (warnData.callsSinceWarn || 0) + 1;

    const isCritical = remaining <= CRITICAL_THRESHOLD;
    const currentLevel = isCritical ? 'critical' : 'warning';

    // Emite imediatamente no primeiro aviso, depois aplica debounce
    // Escalada de severidade (AVISO -> CRÍTICO) ignora o debounce
    const severityEscalated = currentLevel === 'critical' && warnData.lastLevel === 'warning';
    if (!firstWarn && warnData.callsSinceWarn < DEBOUNCE_CALLS && !severityEscalated) {
      // Atualiza contador e sai sem avisar
      fs.writeFileSync(warnPath, JSON.stringify(warnData));
      process.exit(0);
    }

    // Reinicia contador de debounce
    warnData.callsSinceWarn = 0;
    warnData.lastLevel = currentLevel;
    fs.writeFileSync(warnPath, JSON.stringify(warnData));

    // Detecta se o FASE está ativo (possui .fase-ai/STATE.md no diretório de trabalho)
    const cwd = data.cwd || process.cwd();
    const isGsdActive = fs.existsSync(path.join(cwd, '.fase-ai', 'STATE.md'));

    // Constrói mensagem de aviso consultiva (nunca use comandos imperativos que
    // sobrescrevam as preferências do usuário — ver #884)
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
    // Falha silenciosa — nunca bloqueia execução de ferramentas
    process.exit(0);
  }
});
