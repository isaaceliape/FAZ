# Schema: PLANO.md

Schema autoritativo para arquivos PLANO.md produzidos por `fase-planejador` e consumidos por `fase-executor` e `fase-verificador-plano`.

---

## Frontmatter (YAML)

```yaml
---
phase: "01-foundation"          # OBRIGATÓRIO — identificador da fase (número-nome)
plan: "01"                      # OBRIGATÓRIO — número sequencial do plano dentro da fase
type: "execute"                 # OBRIGATÓRIO — "execute" | "tdd"
etapa: 1                        # OBRIGATÓRIO — estágio de execução (calculado a partir de depends_on)
depends_on: []                  # OBRIGATÓRIO — array de IDs de planos dos quais este depende (vazio = sem deps)
files_modified: []              # OBRIGATÓRIO — array de caminhos de arquivos que serão tocados
autonomous: true                # OBRIGATÓRIO — false se o plano contém checkpoints
requisitos: ["AUTH-01"]         # OBRIGATÓRIO — NUNCA vazio; IDs de requisito do ROTEIRO.md que este plano atende
user_setup: []                  # OPCIONAL — itens que o humano precisa configurar antes da execução
gap_closure: false              # OPCIONAL — true se este plano foi criado para fechar gaps de verificação
must_haves:
  truths:                       # OBRIGATÓRIO — comportamentos observáveis pelo usuário (não tarefas de implementação)
    - "Usuário consegue ver mensagens existentes"
    - "Usuário consegue enviar uma mensagem"
  artifacts:                    # OBRIGATÓRIO — arquivos que devem existir após execução
    - path: "src/components/Chat.tsx"
      provides: "Renderização da lista de mensagens"
      min_lines: 30             # UM dos seguintes: min_lines | exports | contains
  key_links:                    # OBRIGATÓRIO — conexões entre artefatos que devem existir
    - from: "src/components/Chat.tsx"
      to: "/api/chat"
      via: "fetch em useEffect"
      pattern: "fetch.*api/chat" # regex para verificar a conexão no código
---
```

### Regras de Validação do Frontmatter

| Campo | Regra |
|-------|-------|
| `requisitos` | Nunca vazio. Todo ID de requisito do ROTEIRO.md deve aparecer em pelo menos um plano. |
| `must_haves.truths` | Devem ser comportamentos observáveis pelo usuário, não tarefas de implementação. |
| `must_haves.artifacts` | Cada entrada DEVE ter exatamente um de: `min_lines`, `exports`, ou `contains`. |
| `must_haves.key_links` | `pattern` é regex e deve ser verificável com `grep -r` no codebase. |
| `depends_on` | IDs devem referenciar planos reais na mesma fase. |
| `autonomous` | Definir como `false` se qualquer `<task type="checkpoint:*">` existe no plano. |

---

## Estrutura de Tarefas (XML)

### Tipo: Auto (mais comum)

```xml
<task type="auto">
  <name>Tarefa 1: Nome orientado a ação</name>       <!-- OBRIGATÓRIO -->
  <files>src/components/Chat.tsx, src/api/chat.ts</files>  <!-- OBRIGATÓRIO — separado por vírgula -->
  <action>
    Passos específicos de implementação. O que fazer e o que EVITAR e POR QUÊ.
    Referencie código existente quando relevante.
  </action>                                           <!-- OBRIGATÓRIO -->
  <verify>
    <automated>npm test -- --filter=Chat</automated> <!-- PREFERIDO — comando bash executável -->
  </verify>                                           <!-- OBRIGATÓRIO — veja formatos abaixo -->
  <done>Critério de aceitação mensurável que confirma conclusão</done>  <!-- OBRIGATÓRIO -->
</task>
```

### Tipo: TDD

```xml
<task type="tdd" tdd="true">
  <name>Tarefa: Nome</name>
  <files>src/feature.ts, src/feature.test.ts</files>
  <behavior>
    - Teste 1: comportamento esperado em condição normal
    - Teste 2: caso de borda X deve retornar Y
  </behavior>                                         <!-- OBRIGATÓRIO para tdd -->
  <action>Implementação após os testes passarem</action>
  <verify>
    <automated>npm test -- --filter=feature</automated>
  </verify>
  <done>Todos os comportamentos listados passam; sem implementação desnecessária</done>
</task>
```

### Tipo: Checkpoint — Verificação Humana

```xml
<task type="checkpoint:human-verify">
  <what-built>O que o Claude automatizou neste ponto</what-built>
  <how-to-verify>
    1. Passos exatos para testar manualmente
    2. O que procurar
    3. Como confirmar que está funcionando
  </how-to-verify>
  <resume-signal>O que o usuário diz para continuar (ex: "verificado", "ok")</resume-signal>
</task>
```

### Tipo: Checkpoint — Decisão

```xml
<task type="checkpoint:decision">
  <decision>O que está sendo decidido</decision>
  <context>Por que isso importa e qual o impacto da escolha</context>
  <options>
    <option id="option-a">
      <name>Nome da Opção A</name>
      <pros>Benefícios específicos para este projeto</pros>
      <cons>Desvantagens específicas para este projeto</cons>
    </option>
    <option id="option-b">
      <name>Nome da Opção B</name>
      <pros>...</pros>
      <cons>...</cons>
    </option>
  </options>
  <resume-signal>Usuário diz "option-a" ou "option-b" para continuar</resume-signal>
</task>
```

### Tipo: Checkpoint — Ação Humana

```xml
<task type="checkpoint:human-action">
  <action>Ação específica que o humano deve executar</action>
  <instructions>
    Passos exatos, onde obter credenciais/chaves, o que configurar
  </instructions>
  <resume-signal>O que o usuário diz após completar (ex: "feito", "configurado")</resume-signal>
</task>
```

---

## Formato de `<verify>`

O campo `<verify>` aceita dois formatos:

| Formato | Quando usar | Exemplo |
|---------|-------------|---------|
| `<automated>cmd</automated>` | **Preferido** — comando bash executável | `<automated>npm test -- --filter=Auth</automated>` |
| String simples | Verificação que não é comando bash | `Servidor inicia sem erros no console` |
| `<automated>MISSING — Etapa 0 deve criar {arquivo_teste}</automated>` | Padrão Nyquist — quando teste ainda não existe | `<automated>MISSING — Etapa 0 deve criar tests/auth.test.ts</automated>` |

**Regra Nyquist:** Se `<automated>` diz `MISSING`, deve existir uma tarefa de Etapa 0 que cria o arquivo de teste referenciado. O verificador-plano valida esse link.

---

## Contexto Inline (Opcional)

Para passar código existente ao executor sem exigir que ele releia arquivos grandes:

```xml
<interfaces>
  <!-- Tipos/exports exatos do codebase existente que o executor precisa -->
  De src/types/user.ts:
  export interface User { id: string; email: string; role: 'admin' | 'user' }
</interfaces>
```

---

## Exemplo Completo

```markdown
---
phase: "02-auth"
plan: "01"
type: "execute"
etapa: 1
depends_on: []
files_modified: ["src/lib/auth.ts", "src/api/login.ts", "tests/auth.test.ts"]
autonomous: true
requisitos: ["AUTH-01", "AUTH-02"]
must_haves:
  truths:
    - "Usuário consegue fazer login com email e senha válidos"
    - "Login com credenciais inválidas retorna mensagem de erro clara"
  artifacts:
    - path: "src/lib/auth.ts"
      provides: "Lógica de autenticação JWT"
      exports: ["authenticate", "validateToken"]
    - path: "tests/auth.test.ts"
      provides: "Testes automatizados de autenticação"
      min_lines: 20
  key_links:
    - from: "src/api/login.ts"
      to: "src/lib/auth.ts"
      via: "import { authenticate }"
      pattern: "authenticate\\("
---

## Objetivo

Implementar autenticação JWT para os requisitos AUTH-01 e AUTH-02.

<task type="auto">
  <name>Tarefa 1: Criar função de autenticação JWT</name>
  <files>src/lib/auth.ts, tests/auth.test.ts</files>
  <action>
    Criar authenticate(email, password) que verifica credenciais contra o banco e retorna JWT.
    NÃO usar bcrypt.compareSync — usar bcrypt.compare (async) para não bloquear o event loop.
  </action>
  <verify>
    <automated>npm test -- --filter=auth</automated>
  </verify>
  <done>authenticate() retorna token para credenciais válidas e lança AuthError para inválidas</done>
</task>
```
