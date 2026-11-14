# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Equipe interna da Metta Estudantil (assessoria de FIES): cerca de 7 pessoas em vários locais do Brasil, muitas vezes no celular, atendendo alunos com prazo curto. Dois papéis: **Admin** (tudo, incluindo importar histórico e aprovar usuários) e **Consultor** (tudo, menos importar histórico). Há dois admins, entre eles a Layla.

Tarefa central: informar a nota do ENEM de um aluno, ver as 5 melhores faculdades com a chance estimada e entregar um relatório em PDF.

## Product Purpose

Plataforma interna que coleta dados das planilhas brutas do MEC para a Tabela Modelo, pesquisa faculdades por nota, modalidade, estado e IES com histórico por edição (2024.2, 2025.1, 2025.2, 2026.1), estima a chance de aprovação, gera relatório PDF personalizado e registra quem alterou o quê (auditoria). Sucesso: o consultor responde ao aluno com segurança e rapidez, sem erro de dado.

## Positioning

Ferramenta feita sob medida para o método da Metta: histórico por edição com posição do último chamado, cota de faculdades por estado e relatório de uma página com a marca.

## Operating Context

- Login com aprovação: o primeiro cadastro vira admin; os demais ficam pendentes até um admin aprovar.
- Dados em Supabase (RLS e auditoria); hospedagem no Netlify, com créditos limitados: publicar em lote, só quando o usuário pedir.
- O relatório PDF leva a marca Metta, QR code e contato.

## Capabilities and Constraints

- **As funções não mudam:** pesquisa, estimativa de chance, coleta, importação de histórico, PDF e auditoria permanecem como estão. Mudanças são só de design e responsividade do web app.
- **Intocáveis por decisão do usuário:** o estilo do relatório em PDF e a forma como os gráficos são construídos (`mini-chart.tsx`, `history-chart.tsx`). Nenhum comportamento novo (carregamento, validação, confirmação, filtros).
- Arquivos protegidos (AGENTS.md): `src/lib/chance.ts`, `src/lib/collect/**`, `src/lib/import/**`, `src/lib/pdf/**`, `src/lib/supabase/**`. Alterar só com autorização explícita.
- Só o web app Metta Estudantil pode ser alterado; o projeto "Site Layla Panini" nunca é tocado.
- Dados reais apenas; nenhum dado de aluno fabricado.

## Brand Commitments

Marca Metta (logo em `public/brand/logo.jpg`, azul-noite e âmbar). O conceito "Painel de instrumentos" descrito no DESIGN.md é referência escolhida pelo usuário para o visual.

## Evidence on Hand

Banco com histórico real de 4 edições. Logo em JPG com fundo próprio; versão transparente não disponível.

## Product Principles

1. A nota do aluno e a resposta (chance + faculdades) são o centro do app.
2. Clareza e rapidez antes de decoração: o consultor usa o app dezenas de vezes por dia.
3. Nunca esconder incerteza: a chance é estimativa histórica, sem garantia.
4. Nada de mudança de função disfarçada de mudança visual.

## Accessibility & Inclusion

Uso frequente no celular: alvos de toque de 44px e fontes de 16px nos campos. Contraste mínimo AA.
