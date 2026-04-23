---
description: Reaplicar modificações locais após atualização do FASE
---

<purpose>
Após uma atualização do FASE que limpa e reinstala arquivos, este comando mescla modificações locais previamente salvas do usuário de volta na nova versão. Usa comparação inteligente para lidar com casos onde o arquivo upstream também mudou.
</purpose>

<process>

## Passo 1: Detectar patches salvos

Verificar se existe diretório de patches locais:

```bash
# Instalação global — detectar diretório de config em runtime
if [ -d "$HOME/.config/opencode/fase-local-patches" ]; then
  PATCHES_DIR="$HOME/.config/opencode/fase-local-patches"
elif [ -d "$HOME/.opencode/fase-local-patches" ]; then
  PATCHES_DIR="$HOME/.opencode/fase-local-patches"
elif [ -d "$HOME/.gemini/fase-local-patches" ]; then
  PATCHES_DIR="$HOME/.gemini/fase-local-patches"
else
  PATCHES_DIR="$HOME/.config/opencode/fase-local-patches"
fi
# Fallback para instalação local — verificar todos os diretórios runtime
if [ ! -d "$PATCHES_DIR" ]; then
  for dir in .config/opencode .opencode .gemini .claude; do
    if [ -d "./$dir/fase-local-patches" ]; then
      PATCHES_DIR="./$dir/fase-local-patches"
      break
    fi
  done
fi
```

Ler `backup-meta.json` do diretório de patches.

**Se nenhum patch encontrado:**
```
Nenhum patch local encontrado. Nada para reaplicar.

Patches locais são salvos automaticamente quando você executa /fase-atualizar
após modificar qualquer workflow, command ou agent files do FASE.
```
Sair.

## Passo 2: Mostrar resumo de patches

```
## Patches Locais para Reaplicar

**Backup feito da versão:** v{from_version}
**Versão atual:** {ler arquivo VERSION}
**Arquivos modificados:** {count}

| # | Arquivo | Status |
|---|------|--------|
| 1 | {file_path} | Pendente |
| 2 | {file_path} | Pendente |
```

## Passo 3: Mesclar cada arquivo

Para cada arquivo em `backup-meta.json`:

1. **Ler versão salva** (cópia modificada do usuário de `fase-local-patches/`)
2. **Ler versão recém-instalada** (arquivo atual após atualização)
3. **Comparar e mesclar:**

   - Se o novo arquivo for idêntico ao arquivo salvo: pular (modificação foi incorporada upstream)
   - Se o novo arquivo diferir: identificar modificações do usuário e aplicá-las na nova versão

   **Estratégia de merge:**
   - Ler ambas versões completamente
   - Identificar seções que o usuário adicionou ou modificou (buscar adições, não apenas diferenças de substituição de path)
   - Aplicar adições/modificações do usuário na nova versão
   - Se uma seção que o usuário modificou também foi alterada upstream: marcar como conflito, mostrar ambas versões, perguntar ao usuário qual manter

4. **Escrever resultado mesclado** no local instalado
5. **Reportar status:**
   - `Merged` — modificações do usuário aplicadas limpas
   - `Skipped` — modificação já está no upstream
   - `Conflict` — usuário escolheu resolução

## Passo 4: Atualizar manifest

Após reaplicar, regenerar o manifest do arquivo para que futuras atualizações detectem corretamente estas como modificações do usuário:

```bash
# O manifest será regenerado no próximo /fase-atualizar
# Por enquanto, apenas notar quais arquivos foram modificados
```

## Passo 5: Opção de cleanup

Perguntar ao usuário:
- "Manter backups de patch para referência?" → preservar `fase-local-patches/`
- "Limpar backups de patch?" → remover diretório `fase-local-patches/`

## Passo 6: Relatório

```
## Patches Reaplicados

| # | Arquivo | Status |
|---|------|--------|
| 1 | {file_path} | ✓ Merged |
| 2 | {file_path} | ○ Skipped (já está no upstream) |
| 3 | {file_path} | ⚠ Conflict resolved |

{count} arquivo(s) atualizados. Suas modificações locais estão ativas novamente.
```

</process>

<success_criteria>
- [ ] Todos patches salvos processados
- [ ] Modificações do usuário mescladas na nova versão
- [ ] Conflitos resolvidos com input do usuário
- [ ] Status reportado para cada arquivo
</success_criteria>
