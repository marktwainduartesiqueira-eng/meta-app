import { mapColumns, sheetModality, type Rows } from "../import/compilado";
import { normalizeText } from "./status";
import type { ModalityCode, SheetCollection } from "./types";

export interface TemplateEntry {
  sheet: string;
  modality: ModalityCode;
  /** Índice da linha (base 0) dentro do array de linhas da aba. */
  rowIndex: number;
  uf: string;
  iesCodigo: string;
  iesNome: string;
  campus: string;
  municipio: string;
  cursoCodigo: string;
}

export interface TemplateIndex {
  entries: TemplateEntry[];
  /** Colunas (base 0) por modalidade, lidas dos cabeçalhos. */
  columns: Partial<Record<ModalityCode, Record<string, number>>>;
}

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v).replace(/\s+/g, " ").trim());

/** Indexa as linhas de dados de cada aba da planilha-base (IES na coluna B, curso/campus na coluna C). */
export function indexTemplate(sheets: { name: string; rows: Rows }[]): TemplateIndex {
  const entries: TemplateEntry[] = [];
  const columns: TemplateIndex["columns"] = {};
  for (const sh of sheets) {
    const modality = sheetModality(sh.name);
    if (!modality) continue;
    columns[modality] = mapColumns(sh.rows) as Record<string, number>;
    sh.rows.forEach((row, rowIndex) => {
      if (rowIndex < 2) return;
      const b = str(row[1]);
      const iesCode = b.match(/\((\d+)\)/);
      const campusRaw = str(row[2]);
      const courseCode = campusRaw.match(/\((\d+)\)/);
      if (!iesCode || !courseCode) return;
      const campus = campusRaw.replace(/\s*\(\d+\)\s*$/, "").trim();
      entries.push({
        sheet: sh.name,
        modality,
        rowIndex,
        uf: str(row[0]).toUpperCase().slice(0, 2),
        iesCodigo: iesCode[1],
        iesNome: b.replace(/\s*\(\d+\).*$/, "").trim(),
        campus,
        municipio: (campus.includes(":") ? campus.split(":").pop()! : campus).trim(),
        cursoCodigo: courseCode[1],
      });
    });
  }
  return { entries, columns };
}

export interface Suggestion {
  entry: TemplateEntry;
  score: number;
}

export interface MatchResult {
  /** "auto" = correspondência segura; "revisar" = escolha manual necessária. */
  status: "auto" | "revisar";
  entry: TemplateEntry | null;
  suggestions: Suggestion[];
  reason: string;
}

function tokens(s: string): Set<string> {
  return new Set(
    normalizeText(s)
      .replace(/[^A-Z0-9 ]/g, " ")
      .split(" ")
      .filter((t) => t.length > 2 && !["DE", "DA", "DO", "DOS", "DAS", "CAMPUS", "CENTRO", "UNIVERSIDADE", "FACULDADE"].includes(t)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach((t) => b.has(t) && inter++);
  return inter / (a.size + b.size - inter);
}

/** O município da lista aparece no texto livre do campus/IES da planilha-base (ex.: "Campus Palmas/TO"). */
function cityMatches(c: SheetCollection, e: TemplateEntry): boolean {
  const city = normalizeText(c.meta.municipio);
  if (!city) return false;
  return normalizeText(`${e.campus} ${e.iesNome}`).includes(city);
}

function score(c: SheetCollection, e: TemplateEntry): number {
  const m = c.meta;
  let s = 0;
  if (m.iesCodigo === e.iesCodigo) s += 50;
  if (m.cursoCodigo === e.cursoCodigo) s += 40;
  if (m.uf && m.uf === e.uf) s += 10;
  if (cityMatches(c, e)) s += 25;
  s += 20 * jaccard(tokens(m.iesNome), tokens(e.iesNome));
  s += 10 * jaccard(tokens(m.campus), tokens(e.campus));
  return s;
}

/**
 * Casa uma faculdade coletada com uma linha da planilha-base da mesma modalidade.
 * Automático só com IES + código do curso iguais; ou IES igual com município igual e candidato único.
 */
export function matchToTemplate(c: SheetCollection, idx: TemplateIndex): MatchResult {
  if (!c.modality) return { status: "revisar", entry: null, suggestions: [], reason: "MODALIDADE NÃO RECONHECIDA" };
  const pool = idx.entries.filter((e) => e.modality === c.modality);
  const suggestions = pool
    .map((entry) => ({ entry, score: score(c, entry) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const exact = pool.filter((e) => e.iesCodigo === c.meta.iesCodigo && e.cursoCodigo === c.meta.cursoCodigo);
  if (exact.length === 1) return { status: "auto", entry: exact[0], suggestions, reason: "" };
  if (exact.length > 1) {
    return { status: "revisar", entry: null, suggestions, reason: "VÁRIAS LINHAS COM O MESMO CÓDIGO DE CURSO" };
  }

  // Os códigos de curso mudam entre edições; IES igual + UF igual + município igual (e único) é seguro.
  const sameCity = pool.filter(
    (e) => e.iesCodigo === c.meta.iesCodigo && (!c.meta.uf || c.meta.uf === e.uf) && cityMatches(c, e),
  );
  if (sameCity.length === 1) return { status: "auto", entry: sameCity[0], suggestions, reason: "" };
  if (sameCity.length > 1) {
    return { status: "revisar", entry: null, suggestions, reason: "VÁRIAS LINHAS COM A MESMA IES E MUNICÍPIO" };
  }
  return { status: "revisar", entry: null, suggestions, reason: "FACULDADE NÃO CORRESPONDIDA" };
}
