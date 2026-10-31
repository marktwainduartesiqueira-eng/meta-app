import { describe, expect, it } from "vitest";
import { collectIndicators } from "./rules";
import { classifyStatus, resolveModality } from "./status";
import type { Candidate } from "./types";

/** Monta candidatos a partir de siglas: P=pré-sel, G=postergada, D=desistiu, V=perdeu vaga,
 *  R=rejeitada CPSA, L=lista de espera, O=outro curso, X=outra situação. Nota = 800 - rank. */
function build(seq: string): Candidate[] {
  const map: Record<string, string> = {
    P: "PRE-SELECIONADO",
    G: "Postergada",
    D: "DESISTIU DA OPÇÃO",
    V: "Perdeu a vaga por decurso de prazo",
    R: "Rejeitada pela CPSA",
    L: "LISTA DE ESPERA",
    O: "SELEC. OUTRO CURSO",
    X: "Participação cancelada pelo candidato",
  };
  return [...seq].map((ch, i) => ({
    rank: i + 1,
    name: `C${i + 1}`,
    score: 800 - (i + 1),
    inscription: String(1000 + i),
    courseCode: "",
    statusRaw: map[ch],
    status: classifyStatus(map[ch]),
  }));
}

describe("classifyStatus", () => {
  it("reconhece variações de 'outro curso'", () => {
    expect(classifyStatus("SELEC. OUTRO CURSO")).toBe("OUTRO_CURSO");
    expect(classifyStatus("Selecionou outro curso")).toBe("OUTRO_CURSO");
  });
  it("ignora acento e caixa", () => {
    expect(classifyStatus("desistiu da opcao")).toBe("DESISTIU");
    expect(classifyStatus("POSTERGADA")).toBe("POSTERGADA");
    expect(classifyStatus("Pré-selecionado")).toBe("PRE_SELECIONADO");
  });
  it("situação desconhecida vira OUTRA", () => {
    expect(classifyStatus("Vencido")).toBe("OUTRA");
  });
});

describe("resolveModality", () => {
  it("mapeia as 6 modalidades", () => {
    expect(resolveModality("FIES", "AMPLA")).toBe("AC");
    expect(resolveModality("FIES", "PPIQ")).toBe("AC - PPIQ");
    expect(resolveModality("FIES", "PCD")).toBe("AC - PcD");
    expect(resolveModality("FIES SOCIAL", "AMPLA")).toBe("CAD");
    expect(resolveModality("FIES SOCIAL", "PPIQ")).toBe("CAD - PPIQ");
    expect(resolveModality("FIES SOCIAL", "PCD")).toBe("CAD - PcD");
  });
  it("não adivinha valores desconhecidos", () => {
    expect(resolveModality("OUTRO", "AMPLA")).toBeNull();
    expect(resolveModality("FIES", "XYZ")).toBeNull();
  });
});

describe("collectIndicators", () => {
  it("caso básico: corte no 1º da sequência de 3 listas de espera", () => {
    // rank:  1 2 3 4 5 6 7 8
    const r = collectIndicators(build("PPGDVLLL"));
    expect(r.corteClassificacao).toBe(6);
    expect(r.inscritos).toBe(8);
    expect(r.preSelecionados).toBe(2);
    expect(r.postergados).toBe(1);
    expect(r.desistentes).toBe(1);
    expect(r.reprovados).toBe(1);
    expect(r.posicaoUltimoChamado).toBe(5); // V, a última antes do corte
    expect(r.notaUltimoAprovado).toBe(795);
    expect(r.revisar).toEqual([]);
  });

  it("'outro curso' conta só em inscritos e não interrompe a sequência", () => {
    const r = collectIndicators(build("PGLOLOL"));
    expect(r.inscritos).toBe(7);
    expect(r.corteClassificacao).toBe(3);
    expect(r.preSelecionados).toBe(1);
    expect(r.postergados).toBe(1);
    expect(r.posicaoUltimoChamado).toBe(2);
  });

  it("lista de espera antes do último pré-selecionado é ignorada", () => {
    const r = collectIndicators(build("PLLLPGLLL"));
    expect(r.corteClassificacao).toBe(7);
    expect(r.preSelecionados).toBe(2);
    // a faixa inclui as LE do meio, que não entram em nenhum contador
    expect(r.posicaoUltimoChamado).toBe(6);
  });

  it("último chamado pula lista de espera e 'outro curso' ao subir", () => {
    const r = collectIndicators(build("PGLOLLL"));
    // sequência: L(3) L(5) L(6)?? 3 é LE, 4 é O, 5 LE, 6 LE → corte no 3
    expect(r.corteClassificacao).toBe(3);
    expect(r.posicaoUltimoChamado).toBe(2);
  });

  it("sem pré-selecionados: mesma regra, pré-sel. = 0", () => {
    const r = collectIndicators(build("GDLLL"));
    expect(r.preSelecionados).toBe(0);
    expect(r.corteClassificacao).toBe(3);
    expect(r.posicaoUltimoChamado).toBe(2);
  });

  it("sem sequência de 3 → REVISAR, sem corte inventado", () => {
    const r = collectIndicators(build("PGLLG"));
    expect(r.corteClassificacao).toBeNull();
    expect(r.posicaoUltimoChamado).toBeNull();
    expect(r.revisar).toContain("SEQUÊNCIA DE CORTE NÃO ENCONTRADA");
  });

  it("sequência de 3 só vale depois do último pré-selecionado", () => {
    const r = collectIndicators(build("LLLP"));
    expect(r.revisar).toContain("SEQUÊNCIA DE CORTE NÃO ENCONTRADA");
  });

  it("situação fora da lista é válida como último chamado", () => {
    const r = collectIndicators(build("PXLLL"));
    expect(r.posicaoUltimoChamado).toBe(2);
    expect(r.revisar).toEqual([]);
  });

  it("nota ausente no último chamado gera REVISAR", () => {
    const list = build("PGLLL");
    list[1].score = null;
    const r = collectIndicators(list);
    expect(r.notaUltimoAprovado).toBeNull();
    expect(r.revisar).toContain("NOTA ENEM AUSENTE OU ILEGÍVEL");
  });

  it("TX rotação nunca é calculada", () => {
    expect(collectIndicators(build("PGLLL")).txRotacao).toBeNull();
  });
});
