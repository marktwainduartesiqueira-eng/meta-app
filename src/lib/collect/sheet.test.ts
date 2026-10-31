import { describe, expect, it } from "vitest";
import { collectSheet, type Rows } from "./sheet";

const header = (tipo = "FIES", mod = "AMPLA"): Rows => [
  ["DADOS DA CONSULTA"],
  ["ESTADO:", "TOCANTINS - TO"],
  ["MUNICÍPIO:", "PALMAS"],
  ["CURSO:", "MEDICINA - BACHARELADO - CÓDIGO: 111"],
  ["IES:", "FACULDADE X - CÓDIGO: 999"],
  ["CONCEITO DO CURSO:", "5.0"],
  ["TIPO DE VAGA:", tipo],
  ["MODALIDADE DE CONCORRÊNCIA:", mod],
  [],
  ["Classificação", "Nome", "Nota Enem", "Código da inscrição", "Curso", "Turno", "IES", "Situação"],
];

const cand = (rank: number, status: string, course = "111", insc = String(rank)): Rows[number] => [
  `${rank}° Lugar`,
  `ALUNO ${rank}`,
  800 - rank,
  insc,
  `MEDICINA (${course})`,
  "INTEGRAL",
  "FACULDADE X - SEDE (999)",
  status,
];

describe("collectSheet", () => {
  it("lê cabeçalho por rótulo, ignora linhas de opções e vazias", () => {
    const rows: Rows = [
      ...header(),
      cand(1, "PRE-SELECIONADO"),
      ["", "", "", "", "", "", "", "", "", "", "Opção 1 - Curso: 1/MEDICINA"],
      [],
      cand(2, "Postergada"),
      cand(3, "LISTA DE ESPERA"),
      cand(4, "LISTA DE ESPERA"),
      cand(5, "LISTA DE ESPERA"),
    ];
    const out = collectSheet("TO - X", rows)!;
    expect(out.meta).toMatchObject({ uf: "TO", cursoCodigo: "111", iesCodigo: "999", municipio: "PALMAS" });
    expect(out.modality).toBe("AC");
    expect(out.result.inscritos).toBe(5);
    expect(out.result.preSelecionados).toBe(1);
    expect(out.result.postergados).toBe(1);
    expect(out.result.posicaoUltimoChamado).toBe(2);
    expect(out.result.notaUltimoAprovado).toBe(798);
    expect(out.result.revisar).toEqual([]);
  });

  it("ignora linhas de outro campus e sinaliza para confirmação", () => {
    const rows: Rows = [
      ...header("FIES SOCIAL", "PPIQ"),
      cand(1, "PRE-SELECIONADO"),
      cand(1, "Não formou turma", "222"),
      cand(2, "LISTA DE ESPERA"),
      cand(3, "LISTA DE ESPERA"),
      cand(4, "LISTA DE ESPERA"),
    ];
    const out = collectSheet("X", rows)!;
    expect(out.modality).toBe("CAD - PPIQ");
    expect(out.result.inscritos).toBe(4);
    expect(out.result.revisar[0]).toMatch(/OUTRO CURSO/);
  });

  it("modalidade desconhecida vai para revisão", () => {
    const rows: Rows = [...header("FIES", "XYZ"), cand(1, "PRE-SELECIONADO"), cand(2, "LISTA DE ESPERA"), cand(3, "LISTA DE ESPERA"), cand(4, "LISTA DE ESPERA")];
    const out = collectSheet("X", rows)!;
    expect(out.modality).toBeNull();
    expect(out.result.revisar.some((r) => r.startsWith("MODALIDADE NÃO RECONHECIDA"))).toBe(true);
  });

  it("aba sem cabeçalho de curso é ignorada", () => {
    expect(collectSheet("Página170", [["lixo"], []])).toBeNull();
  });
});
