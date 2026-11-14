# CLAUDE.md — Contexto para o Claude Code

Este arquivo é lido automaticamente pelo Claude Code em toda sessão.
Mantenha curto. Decisões longas vão para o `PRD.md`.

## O que é este projeto

Site público da **Layla Panini** (assessoria FIES) + sistema interno
**Metta Estudantil** (`metta-app`), no mesmo repositório Next.js.

- Site público: captação de leads para a assessoria, apresentação do
  curso online, canal de contato via WhatsApp.
- Sistema interno: consultores pesquisam faculdades por nota do ENEM,
  geram relatórios em PDF, importam dados do MEC.

## Stack

- Next.js 16 (App Router)
- React 19, TypeScript estrito
- Tailwind CSS 4 (via Turbopack)
- Supabase Pro (banco, auth, RLS)
- @react-pdf/renderer (geração de PDF no servidor)
- Vitest (testes unitários)
- Hospedagem: Vercel (decisão do PRD); hoje em produção: Netlify
- DNS e proteção: Cloudflare

## Comandos

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run lint         # ESLint
npm test             # Testes (Vitest)
npm run typecheck    # Tipos
```

## Estrutura (resumo)

- `src/app/(public)/` — site público (sem login) — **planejado, ainda não criado**
- `src/app/(app)/` — sistema interno (login obrigatório)
- `src/app/api/` — endpoints (relatório, leads)
- `src/lib/` — regras de negócio **(arquivos protegidos — ver AGENTS.md)**
- `src/proxy.ts` — proteção de rotas (no Next 16, o middleware se chama proxy)
- `src/components/` — componentes React de terceiros (KokonutUI)
- `public/brand/` — logo e QR Code (ver `README.md`)
- `scripts/` — verificações manuais de planilhas (ver `scripts/README.md`)

## Decisões importantes

1. Site público não tem simulador. Formulário leva ao WhatsApp.
2. Login é só de consultor. Área do aluno fica para fase 2 (jan/2027).
3. Relatório é brinde do pacote de assessoria, não produto separado.
4. Checkout do curso é externo (Eduzz). Aulas na Astron Members.

## Para onde pedir ajuda

- `AGENTS.md` — regras de trabalho
- `PRD.md` — especificação completa
- `STATUS.md` — estado atual, próxima tarefa
- `README.md` — como rodar, mapa do projeto e onde mexer

