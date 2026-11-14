# Metta Estudantil — sistema interno da assessoria FIES

Plataforma interna dos consultores: pesquisa de faculdades por nota do ENEM (com histórico por edição e estimativa de
chance), coleta de dados das planilhas brutas do MEC, importação de histórico, relatório em PDF e controle de usuários.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · Supabase (banco, auth, RLS) · Netlify.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000
```

Crie o `.env.local` (não vai para o git) com as duas variáveis públicas do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

| Comando | Para quê |
|---|---|
| `npm run dev` | desenvolvimento |
| `npm run build` | build de produção (precisa passar antes de publicar) |
| `npm run typecheck` | verificação de tipos |
| `npm test` | testes (Vitest) |
| `npm run lint` | ESLint |

## Arquivo principal e mapa do projeto

O ponto de entrada é `src/app/layout.tsx` (fontes e estrutura global). Depois da autenticação, a primeira tela é
`src/app/(app)/page.tsx` (Início), dentro de `src/app/(app)/layout.tsx` (cabeçalho e menu).

```
src/
├─ proxy.ts                  porta de entrada: exige login em todas as rotas (exceto /login)
├─ app/
│  ├─ layout.tsx             layout raiz (fontes Inter e Plus Jakarta Sans, título, cor do navegador)
│  ├─ globals.css            ★ tokens de design (cores, tipografia, movimento) — mexa aqui para mudar o visual
│  ├─ login/                 tela de login e primeiro acesso
│  ├─ (app)/                 telas internas (login obrigatório)
│  │  ├─ layout.tsx          cabeçalho fixo + menu Morphic + perfil/Sair
│  │  ├─ page.tsx            Início (hero com arco graduado, números, atalhos)
│  │  ├─ pesquisa/           pesquisa de faculdades, gráfico por edição
│  │  ├─ curso/[id]/         histórico detalhado de um curso
│  │  ├─ coleta/             planilhas brutas do MEC → Tabela Modelo
│  │  ├─ importar-historico/ (admin) importa uma edição já compilada
│  │  ├─ usuarios/           (admin) aprovação e papéis
│  │  └─ perfil/             dados do próprio usuário
│  └─ api/relatorio/         gera o relatório em PDF
├─ components/kokonutui/     componentes de terceiros (menu Morphic Navbar)
└─ lib/                      regras de negócio
   ├─ chance.ts              estimativa de chance            ┐
   ├─ collect/               motor de coleta e preenchimento │ ARQUIVOS PROTEGIDOS
   ├─ import/                leitura da planilha compilada   │ (ver AGENTS.md)
   ├─ pdf/                   layout e mensagens do relatório │
   ├─ supabase/              clientes do banco               ┘
   ├─ search.ts, names.ts    consulta de pesquisa e nomes de exibição
   └─ utils.ts               utilitário `cn` (classes do Tailwind)
```

## Onde mexer para…

| Quero | Arquivo |
|---|---|
| Mudar cores, fontes ou movimento do app | `src/app/globals.css` e `src/app/layout.tsx` |
| Mudar o menu ou o cabeçalho | `src/app/(app)/layout.tsx` (+ `src/components/kokonutui/morphic-navbar.tsx`) |
| Mudar a tela inicial | `src/app/(app)/page.tsx` e `src/app/(app)/arco-graduado.tsx` |
| Mudar a aparência de uma tela | a `page.tsx` da pasta da tela em `src/app/(app)/` |
| Mudar regras de chance, coleta, importação ou PDF | `src/lib/…` — **protegido**: só com autorização e teste |

## Assets

Tudo em `public/brand/`:

| Arquivo | Uso |
|---|---|
| `logo.png` | logo com fundo transparente no cabeçalho e no login (`/brand/logo.png`) |
| `logo.jpg` | logo do cabeçalho do relatório em PDF (lida em tempo de execução) |
| `qr-instagram.jpg` | QR Code do relatório em PDF (lido em tempo de execução) |

O `next.config.ts` inclui `public/brand/**` na função do relatório; sem isso a hospedagem não encontra os arquivos.

## Dados locais e scripts

- `Tabelas/` (fora do git): planilhas do MEC, compilados por edição e a Tabela Modelo.
- `scripts/`: verificações manuais com `npx tsx`. Veja `scripts/README.md`.

## Publicação

- Hospedagem em produção: **Netlify** (`netlify.toml`), publicando a partir do GitHub. Cada publicação gasta créditos:
  junte várias mudanças em um só envio.
- `.github/workflows/manter-supabase-ativo.yml` consulta o banco duas vezes por semana para ele não pausar no plano gratuito.
- Mudanças no banco (migrations) são aplicadas direto no Supabase e não ficam neste repositório.

## Documentos do projeto

- `AGENTS.md` — regras de trabalho, arquivos protegidos e convenções
- `CLAUDE.md` — contexto lido pelo Claude Code em toda sessão
- `PRD.md` — especificação completa (site público + sistema interno)
- `STATUS.md` — estado atual e próxima tarefa
- `DESIGN.md` — sistema visual (paleta, tipografia, movimento)
- `PRODUCT.md` — contexto de produto usado nas ferramentas de design
