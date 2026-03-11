#!/bin/bash

# Script para renomear commands do F.A.Z. para português brasileiro
# Usage: ./renomear-comandos.sh

cd "$(dirname "$0")/../commands/fase"

echo "🔄 Renomeando commands para PT-BR..."
echo ""

# Mapeamento: original → novo
declare -A MAPEAMENTO=(
    ["help.pt.md"]="ajuda.pt.md"
    ["new-project.pt.md"]="novo-projeto.pt.md"
    ["plan-phase.pt.md"]="planejar-fase.pt.md"
    ["execute-phase.pt.md"]="executar-fase.pt.md"
    ["settings.pt.md"]="configuracoes.pt.md"
    ["new-milestone.pt.md"]="novo-marco.pt.md"
    ["add-phase.pt.md"]="adicionar-fase.pt.md"
    ["insert-phase.pt.md"]="inserir-fase.pt.md"
    ["remove-phase.pt.md"]="remover-fase.pt.md"
    ["pause-work.pt.md"]="pausar-trabalho.pt.md"
    ["resume-work.pt.md"]="retomar-trabalho.pt.md"
    ["progress.pt.md"]="progresso.pt.md"
    ["research-phase.pt.md"]="pesquisar-fase.pt.md"
    ["map-codebase.pt.md"]="mapear-codigo.pt.md"
    ["list-phase-assumptions.pt.md"]="listar-premissas.pt.md"
    ["verify-work.pt.md"]="verificar-trabalho.pt.md"
    ["validate-phase.pt.md"]="validar-fase.pt.md"
    ["audit-milestone.pt.md"]="auditar-marco.pt.md"
    # debug.pt.md permanece igual
    ["check-todos.pt.md"]="checar-todos.pt.md"
    ["add-todo.pt.md"]="adicionar-todo.pt.md"
    ["add-tests.pt.md"]="adicionar-testes.pt.md"
    ["discuss-phase.pt.md"]="discutir-fase.pt.md"
    ["complete-milestone.pt.md"]="completar-marco.pt.md"
    ["plan-milestone-gaps.pt.md"]="planejar-lacunas.pt.md"
    ["cleanup.pt.md"]="limpar.pt.md"
    ["health.pt.md"]="saude.pt.md"
    ["update.pt.md"]="atualizar.pt.md"
    ["quick.pt.md"]="rapido.pt.md"
    ["join-discord.pt.md"]="entrar-discord.pt.md"
    ["reapply-patches.pt.md"]="reaplicar-patches.pt.md"
    ["set-profile.pt.md"]="definir-perfil.pt.md"
)

# Renomear arquivos
for original in "${!MAPEAMENTO[@]}"; do
    novo="${MAPEAMENTO[$original]}"
    if [ -f "$original" ]; then
        mv "$original" "$novo"
        echo "✅ $original → $novo"
    else
        echo "⚠️  $original não encontrado"
    fi
done

echo ""
echo "🎉 Renomeação completa!"
echo ""
echo "📋 Lista de novos comandos:"
ls -1 *.pt.md | sort
