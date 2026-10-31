import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { buildCollections } from "./pipeline";
import { parseSheet, type Rows } from "./sheet";
import { indexTemplate, matchToTemplate, type TemplateEntry } from "./template";
import { fillTemplate, fitRowHeights } from "./fill-template";

describe("altura das linhas", () => {
  const xml =
    '<worksheet><cols><col min="2" max="2" width="40.5"/><col min="3" max="3" width="12.63"/></cols><sheetData>' +
    '<row r="1" ht="15.75" customHeight="1"><c r="B1" t="s"><v>0</v></c><c r="C1" t="s"><v>1</v></c></row>' +
    '<row r="2" ht="15.75" customHeight="1"><c r="B2" t="s"><v>2</v></c><c r="C2" t="s"><v>3</v></c></row>' +
    '<row r="3" ht="80" customHeight="1"><c r="B3" t="s"><v>2</v></c></row>' +
    "</sheetData></worksheet>";
  const strings = [
    "FACULDADE DE CIÊNCIAS MEDICAS DE MINAS GERAIS - FCMMG (351)",
    "Campus Sede - Belo Horizonte (659414)",
    "UNIVERSIDADE CURTA (1)",
    "Campus (2)",
  ];
  it("aumenta só as linhas cujo texto não cabe e nunca diminui", () => {
    const r = fitRowHeights(xml, strings);
    expect(r.adjusted).toBe(1);
    const h = (n: number) => Number(r.xml.match(new RegExp(`<row r="${n}" ht="([\\d.]+)"`))![1]);
    expect(h(1)).toBeGreaterThan(40);
    expect(h(2)).toBe(15.75);
    expect(h(3)).toBe(80);
  });
});

const header = (course = "111"): Rows => [
  ["DADOS DA CONSULTA"],
  ["ESTADO:", "SÃO PAULO - SP"],
  ["MUNICÍPIO:", "BAURU"],
  ["CURSO:", `MEDICINA - BACHARELADO - CÓDIGO: ${course}`],
  ["IES:", "UNIVERSIDADE NOVE DE JULHO - CÓDIGO: 316"],
  ["CONCEITO DO CURSO:", "5"],
  ["TIPO DE VAGA:", "FIES"],
  ["MODALIDADE DE CONCORRÊNCIA:", "AMPLA"],
  [],
  ["Classificação"],
];
const cand = (rank: number, status: string, insc = String(rank), course = "111"): Rows[number] => [
  `${rank}° Lugar`, `A${rank}`, 800 - rank, insc, `MEDICINA (${course})`, "", "X (316)", status,
];

describe("consolidação de Tabela 1 e 2", () => {
  const t1: Rows = [...header(), cand(1, "PRE-SELECIONADO"), cand(2, "Postergada")];
  const t2: Rows = [...header(), cand(2, "Postergada"), cand(3, "LISTA DE ESPERA"), cand(4, "LISTA DE ESPERA"), cand(5, "LISTA DE ESPERA")];

  it("junta as duas listas sem contar o mesmo candidato duas vezes", () => {
    const parsed = [parseSheet("AC AC - Tabela 1", t1)!, parseSheet("AC AC - Tabela 2", t2)!];
    const out = buildCollections(parsed);
    expect(out).toHaveLength(1);
    const r = out[0].collection.result;
    expect(r.inscritos).toBe(5);
    expect(r.preSelecionados).toBe(1);
    expect(r.postergados).toBe(1);
    expect(r.posicaoUltimoChamado).toBe(2);
    expect(r.revisar).toEqual([]);
  });

  it("duplicata com situação diferente vai para revisão", () => {
    const t2b: Rows = [...header(), cand(2, "DESISTIU DA OPÇÃO"), cand(3, "LISTA DE ESPERA"), cand(4, "LISTA DE ESPERA"), cand(5, "LISTA DE ESPERA")];
    const out = buildCollections([parseSheet("a", t1)!, parseSheet("b", t2b)!]);
    expect(out[0].collection.result.revisar.some((x) => x.startsWith("DUPLICIDADE DUVIDOSA"))).toBe(true);
  });
});

const base: Rows = [
  ["", "Faculdades de Medicina", "Campus - cidade"],
  ["", "Legenda", "", "", "", "Nº inscritos faculdade", "Nº Pré- selecionados", "Nº postergados", "Nº Desistentes", "Nº reprovados", "Posição último chamado", "NOTA ENEM - último aprovado", "Tx Rotação"],
  ["SP", "Estado: SÃO PAULO - SP"],
  ["SP", "UNIVERSIDADE NOVE DE JULHO (316)", "Bauru (111)"],
  ["SP", "UNIVERSIDADE NOVE DE JULHO (316)", "São Paulo (999)"],
  ["SP", "Faculdade Outra (50)", "Marília (7)"],
];

describe("correspondência com a planilha-base", () => {
  const idx = indexTemplate([{ name: "AC", rows: base }]);
  const col = (code: string, mun = "BAURU", ies = "316") =>
    buildCollections([parseSheet("x", [...header(code).map((r) => (r[0] === "MUNICÍPIO:" ? ["MUNICÍPIO:", mun] : r[0] === "IES:" ? ["IES:", `UNIVERSIDADE - CÓDIGO: ${ies}`] : r)), cand(1, "PRE-SELECIONADO"), cand(2, "LISTA DE ESPERA"), cand(3, "LISTA DE ESPERA"), cand(4, "LISTA DE ESPERA")])!])[0].collection;

  it("casa automaticamente por IES + código do curso", () => {
    const m = matchToTemplate(col("111"), idx);
    expect(m.status).toBe("auto");
    expect(m.entry?.municipio).toBe("Bauru");
  });
  it("não casa quando só o nome é parecido", () => {
    const m = matchToTemplate(col("555", "CAMPINAS"), idx);
    expect(m.status).toBe("revisar");
    expect(m.entry).toBeNull();
    expect(m.suggestions.length).toBeGreaterThan(0);
  });
  it("código de curso mudou entre edições: casa por IES + município quando único", () => {
    const m = matchToTemplate(col("222", "BAURU"), idx);
    expect(m.status).toBe("auto");
    expect(m.entry?.cursoCodigo).toBe("111");
  });
  it("IES igual mas município sem correspondência vai para revisão", () => {
    const m = matchToTemplate(col("222", "MARÍLIA"), idx);
    expect(m.status).toBe("revisar");
    expect(m.entry).toBeNull();
  });
  it("indexa as colunas pelos cabeçalhos", () => {
    expect(idx.columns["AC"]).toMatchObject({ inscritos: 5, pre: 6, pos: 10, nota: 11 });
  });
});

describe("preenchimento da planilha-base", () => {
  it("escreve só nas células de indicadores e preserva o resto", async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("AC");
    base.forEach((r, i) => r.forEach((v, c) => v !== "" && (ws.getRow(i + 1).getCell(c + 1).value = v as string)));
    ws.getCell("D4").value = 771.7;
    ws.getCell("D4").numFmt = "0.00";
    const bytes = (await wb.xlsx.writeBuffer()) as ArrayBuffer;

    const idx = indexTemplate([{ name: "AC", rows: base }]);
    const entry = idx.entries[0] as TemplateEntry;
    const out = await fillTemplate(bytes, idx, [{ entry, values: { inscritos: 10, preSelecionados: 2, postergados: 0, desistentes: 1, reprovados: 3, posicaoUltimoChamado: 7, notaUltimoAprovado: 700.5 } }], {});
    const res = new ExcelJS.Workbook();
    await res.xlsx.load(out.bytes);
    const w = res.getWorksheet("AC")!;
    expect(w.getCell("F4").value).toBe(10);
    expect(w.getCell("K4").value).toBe(7);
    expect(w.getCell("L4").value).toBe(700.5);
    expect(w.getCell("M4").value).toBeNull(); // TX rotação nunca é escrita
    expect(w.getCell("D4").value).toBe(771.7);
    expect(w.getCell("B5").value).toBe("UNIVERSIDADE NOVE DE JULHO (316)");
    expect(w.getCell("D4").numFmt).toBe("0.00");
  });
});
