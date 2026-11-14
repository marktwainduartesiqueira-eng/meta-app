# STATUS.md — Estado atual do projeto

> Atualizado a cada sessão. A próxima IA começa lendo este arquivo.

**Última atualização:** 14/11/2026
**Fase:** Preparação (pré-execução)
**Prazo de lançamento da v1:** 20/11/2026

---

## Concluído até agora

- [x] Análise do metta-app atual (código, banco, segurança)
- [x] PRD v4.1 escrito e aprovado
- [x] Pasta `materiais-site` criada no computador do Mark
- [x] Decisões: Vercel (hospedagem), Cloudflare (DNS), Supabase Pro
- [x] Escopo da v1 definido: Home, Assessoria, Sobre, Curso,
      Aprovados, Blog, Contato, Privacidade
- [x] Fase 2 definida: área do aluno com pesquisa de 3 dias
      (jan/2027)
- [x] Depoimentos: Layla confirmou autorizações assinadas

### Sessão de 14/11/2026 — design e organização do app interno

- [x] Design do app interno (só visual, sem mudar funções, PDF ou gráficos): paleta e tipografia da landing,
      composição "Folha de atendimento", responsividade, movimento sutil, menu Morphic Navbar (KokonutUI),
      arco graduado no Hero e logo com fundo transparente (`public/brand/logo.png`)
- [x] Organização do projeto: `README.md` real (mapa, assets, como rodar), `scripts/` em `coleta/` e `diagnostico/`
      com `scripts/README.md`, caminhos corrigidos (`.claude/launch.json`, scripts que liam planilhas fora do projeto),
      `.gitignore` para dados e credenciais locais, scripts `npm test` e `npm run typecheck`
- **Atenção:** os commits de design estão só no computador; **nada foi publicado** no Netlify (cada deploy gasta créditos:
  publicar tudo de uma vez quando o Mark autorizar)
- **Decisões em aberto:** publicar os commits; mover `CódigoGihTube/` (códigos de recuperação do GitHub) para um
  gerenciador de senhas; `Claude outputs/` guarda uma cópia idêntica do `PRD.md` e pode ser apagada

---

## Em andamento

- [ ] **Aguardando recuperação da senha do Registro.br** (Mark + Layla)
- [ ] Mark coletando materiais com a Layla (fotos, textos, credenciais)

---

## Próxima tarefa (PRONTO PARA EXECUTAR)

### Etapa 1 do PRD: Blindagem do banco

**Pré-requisitos:**
- Acesso ao painel Supabase confirmado ✅

**Tarefas:**
1. Fazer backup manual do banco (snapshot no painel Supabase)
2. Criar tag `v1-before-public-site` no git
3. Upgrade do Supabase para o plano Pro
4. Rodar script SQL para revogar execução anônima das funções
   `SECURITY DEFINER`:
   - `notificar_novo_cadastro`
   - `ping`
   - `rls_auto_enable`
5. Rodar script SQL para criar tabela `public_leads` com RLS
6. Ativar proteção contra senhas vazadas no Supabase Auth
7. Validar: zero alertas críticos no advisor do Supabase

**Comando sugerido para abrir a próxima sessão:**
> "Vamos executar a Etapa 1 do PRD. Leia AGENTS.md, CLAUDE.md,
> PRD.md seção 7.1, e me mostre o script SQL completo antes de
> rodar qualquer coisa."

---

## Decisões em aberto

1. **Senha Registro.br** — bloqueador para Etapa 5. Não bloqueia
   Etapa 1 a 4. Resolver em paralelo.
2. **Algoritmo de 3 por dia (fase 2):** opção A (ranking) ou B
   (mistura de chance)? Decisão depois do lançamento da v1.

---

## Arquivos criados nesta sessão

- `AGENTS.md` (raiz)
- `CLAUDE.md` (raiz)
- `STATUS.md` (raiz)
- `PRD.md` (raiz) — versão 4.1
- Estrutura `materiais-site/` fora do repositório

---

## Lembretes operacionais

- **Prazo apertado.** Avisar o Mark se qualquer etapa estiver
  atrasando antes de ela virar bloqueador.
- **Arquivos protegidos em `src/lib/`** — não alterar sem
  autorização em `STATUS.md`.
- **Testar `npm run build` antes de cada PR.**

