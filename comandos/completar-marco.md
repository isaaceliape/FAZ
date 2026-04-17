---
type: prompt
name: fase:completar-marco
description: Arquiva milestone completado e prepara para próxima version
argument-hint: <version>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
Marca o milestone {{version}} como completo, arquiva em marcos/, e atualiza ROTEIRO.md e REQUISITOS.md.

Propósito: Criar registro histórico da version shipped, arquiva artefatos do milestone (roteiro + requisitos), e prepara para próximo milestone.
Output: Milestone arquivado (roteiro + requisitos), PROJETO.md evoluído, git tagged.
</objective>


<context>
**Arquivos do projeto:**
- `.fase-ai/ROTEIRO.md`
- `.fase-ai/REQUISITOS.md`
- `.fase-ai/ESTADO.md`
- `.fase-ai/PROJETO.md`

**Input do usuário:**

- Version: {{version}} (ex: "1.0", "1.1", "2.0")
  </context>

<process>

**Siga o workflow complete-milestone.md:**

0. **Cheque por audit:**

   - Procure por `.fase-ai/v{{version}}-MARCO-AUDITORIA.md`
   - Se ausente ou stale: recomenda `/fase-audit-milestone` primeiro
   - Se audit status é `gaps_found`: recomenda `/fase-plan-milestone-gaps` primeiro
   - Se audit status é `passed`: prossegue para passo 1

   ```markdown
   ## Pre-flight Check

   {Se não houver v{{version}}-MARCO-AUDITORIA.md:}
   ⚠ Nenhum audit de milestone encontrado. Rode `/fase-audit-milestone` primeiro para verificar
   cobertura de requisitos, integração cross-fase e fluxos E2E.

   {Se audit tem gaps:}
   ⚠ Audit do milestone encontrou gaps. Rode `/fase-plan-milestone-gaps` para criar
   fases que fecham os gaps, ou prossiga mesmo assim para aceitar como tech debt.

   {Se audit passou:}
   ✓ Audit do milestone passou. Prosseguindo com completion.
   ```

1. **Verifique readiness:**

   - Cheque se todas fases do milestone têm plans completados (SUMARIO.md existe)
   - Apresente escopo e stats do milestone
   - Aguarde confirmação

2. **Reúna stats:**

   - Conte fases, plans, tasks
   - Calcule git range, file changes, LOC
   - Extraia timeline do git log
   - Apresente resumo, confirme

3. **Extraia accomplishments:**

   - Leia todos arquivos fase SUMARIO.md no range do milestone
   - Extraia 4-6 key accomplishments
   - Apresente para aprovação

4. **Arquive milestone:**

   - Crie `.fase-ai/marcos/v{{version}}-ROTEIRO.md`
   - Extraia detalhes completos das fases do ROTEIRO.md
   - Preencha template milestone-archive.md
   - Atualize ROTEIRO.md para resumo one-line com link

5. **Arquive requisitos:**

   - Crie `.fase-ai/marcos/v{{version}}-REQUISITOS.md`
   - Marque todos requisitos v1 como completos (checkboxes marcados)
   - Note outcomes dos requisitos (validated, adjusted, dropped)
   - Delete `.fase-ai/REQUISITOS.md` (fresh one criado para próximo milestone)

6. **Atualize PROJETO.md:**

   - Adicione seção "Current State" com version shipped
   - Adicione seção "Next Milestone Goals"
   - Arquive conteúdo anterior em `<details>` (se v1.1+)

7. **Commit e tag:**

   - Stage: MARCOS.md, PROJETO.md, ROTEIRO.md, ESTADO.md, archive files
   - Commit: `chore: archive v{{version}} milestone`
   - Tag: `git tag -a v{{version}} -m "[milestone summary]"`
   - Pergunte sobre push da tag

8. **Ofereça próximos passos:**
   - `/fase-novo-marco` — inicia próximo milestone (questioning → pesquisa → requisitos → roteiro)

</process>

<success_criteria>

- Milestone arquivado em `.fase-ai/marcos/v{{version}}-ROTEIRO.md`
- Requirements arquivados em `.fase-ai/marcos/v{{version}}-REQUISITOS.md`
- `.fase-ai/REQUISITOS.md` deletado (fresh para próximo milestone)
- ROTEIRO.md colapsado para entrada one-line
- PROJETO.md atualizado com current state
- Git tag v{{version}} criada
- Commit successful
- Usuário sabe próximos passos (incluindo necessidade de fresh requisitos)
  </success_criteria>

<critical_rules>

- **Carregue workflow primeiro:** Leia complete-milestone.md antes de executar
- **Verifique completion:** Todas fases devem ter arquivos SUMARIO.md
- **Confirmação do usuário:** Aguarde aprovação nas verification gates
- **Arquive antes de deletar:** Sempre crie arquivos archive antes de atualizar/deletar originais
- **Resumo one-line:** Milestone colapsado no ROTEIRO.md deve ser single line com link
- **Eficiência de context:** Archive mantém ROTEIRO.md e REQUISITOS.md com tamanho constante por milestone
- **Fresh requisitos:** Próximo milestone começa com `/fase-novo-marco` que inclui definição de requisitos
  </critical_rules>
