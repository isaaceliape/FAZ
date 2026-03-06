---
type: prompt
name: faz:complete-milestone
description: Arquiva milestone completado e prepara para próxima version
argument-hint: <version>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
Marca o milestone {{version}} como completo, arquiva em milestones/, e atualiza ROADMAP.md e REQUIREMENTS.md.

Propósito: Criar registro histórico da version shipped, arquiva artefatos do milestone (roadmap + requirements), e prepara para próximo milestone.
Output: Milestone arquivado (roadmap + requirements), PROJECT.md evoluído, git tagged.
</objective>

<execution_context>
**Carregue estes arquivos AGORA (antes de prosseguir):**

- @~/.faz/workflows/complete-milestone.md (workflow principal)
- @~/.faz/templates/milestone-archive.md (template de archive)
  </execution_context>

<context>
**Arquivos do projeto:**
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/PROJECT.md`

**Input do usuário:**

- Version: {{version}} (ex: "1.0", "1.1", "2.0")
  </context>

<process>

**Siga o workflow complete-milestone.md:**

0. **Cheque por audit:**

   - Procure por `.planning/v{{version}}-MILESTONE-AUDIT.md`
   - Se ausente ou stale: recomenda `/faz:audit-milestone` primeiro
   - Se audit status é `gaps_found`: recomenda `/faz:plan-milestone-gaps` primeiro
   - Se audit status é `passed`: prossegue para passo 1

   ```markdown
   ## Pre-flight Check

   {Se não houver v{{version}}-MILESTONE-AUDIT.md:}
   ⚠ Nenhum audit de milestone encontrado. Rode `/faz:audit-milestone` primeiro para verificar
   cobertura de requirements, integração cross-phase e fluxos E2E.

   {Se audit tem gaps:}
   ⚠ Audit do milestone encontrou gaps. Rode `/faz:plan-milestone-gaps` para criar
   phases que fecham os gaps, ou prossiga mesmo assim para aceitar como tech debt.

   {Se audit passou:}
   ✓ Audit do milestone passou. Prosseguindo com completion.
   ```

1. **Verifique readiness:**

   - Cheque se todas phases do milestone têm plans completados (SUMMARY.md existe)
   - Apresente escopo e stats do milestone
   - Aguarde confirmação

2. **Reúna stats:**

   - Conte phases, plans, tasks
   - Calcule git range, file changes, LOC
   - Extraia timeline do git log
   - Apresente resumo, confirme

3. **Extraia accomplishments:**

   - Leia todos arquivos phase SUMMARY.md no range do milestone
   - Extraia 4-6 key accomplishments
   - Apresente para aprovação

4. **Arquive milestone:**

   - Crie `.planning/milestones/v{{version}}-ROADMAP.md`
   - Extraia detalhes completos das phases do ROADMAP.md
   - Preencha template milestone-archive.md
   - Atualize ROADMAP.md para resumo one-line com link

5. **Arquive requirements:**

   - Crie `.planning/milestones/v{{version}}-REQUIREMENTS.md`
   - Marque todos requirements v1 como completos (checkboxes marcados)
   - Note outcomes dos requirements (validated, adjusted, dropped)
   - Delete `.planning/REQUIREMENTS.md` (fresh one criado para próximo milestone)

6. **Atualize PROJECT.md:**

   - Adicione seção "Current State" com version shipped
   - Adicione seção "Next Milestone Goals"
   - Arquive conteúdo anterior em `<details>` (se v1.1+)

7. **Commit e tag:**

   - Stage: MILESTONES.md, PROJECT.md, ROADMAP.md, STATE.md, archive files
   - Commit: `chore: archive v{{version}} milestone`
   - Tag: `git tag -a v{{version}} -m "[milestone summary]"`
   - Pergunte sobre push da tag

8. **Ofereça próximos passos:**
   - `/faz:new-milestone` — inicia próximo milestone (questioning → research → requirements → roadmap)

</process>

<success_criteria>

- Milestone arquivado em `.planning/milestones/v{{version}}-ROADMAP.md`
- Requirements arquivados em `.planning/milestones/v{{version}}-REQUIREMENTS.md`
- `.planning/REQUIREMENTS.md` deletado (fresh para próximo milestone)
- ROADMAP.md colapsado para entrada one-line
- PROJECT.md atualizado com current state
- Git tag v{{version}} criada
- Commit successful
- Usuário sabe próximos passos (incluindo necessidade de fresh requirements)
  </success_criteria>

<critical_rules>

- **Carregue workflow primeiro:** Leia complete-milestone.md antes de executar
- **Verifique completion:** Todas phases devem ter arquivos SUMMARY.md
- **Confirmação do usuário:** Aguarde aprovação nas verification gates
- **Arquive antes de deletar:** Sempre crie arquivos archive antes de atualizar/deletar originais
- **Resumo one-line:** Milestone colapsado no ROADMAP.md deve ser single line com link
- **Eficiência de context:** Archive mantém ROADMAP.md e REQUIREMENTS.md com tamanho constante por milestone
- **Fresh requirements:** Próximo milestone começa com `/faz:new-milestone` que inclui definição de requirements
  </critical_rules>
