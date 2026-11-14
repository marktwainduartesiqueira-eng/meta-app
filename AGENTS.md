# AGENTS.md — Regras para IAs trabalhando neste repositório

## Identidade e papel principal

A **IA principal deste projeto é o Claude** (via Claude Code). Toda decisão
de arquitetura, código, revisão e estrutura passa por ele.

ChatGPT, Gemini e v0.dev podem ser usados como auxiliares para:
- Rascunhos visuais (v0.dev)
- Revisão de copy (Gemini)
- Apoio em SQL complexo ou testes (ChatGPT)

Mas **nenhum código entra no repositório sem passar pelo Claude**.

## Protocolo de sessão

### Ao abrir uma sessão nova

Primeiro comando sempre:

> "Leia `AGENTS.md`, `CLAUDE.md` e `STATUS.md`. Execute a próxima
> tarefa listada em `STATUS.md`. Pergunte se algo estiver ambíguo."

### Ao encerrar uma sessão

Atualize o `STATUS.md` com:
1. O que foi concluído
2. Arquivos criados ou alterados
3. Próxima tarefa (uma frase, concreta)
4. Decisões em aberto

## Regras de código (invariantes)

### Arquivos protegidos

Os arquivos abaixo contêm lógica de negócio do metta-app em produção.
**Não altere sem autorização explícita** em `STATUS.md`:

- `src/lib/chance.ts`
- `src/lib/collect/**`
- `src/lib/import/**`
- `src/lib/pdf/**`
- `src/lib/supabase/**`

Se precisar mudar algo neles, pare, abra uma seção "Mudança proposta em
arquivo protegido" no `STATUS.md`, e aguarde aprovação.

### Convenções

- TypeScript estrito. Nunca `any` sem justificativa.
- Server Components por padrão. Client Components só com `"use client"`
  explícito e motivo.
- Dados vêm do servidor com RLS do Supabase aplicando segurança.
- Nada de `console.log` em código de produção.
- Sem segredos no código. Use variáveis de ambiente.
- Commits em português, no imperativo: "Adiciona formulário de lead".
- Branch por tarefa: `feat/home-hero`, `fix/middleware-rename`.

### Testes

- Qualquer alteração em `src/lib/` precisa de teste no Vitest.
- `npm run build` precisa passar antes de abrir PR.

## Estrutura de pastas

Veja `PRD.md` seção 4. Não crie pastas fora dessa estrutura.

## Segurança

- Chave `SUPABASE_SERVICE_ROLE_KEY` **jamais** vai para o cliente.
- Toda escrita em tabela com dados pessoais passa por validação (Zod).
- Formulário público valida Turnstile no servidor antes de gravar.
- Nenhum arquivo `.env*` entra no git.

## Dúvida?

Se algo não está claro, **pergunte ao Mark**. Não assuma.


<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
