# PRD: Site Público Layla Panini + Sistema Interno Metta Estudantil

**Versão:** 4.0 (corrigida após auditoria técnica no código real)
**Data:** 11/11/2026
**Status:** pronto para execução por etapas, após aprovação
**Repositório:** `metta-app`
**IA principal:** Claude (código, revisão, arquitetura)
**Projeto Supabase:** `lavcrgenirayjcxsgomc` (plano Free, migração para Pro na Etapa 1)
**Hospedagem:** a definir entre Netlify (atual) e Vercel (ver seção 3.2)
**DNS e proteção:** Cloudflare
**Área de aulas:** Astron Members (externa), checkout em Hotmart ou Eduzz
**Domínio:** laylapanini.com.br

---

## 1. Visão geral e objetivos

Unificar a marca da Dra. Layla Panini com o sistema de inteligência de dados da Metta Estudantil (metta-app) em uma plataforma única, sem quebrar o sistema interno que já está em produção.

### 1.1 Diretrizes estratégicas

1. **Assessoria FIES como carro-chefe.** O site público é desenhado para capturar leads qualificados para o serviço de maior margem.
2. **Relatório personalizado como brinde do pacote, não produto separado.** Decisão revisada da v3: ter dois produtos separados confunde o visitante. O relatório PDF gerado pelo metta-app é parte da entrega da assessoria, e serve para elevar o valor percebido. Em caso de reavaliação futura, ele pode virar produto de entrada (ticket menor, isca para a assessoria).
3. **Formulário de triagem simples.** Nome, WhatsApp, nota aproximada do ENEM, regiões de preferência. O consultor recebe o lead no CRM e responde manualmente.
4. **Sem simulador público na v1.** Decisão revisada: o simulador atrai tráfego orgânico, mas também desqualifica o atendimento. Começamos sem simulador e avaliamos na iteração 2, com dados do Search Console.
5. **Sem checkout interno.** Assessoria e relatório são negociados no WhatsApp. O curso é vendido na Hotmart ou Eduzz, com aulas na Astron Members.
6. **Design de alto padrão, mobile-first.** Tipografia editorial, Bento Grids, animações leves com Motion for React. Meta de Lighthouse Mobile ≥ 90 no lançamento.

### 1.2 Fora de escopo da v1

- Área do aluno com login.
- Checkout no próprio site.
- Blog com publicação semanal (a estrutura entra, o conteúdo vem na v2).
- Simulador público de chances.
- Integração automática com Instagram.

---

## 2. Correções técnicas aplicadas em relação à v3

Esta seção lista erros da versão anterior do PRD e como foram resolvidos nesta.

| Problema na v3 | Correção na v4 |
|---|---|
| Chamava o arquivo de proteção de `proxy.ts` | **Será renomeado para `middleware.ts`** na raiz de `src/`, com a função exportada chamada `middleware`. É o padrão oficial do Next.js. Hoje o arquivo tem nome errado (ver seção 6). |
| Assumia que Next.js 16 roda sem problemas no Netlify | Adiciona teste de build em Deploy Preview como critério de aceite da Etapa 2, e deixa Vercel como opção se o Netlify falhar. |
| Não falava de redirecionamento pós-login | Login redireciona para `/painel`, não para `/`. O layout do grupo `(app)` redireciona `/` para `/painel` se o usuário estiver logado. |
| Mencionava Turnstile sem detalhar validação | Turnstile é validado no servidor (Server Action ou Route Handler) antes da gravação do lead. Sem token válido, o lead é descartado. |
| Permitia RLS genérico em `public_leads` | Política explícita: `anon` só pode `INSERT`, nunca `SELECT`, `UPDATE` ou `DELETE`. Admins leem via `authenticated` com `is_admin()`. |
| Não previa janela de troca de DNS | A Etapa 5 tem uma janela definida: site novo no ar em subdomínio de teste, validação, e só então troca de DNS. |
| Não previa GA4, Pixel, Search Console | Configurados na Etapa 3, antes do lançamento. |
| Multi-IA sem voz técnica dominante | **Claude é a IA principal para código e arquitetura.** ChatGPT e Gemini entram como auxiliares para revisão, copy e rascunhos visuais. |
| Não previa ambiente de homologação | Deploy Previews da hospedagem usados para todo PR antes de virar main. |
| Não previa backup antes das mudanças | Backup do banco e tag no git (`v1-before-public-site`) são pré-requisitos da Etapa 2. |

---

## 3. Ecossistema e decisões de infraestrutura

### 3.1 Papeis das ferramentas

| Camada | Serviço | Função |
|---|---|---|
| DNS e proteção | Cloudflare | DNS, WAF, Turnstile no formulário |
| Aplicação Next.js | Netlify ou Vercel (ver 3.2) | Site público + metta-app |
| Banco e autenticação | Supabase Pro | Dados, auth, RLS, backups diários |
| Checkout do curso | Hotmart ou Eduzz | Pagamento do curso online |
| Entrega das aulas | Astron Members | Vídeo-aulas do curso |
| Análise | Google Analytics 4, Search Console, Meta Pixel | Medição e indexação |
| CRM dos leads | Tabela `public_leads` no Supabase + tela `/leads` no metta-app | Fluxo interno |

### 3.2 Decisão de hospedagem: Netlify x Vercel

**A definir antes da Etapa 2.** Ambas são boas, com um fator decisivo:

- **Netlify (atual):** o metta-app já está lá. Precisa adicionar `@netlify/plugin-nextjs` (não está configurado hoje). Preço: Pro US$ 20/mês, com membros ilimitados mas consumo por créditos.
- **Vercel:** plataforma nativa do Next.js. Preço: Pro US$ 20 por desenvolvedor com acesso de escrita.

**Recomendação:** testar o build atual do metta-app no Netlify com o plugin oficial. Se funcionar sem adaptações, manter. Se der problema em alguma rota (middleware, geração de PDF em Route Handler), mover para Vercel. A decisão vai depender de um teste objetivo, não de preferência.

---

## 4. Arquitetura de pastas no repositório

```
metta-app/
├── AGENTS.md                    # Regras para IAs (Claude principal)
├── STATUS.md                    # Prontuário de handoff entre sessões
├── PRD.md                       # Este documento
├── CLAUDE.md                    # Contexto curto para o Claude: comandos, convenções, decisões
├── netlify.toml                 # Build config (atualizar com plugin Next.js)
├── vercel.json                  # Se migrarmos para Vercel
├── package.json
│
├── public/
│   ├── images/
│   │   ├── layla/
│   │   ├── depoimentos/
│   │   └── selos/
│   ├── brand/                   # Logo e QR do PDF (já existe)
│   └── favicon.ico
│
├── src/
│   ├── middleware.ts            # RENOMEADO de proxy.ts — nome oficial do Next.js
│   │
│   ├── app/
│   │   ├── (public)/            # Rotas públicas, layout próprio
│   │   │   ├── layout.tsx       # Header, Footer, botão WhatsApp flutuante
│   │   │   ├── page.tsx         # Home
│   │   │   ├── assessoria/page.tsx
│   │   │   ├── sobre/page.tsx
│   │   │   ├── curso/page.tsx
│   │   │   ├── aprovados/page.tsx
│   │   │   ├── blog/page.tsx
│   │   │   ├── blog/[slug]/page.tsx
│   │   │   ├── contato/page.tsx
│   │   │   ├── privacidade/page.tsx
│   │   │   └── termos/page.tsx
│   │   │
│   │   ├── (app)/               # Sistema interno (metta-app)
│   │   │   ├── layout.tsx       # Redireciona / para /painel se logado
│   │   │   ├── painel/page.tsx  # Antiga rota /
│   │   │   ├── leads/page.tsx   # NOVO: leads do site
│   │   │   ├── pesquisa/page.tsx
│   │   │   ├── curso/[id]/page.tsx
│   │   │   ├── coleta/page.tsx
│   │   │   ├── importar-historico/page.tsx
│   │   │   ├── usuarios/page.tsx
│   │   │   └── perfil/page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── relatorio/route.tsx       # Já existe
│   │   │   └── leads/route.ts            # NOVO: endpoint de leads com Turnstile
│   │   │
│   │   ├── login/page.tsx                # Redireciona para /painel após login
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── public/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LeadForm.tsx
│   │   │   ├── WhatsAppFloating.tsx
│   │   │   └── BentoGrid.tsx
│   │   └── app/                 # Componentes do metta-app
│   │
│   └── lib/                     # Regras de negócio (NÃO ALTERAR sem autorização)
│       ├── chance.ts
│       ├── collect/
│       ├── import/
│       ├── pdf/
│       ├── supabase/
│       └── leads/               # NOVO: validação, Turnstile, formatação do WhatsApp
```

---

## 5. Estratégia de IA: Claude como principal

### 5.1 Papeis

- **Claude:** arquitetura, código Next.js, middleware, componentes, Server Actions, revisão de PRs, decisões técnicas. É a voz técnica dominante.
- **ChatGPT (opcional):** apoio em SQL complexo, migrações e testes.
- **Gemini (opcional):** auditoria de copy e redação.
- **v0.dev (opcional):** rascunho visual rápido antes de codar.

### 5.2 Protocolo de handoff

Quando uma sessão do Claude estiver próxima do limite, atualizar `STATUS.md` com:

1. O que foi concluído na sessão.
2. Arquivos criados ou editados (lista).
3. Próxima tarefa exata, em uma frase.
4. Decisões em aberto.

Abertura de nova sessão:
> "Leia `AGENTS.md`, `CLAUDE.md` e `STATUS.md`. Execute a próxima tarefa listada em STATUS. Pergunte se algo estiver ambíguo."

### 5.3 Convenções de código

- Tudo em TypeScript estrito.
- Componentes de página são Server Components por padrão; Client Components só quando interativos.
- Dados sempre buscados no servidor, com RLS aplicando a segurança.
- Erros tratados explicitamente, sem engolir exceções.
- Nenhum arquivo de `src/lib/chance.ts`, `src/lib/collect/` ou `src/lib/pdf/` é alterado sem registro em `STATUS.md`.

---

## 6. Correção crítica: nome do middleware

**Situação atual:** o projeto tem `src/proxy.ts` com uma função `proxy`. O Next.js espera `src/middleware.ts` com uma função `middleware`. Como está, **o Next.js não executa esse arquivo como middleware**.

**Perguntas abertas:**

1. A proteção de rotas atual está funcionando? Se sim, de que forma? Pode ser que exista outro mecanismo, ou que o arquivo esteja sendo chamado manualmente em cada layout.
2. Ou a proteção simplesmente não está ativa e nunca foi testada com usuário não autenticado?

**Ação:** antes da Etapa 2, verificar em produção se um visitante sem login consegue acessar `/pesquisa`. Se conseguir, o metta-app está exposto e precisa de correção imediata, antes de qualquer trabalho no site público.

A correção é simples: renomear `src/proxy.ts` para `src/middleware.ts` e `export async function proxy` para `export async function middleware`. O conteúdo da função está correto.

---

## 7. Roadmap em 5 etapas

### Etapa 1: Blindagem do banco e segurança (Supabase Pro)

**Objetivo:** base estável e sem alertas de segurança.

**Ações:**
1. Upgrade para Supabase Pro.
2. Revogar `EXECUTE` para `anon` nas funções `SECURITY DEFINER`: `notificar_novo_cadastro`, `ping`, `rls_auto_enable`.
3. Revisar `is_active_user`, `is_admin`, `notificar_novo_cadastro`, `ping`, `rls_auto_enable` quanto a `authenticated`.
4. Ativar proteção contra senhas vazadas (HaveIBeenPwned).
5. Criar tabela `public_leads`:
   - Campos: `id`, `nome`, `whatsapp`, `perfil` (`aluno` ou `familiar`), `nota_enem`, `regioes` (array), `servico` (`assessoria` ou `curso` ou `relatorio`), `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `turnstile_ok` (bool), `created_at`, `status` (`novo`, `em_atendimento`, `convertido`, `descartado`), `atendido_por` (FK para `profiles`), `anotacoes`.
   - RLS: `anon` só `INSERT`; `authenticated` com `is_admin() OR is_consultor()` pode `SELECT` e `UPDATE`.
   - Índice em `created_at DESC` e em `status`.
6. Backup do banco (snapshot) e tag `v1-before-public-site` no git.
7. Verificar se o metta-app em produção está protegido (ver seção 6).

**Critério de aceite:** zero alertas críticos no Supabase; tabela `public_leads` criada com RLS testado; backup confirmado; middleware validado.

---

### Etapa 2: Reestruturação de pastas e isolamento das rotas

**Objetivo:** abrir espaço para rotas públicas sem quebrar o metta-app.

**Ações:**
1. Renomear `src/proxy.ts` para `src/middleware.ts` e `proxy` para `middleware`.
2. Atualizar o matcher do middleware para excluir rotas públicas (ver pseudocódigo em 7.2).
3. Criar os grupos `(public)` e `(app)` em `src/app/`.
4. Mover `src/app/(app)/page.tsx` para `src/app/(app)/painel/page.tsx`.
5. Atualizar `src/app/login/page.tsx` para redirecionar para `/painel` após login.
6. Criar `src/app/(app)/layout.tsx` que redirecione `/` para `/painel` quando logado.
7. Criar `src/app/(public)/layout.tsx` com header, footer e botão flutuante do WhatsApp.
8. Criar `src/app/(public)/page.tsx` com placeholder (texto simples, "Em breve").
9. Validar: todas as rotas antigas do metta-app continuam acessíveis em seus novos caminhos; `/pesquisa` exige login; `/` responde sem login.
10. Rodar `npm run build` e testar em Deploy Preview.
11. Decidir Netlify x Vercel com base no resultado do build.

**Critério de aceite:** metta-app funciona igual à versão anterior; `/` retorna página pública; Deploy Preview no ar com domínio temporário.

**Pseudocódigo do middleware:**
```ts
// Rotas públicas que não exigem login
const PUBLIC_PATHS = ['/', '/assessoria', '/sobre', '/curso', '/aprovados',
                      '/blog', '/contato', '/privacidade', '/termos',
                      '/api/leads']

if (PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'))) {
  return response // sem verificação de login
}
// restante do fluxo atual (verifica claims, redireciona se não logado)
```

---

### Etapa 3: Sistema de design, Home e Assessoria

**Objetivo:** colocar no ar a principal ferramenta de captação.

**Ações:**
1. Definir no `globals.css` os tokens de design: paleta (da Layla, já existe relatório de cores), tipografia (serif editorial + sans de apoio), espaçamento, sombras, raios.
2. Criar `components/public/Header.tsx`, `Footer.tsx`, `WhatsAppFloating.tsx`.
3. Criar `components/public/LeadForm.tsx`: nome, WhatsApp, perfil (aluno ou familiar), nota aproximada do ENEM, regiões, consentimento LGPD. Integrado ao Turnstile (`data-sitekey` público).
4. Criar `src/app/api/leads/route.ts` como Route Handler: valida Turnstile no servidor (chave secreta em env), valida dados com Zod, grava em `public_leads`, retorna JSON com URL do WhatsApp pré-formatada (`wa.me/<numero>?text=<mensagem>`).
5. Montar `src/app/(public)/page.tsx` (Home): hero com foto da Layla, proposta de valor, CTA para o formulário, Bento Grid de diferenciais, prova social (depoimentos autorizados), FAQ curto, CTA final.
6. Montar `src/app/(public)/assessoria/page.tsx`: página dedicada à Assessoria FIES, com seção para pais, o que entra no pacote, como funciona, formulário, FAQ.
7. Configurar `generateMetadata` em cada página pública: título, descrição, Open Graph, canonical.
8. Criar `src/app/(public)/sitemap.ts` e `src/app/(public)/robots.ts`.
9. Adicionar JSON-LD de `Organization` no layout público.
10. Instalar GA4, Search Console, Meta Pixel e configurar eventos de conversão (`lead_submit`, `whatsapp_click`).

**Critério de aceite:** formulário envia lead em menos de 2 segundos; lead aparece em `public_leads`; mensagem do WhatsApp abre com nome e contexto; Lighthouse Mobile ≥ 90 em `/` e `/assessoria`.

---

### Etapa 4: Páginas complementares

**Objetivo:** cobrir as demais abas do site.

**Ações:**
1. `/sobre`: trajetória da Dra. Layla, história da Metta, equipe.
2. `/curso`: apresentação do "FIES: O Guia Completo", botão de compra para Hotmart ou Eduzz, aviso de que as aulas são entregues na Astron Members.
3. `/aprovados`: galeria de depoimentos verificados, com autorização por escrito dos alunos. **Pré-requisito:** lista de depoimentos autorizados fornecida pela Layla.
4. `/contato`: canais oficiais, horário, formulário alternativo.
5. `/blog`: estrutura de listagem e página `[slug]`; dois posts iniciais para validar a renderização (pode ser lorem).
6. `/privacidade` e `/termos`: redação revisada por advogado. **Pré-requisito:** textos aprovados antes de publicar.
7. Link discreto no rodapé: "Portal do Consultor" aponta para `/login`.

**Critério de aceite:** todas as páginas navegáveis; Lighthouse ≥ 90 em todas; política de privacidade publicada antes do primeiro lead real.

---

### Etapa 5: Conexão interna e virada de DNS

**Objetivo:** fechar o ciclo de leads e colocar o site no domínio oficial.

**Ações:**
1. Criar `src/app/(app)/leads/page.tsx`: lista de leads, filtros por status, botão "Simular no app" que abre `/pesquisa` com `nota=X&uf=Y`.
2. Teste de carga em Deploy Preview (simulação de 100 submissões simultâneas).
3. Teste de restauração do backup do Supabase (prova que o Pro está funcionando).
4. Validar o site completo em subdomínio temporário com usuários reais (Layla, consultores).
5. Backup final do WordPress (arquivos + banco).
6. Mapear todas as URLs atuais e preparar redirecionamentos 301.
7. Atualizar DNS no Cloudflare: `laylapanini.com.br` e `www` apontando para a hospedagem (Netlify ou Vercel).
8. Validar propagação, HTTPS, e-mails (MX, SPF, DKIM preservados).
9. Enviar sitemap ao Search Console.
10. Manter WordPress antigo em subdomínio (`wp.laylapanini.com.br`) por 30 dias, como fallback.

**Critério de aceite:** site no ar em `laylapanini.com.br` com HTTPS; sitemap aceito; leads chegando; e-mails funcionando.

---

## 8. Segurança, LGPD e conformidade

### 8.1 Dados coletados

- **Lead:** nome, WhatsApp, perfil, nota do ENEM, regiões, UTMs.
- **Cliente (depois do fechamento):** dados do atendimento, nota oficial, CPF (no metta-app, não no site público).

### 8.2 Base legal

- Lead: consentimento explícito no formulário.
- Cliente: execução de contrato.

### 8.3 Regras

- Política de privacidade e termos publicados antes do primeiro lead.
- Checkbox de consentimento no formulário, sem pré-marcação.
- Retenção: leads não convertidos excluídos após 180 dias.
- Nenhum dado de cliente trafega no site público.
- Depoimentos só com autorização por escrito (digital, assinada).
- Credenciais médicas da Layla apresentadas como biografia, sem configurar oferta de serviços médicos (regra do CFM).

### 8.4 Segurança técnica

- Turnstile valida servidor-side (chave secreta no env).
- RLS em todas as tabelas.
- Chaves do Supabase: só a publicável no cliente; secreta só no servidor.
- Nenhum segredo commitado (`.env.local` no `.gitignore`).
- Rate limit por IP no endpoint `/api/leads` (10 submissões por hora).

---

## 9. Métricas e governança

### 9.1 Métricas de produto

- Leads por dia e por canal.
- Taxa de preenchimento do formulário (visitantes / submissões).
- Tempo até primeiro contato do consultor.
- Taxa de conversão de lead em cliente.
- Lighthouse Mobile em todas as páginas.
- Disponibilidade nos períodos de inscrição do FIES.

### 9.2 Monitoramento

- UptimeRobot ou Better Stack monitorando `/` e `/api/leads`.
- Alertas de erro no servidor (Sentry na v2).
- Review semanal dos leads descartados para ajuste do formulário.

### 9.3 Rotina de manutenção

- Atualização mensal de dependências em branch separada, testada em Deploy Preview.
- Revisão trimestral das políticas de RLS.
- Teste de restauração do backup do Supabase a cada mês.

---

## 10. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Middleware atual não protege nada em produção | Alto | Verificar em primeiro lugar (Etapa 1); corrigir imediatamente se confirmado |
| Netlify incompatível com Next.js 16 | Médio | Teste em Deploy Preview; plano B é migrar para Vercel |
| Troca de DNS derruba e-mails | Alto | Copiar MX, SPF, DKIM antes de trocar |
| Lead fake em massa | Médio | Turnstile + rate limit |
| Perda de SEO do WordPress | Médio | Redirecionamentos 301 mapeados antes da troca |
| Depoimentos sem autorização | Alto (legal) | Lista aprovada antes da Etapa 4 |
| Promessa de aprovação no conteúdo | Alto (legal) | Revisão de copy antes de publicar; termos "estratégias", "aumentar chances" |

---

## 11. Perguntas em aberto

**Preciso das suas respostas para fechar a v4 e iniciar a Etapa 1:**

1. **Middleware em produção:** você consegue testar agora em `https://[dominio-do-metta].netlify.app/pesquisa` sem login? Se abrir a página sem redirecionar para `/login`, o middleware não está funcionando.
2. **Depoimentos:** a Layla já tem a lista de alunos que autorizaram depoimento e imagem por escrito? Sem isso, `/aprovados` fica para depois.
3. **Política de privacidade:** existe um advogado para revisar? Ou vamos usar um modelo e marcar a revisão como pendência?
4. **Hotmart ou Eduzz:** o checkout do curso está onde hoje? Qual é o link?
5. **Astron Members:** já está em uso ou é mudança?
6. **Domínio e e-mails:** a Layla tem e-mails `@laylapanini.com.br`? Onde estão hospedados? (afeta a Etapa 5)
7. **Orçamento mensal:** confirma Supabase Pro (US$ 25) + Netlify ou Vercel (US$ 20) + Cloudflare (grátis)?
8. **Credenciais da Layla:** estão documentadas (certificados, registros)? Para confirmar as regras do CFM.
9. **Prazo:** há data-alvo para o lançamento? Lembrando: inscrição FIES 2026.2 já passou; a próxima janela grande é FIES 2027.1, provavelmente em fevereiro.
10. **Quem escreve o conteúdo:** você, a Layla, ou uma copy escrita com apoio do Claude e revisada?

---

## 12. Critério de pronto para iniciar

Antes de começar a Etapa 1, confirmar:

- [ ] Backup do Supabase feito
- [ ] Tag no git criada (`v1-before-public-site`)
- [ ] Verificação do middleware em produção
- [ ] Respostas das 10 perguntas da seção 11
- [ ] Aprovação deste PRD pelo Mark
- [ ] Criação de `AGENTS.md`, `CLAUDE.md` e `STATUS.md` iniciais

---

**Fim do PRD v4.**
