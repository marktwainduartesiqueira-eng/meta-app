import { normalizeText } from "../collect/status";
import type { ModalityCode } from "../collect/types";

type Cell = string | number | boolean | null | undefined;
export type Rows = Cell[][];

export interface CompiladoRecord {
  uf: string;
  mesorregiao: string;
  iesCodigo: string;
  iesNome: string;
  campus: string;
  municipio: string;
  cursoCodigo: string;
  /** Identidade estável do curso: IES + campus normalizado. */
  chave: string;
  modality: ModalityCode;
  notaCorte: number | null;
  vagas: number | null;
  inscritos: number | null;
  preSelecionados: number | null;
  postergados: number | null;
  desistentes: number | null;
  reprovados: number | null;
  posUltimoChamado: number | null;
  notaUltimoAprovado: number | null;
  txRotacao: number | null;
  extras: Record<string, unknown>;
  info: {
    inicioCurso: number | null;
    conceitoMec: string | null;
    enamed: number | null;
    tipoEnsino: string | null;
    indiceIndexacao: number | null;
    expectativaSalario: number | null;
  };
}

const str = (v: Cell) => (v === null || v === undefined ? "" : String(v).replace(/\s+/g, " ").trim());

/** Número tolerante: "241°", "R$ 1.518,00", "2533.08", "," → null. */
export function parseNumber(v: Cell): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  let s = str(v).replace(/[R$°º\s]/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function sheetModality(sheetName: string): ModalityCode | null {
  const s = normalizeText(sheetName);
  const social = s.startsWith("CAD");
  if (!social && !s.startsWith("AC")) return null;
  const suffix = s.includes("PPIQ") ? " - PPIQ" : s.includes("PCD") ? " - PcD" : "";
  return `${social ? "CAD" : "AC"}${suffix}` as ModalityCode;
}

type Field =
  | "notaCorte"
  | "corte1Dia"
  | "vagas"
  | "inscritos"
  | "pre"
  | "postergados"
  | "desistentes"
  | "reprovados"
  | "pos"
  | "posErroSite"
  | "nota"
  | "tx"
  | "inicio"
  | "conceito"
  | "enamed"
  | "tipoEnsino"
  | "indice"
  | "salario";

/** Mapeia colunas pelos cabeçalhos (linhas 1–2), pois o layout muda entre edições. */
export function mapColumns(rows: Rows): Partial<Record<Field, number>> {
  const map: Partial<Record<Field, number>> = {};
  const width = Math.max(...rows.slice(0, 2).map((r) => r.length), 0);
  for (let c = 2; c < width; c++) {
    const h0 = normalizeText(str(rows[0]?.[c]));
    const h1 = normalizeText(str(rows[1]?.[c]));
    const h = `${h0} | ${h1}`;
    const set = (f: Field) => {
      if (map[f] === undefined) map[f] = c;
    };
    if (h1.includes("1O DIA") || h1.includes("1º DIA") || /1. DIA/.test(h1)) set("corte1Dia");
    else if (h.includes("NOTA CORTE") || h1.includes("FINAL") || /^\d.? DIA$/.test(h1) || h1 === "CORTE")
      set("notaCorte");
    if (h0.includes("N DE VAGAS") || h0.includes("Nº DE VAGAS") || /N.{1,2} DE VAGAS/.test(h0)) set("vagas");
    if (h1.includes("INSCRITOS")) set("inscritos");
    if (/PRE-? ?SELECIONADOS/.test(h1)) set("pre");
    if (h1.includes("POSTERGADOS")) set("postergados");
    if (h1.includes("DESISTENTES")) set("desistentes");
    if (h1.includes("REPROVADOS")) set("reprovados");
    if (h1.includes("POSICAO ULTIMO CHAMADO")) set(h1.includes("ERRO SITE") ? "posErroSite" : "pos");
    if (h1.startsWith("NOTA ENEM")) set("nota");
    if (h1.startsWith("TX ROTACAO")) set("tx");
    if (h1.includes("DATA INICIO")) set("inicio");
    if (h1.includes("CONCEITO MEC")) set("conceito");
    if (h0.includes("ENAMED")) set("enamed");
    if (h1.includes("TIPO ENSINO")) set("tipoEnsino");
    if (h1.includes("INDICE DE INDEXACAO")) set("indice");
    if (h1.includes("VALOR EXPECTATIVA")) set("salario");
  }
  return map;
}

/** Lê uma aba dos "Dados Compilados". Linhas de dados têm código da IES (col B) e do curso (col C). */
export function parseCompiladoSheet(sheetName: string, rows: Rows): CompiladoRecord[] {
  const modality = sheetModality(sheetName);
  if (!modality) return [];
  const col = mapColumns(rows);
  const out: CompiladoRecord[] = [];
  let mesorregiao = "";

  for (const row of rows.slice(2)) {
    const b = str(row[1]);
    if (/^MESORREGI/.test(normalizeText(b))) {
      mesorregiao = b.replace(/^[^:]*:\s*/, "");
      continue;
    }
    const iesCodeMatch = b.match(/\((\d+)\)/);
    const campusRaw = str(row[2]);
    const campusCode = campusRaw.match(/\((\d+)\)/);
    if (!iesCodeMatch || !campusCode) continue;
    const iesCodigo = iesCodeMatch[1];
    const iesNome = b.replace(/\s*\(\d+\).*$/, "").trim();
    const campus = campusRaw.replace(/\s*\(\d+\)\s*$/, "").trim();
    const municipio = (campus.includes(":") ? campus.split(":").pop()! : campus).trim();

    const num = (f: Field) => (col[f] === undefined ? null : parseNumber(row[col[f]!]));
    const txt = (f: Field) => (col[f] === undefined ? "" : str(row[col[f]!]));

    const rec: CompiladoRecord = {
      uf: str(row[0]).toUpperCase().slice(0, 2),
      mesorregiao,
      iesCodigo,
      iesNome,
      campus,
      municipio,
      cursoCodigo: campusCode[1],
      chave: `${iesCodigo}|${normalizeText(campus)}`,
      modality,
      notaCorte: num("notaCorte"),
      vagas: num("vagas"),
      inscritos: num("inscritos"),
      preSelecionados: num("pre"),
      postergados: num("postergados"),
      desistentes: num("desistentes"),
      reprovados: num("reprovados"),
      posUltimoChamado: num("pos"),
      notaUltimoAprovado: num("nota"),
      txRotacao: num("tx"),
      extras: {},
      info: {
        inicioCurso: num("inicio"),
        conceitoMec: txt("conceito") || null,
        enamed: num("enamed"),
        tipoEnsino: txt("tipoEnsino") || null,
        indiceIndexacao: num("indice"),
        expectativaSalario: num("salario"),
      },
    };
    const c1 = num("corte1Dia");
    if (c1 !== null) rec.extras.nota_corte_1dia = c1;
    const pe = num("posErroSite");
    if (pe !== null) rec.extras.pos_ultimo_chamado_erro_site = pe;
    rec.extras.codigo_curso = rec.cursoCodigo;

    // Linha sem nenhum dado numérico (ou só zeros) = faculdade que não participou da edição.
    const nums = [rec.notaCorte, rec.inscritos, rec.preSelecionados, rec.posUltimoChamado, rec.vagas];
    if (nums.every((n) => !n)) {
      if (rec.vagas === null && rec.notaCorte === null && rec.inscritos === null) continue;
    }
    if (rec.notaCorte === 0) rec.notaCorte = null;
    out.push(rec);
  }
  return out;
}
