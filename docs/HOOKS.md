# Hooks do FASE - Monitoramento e Status

> **Versão**: 4.0.0 ✅ | Última atualização: 2026-04-20

O FASE utiliza hooks para monitoramento de contexto, statusline e verificação de atualizações.

## 🔐 Segurança e Limites

### Timeout de Input

- **Timeout**: 10 segundos (configurável)
- **Variável de Ambiente**: `FASE_STATUSLINE_TIMEOUT` (em milissegundos)
- **Padrão**: `10000` (10 segundos)
- **Motivo**: Prevenir deadlocks em sistemas lentos ou com problemas de pipe
- **Comportamento**: Hook sai com log `[fase-*] stdin timeout, exiting`

**Exemplo de uso:**
```bash
# Aumentar timeout para 30 segundos em sistemas lentos
export FASE_STATUSLINE_TIMEOUT=30000
```

### Limite de Tamanho de Input

- **Limite**: 10MB
- **Motivo**: Prevenir problemas de memória com inputs grandes
- **Comportamento**: Hook truncar input e log `[fase-*] Input size exceeds 10MB limit, truncating`

## 📊 Hooks Disponíveis

### fase-context-monitor

Monitora uso do contexto e exibe avisos quando está baixo.

**Gatilho**: `PostToolUse` / `AfterTool`

**Saída**: Adiciona contexto adicional com avisos de uso do contexto

### fase-statusline

Exibe modelo, tarefa atual, diretório e uso do contexto na statusline.

**Gatilho**: `SessionStart`

**Formato**: `modelo | tarefa | diretório | contexto%`

### fase-check-update

Verifica silenciosamente por atualizações no npm registry.

**Gatilho**: `SessionStart`

**Cache**: 5 minutos em `~/.claude/cache/fase-update-check.json`

## 🚀 Configuração

Os hooks são configurados automaticamente durante a instalação do FASE. Para personalizar:

### Claude Code

Edite `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [{
      "type": "command",
      "command": "node /caminho/para/FASE/hooks/fase-statusline.cjs"
    }],
    "PostToolUse": [{
      "type": "command",
      "command": "node /caminho/para/FASE/hooks/fase-context-monitor.cjs"
    }]
  }
}
```

### OpenCode

Edite `~/.config/opencode/opencode.json`:

```json
{
  "hooks": {
    "SessionStart": ["node /caminho/para/FASE/hooks/fase-statusline.cjs"],
    "AfterTool": ["node /caminho/para/FASE/hooks/fase-context-monitor.cjs"]
  }
}
```

## 🆘 Troubleshooting

### Hook não aparece na saída

Verifique se o caminho está correto no settings.json e se o arquivo tem permissão de execução:

```bash
chmod +x ~/.fase-ai/hooks/*.cjs
```

### Timeout frequente

Se hooks estão expirando frequentemente em sistemas lentos:
- Verifique se há processos consumindo CPU
- Considere aumentar o timeout (editar arquivo do hook)
- O timeout de 10s é suficiente para a maioria dos casos

### Logs de erro

Hooks logam erros para stderr. Para debug:

```bash
# Executar hook manualmente
node ~/.fase-ai/hooks/fase-context-monitor.cjs < input.json
```

## 📚 Referência

- [Claude Code Hooks](https://docs.anthropic.com/claude-code/hooks)
- [OpenCode Hooks](https://docs.opencode.ai/hooks)
