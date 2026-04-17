---
name: fase:contexto
description: Exibe, limpa ou resume o contexto da última sessão de trabalho armazenado em .fase-ai/CONTEXTO.md
argument-hint: [--limpar | --resumo]
allowed-tools:
  - Read
  - Bash
  - Write
---

<objective>
Gerencie o contexto persistente de sessão do FASE armazenado em `.fase-ai/CONTEXTO.md`.

Sem argumentos: exibe o contexto atual.
Com `--limpar`: apaga o contexto para iniciar sessão zerada.
Com `--resumo`: lê o contexto e gera um parágrafo de resumo em português para o usuário.
</objective>

<process>
1. Parse o argumento do prompt (`--limpar`, `--resumo`, ou nenhum).

2. **Sem argumento — exibir contexto:**
```bash
if [ -f .fase-ai/CONTEXTO.md ]; then
  cat .fase-ai/CONTEXTO.md
else
  echo "Nenhum contexto de sessão encontrado. Execute /fase-executar-etapa para iniciar."
fi
```

3. **Com `--limpar` — apagar contexto:**
```bash
rm -f .fase-ai/CONTEXTO.md
echo "Contexto de sessão removido. A próxima sessão começará do zero."
```

4. **Com `--resumo` — gerar resumo legível:**
Leia `.fase-ai/CONTEXTO.md` e produza um parágrafo resumindo:
- O que foi feito na última sessão
- Qualquer decisão técnica importante
- O próximo passo recomendado
- Bloqueadores em aberto (se houver)

Escreva em português, em linguagem natural, como se fosse um briefing rápido para retomar o trabalho.
</process>
