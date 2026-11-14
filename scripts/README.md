# Scripts de verificação manual

Rode sempre da **raiz do projeto**, com `npx tsx <script>` (os `.mjs` com `node`). Eles só leem planilhas; não escrevem
no banco. As planilhas ficam em `Tabelas/` (pasta local, fora do git).

## `coleta/` — motor de coleta (planilha bruta do MEC → Tabela Modelo)

| Script | Uso |
|---|---|
| `run-collect.ts <bruta.xlsx>` | executa a coleta e imprime um resumo |
| `run-match.ts <bruta.xlsx> <Tabela Modelo.xlsx>` | mostra a correspondência com a planilha-base |
| `run-fill.ts <bruta.xlsx> <Tabela Modelo.xlsx> <saida.xlsx>` | preenche a Tabela Modelo e salva |

## `diagnostico/` — inspeção de planilhas

| Script | Uso |
|---|---|
| `check-compilado.ts` | confere as colunas dos compilados 25.1, 25.2 e 26.1 em `Tabelas/` |
| `check-dupkeys.ts` | procura chaves duplicadas nos compilados em `Tabelas/` |
| `check-blocks.ts`, `check-dups.ts`, `check-foreign.ts <bruta.xlsx>` | blocos, duplicidades e candidatos de outro curso |
| `peek-sheet.ts <arquivo> <aba> [de] [ate]` | mostra linhas de uma aba da planilha bruta |
| `peek-compilado.ts <arquivo> <aba>` | mostra uma aba do compilado |
| `peek-tpl.ts <Tabela Modelo.xlsx>` | mostra a estrutura da Tabela Modelo |
| `scan-raw.mjs <bruta.xlsx>` | situações, tipos de vaga e modalidades reais da planilha |
| `diff-xlsx.mjs <a.xlsx> <b.xlsx>` | compara duas planilhas |

Exemplo:

```bash
npx tsx scripts/diagnostico/check-compilado.ts
npx tsx scripts/coleta/run-collect.ts "Tabelas/AC AC - Fies 26.2.xlsx"
```
