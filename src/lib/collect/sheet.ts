import { classifyStatus, normalizeText, resolveModality } from "./status";
import { collectIndicators } from "./rules";
import type { Candidate, ModalityCode, SheetCollection, SheetMeta } from "./types";

type Cell = string | number | boolean | null | undefined;
export type Rows = Cell[][];

const str = (v: Cell) => (v === null || v === undefined ? "" : String(v).trim());

const HEADER_LABELS: Record<string, keyof SheetMeta> = {
  "ESTADO:": "uf",
  "MUNICIPIO:": "municipio",
  "CURSO:": "cursoNome",
  "IES:": "iesNome",
  "CONCEITO DO CURSO:": "conceito",
  "TIPO DE VAGA:": "tipoVaga",
  "MODALIDADE DE CONCORRENCIA:": "modalidadeConcorrencia",
};

function splitCode(text: string): { name: string; code: string } {
  const m = text.match(/^(.*?)\s*-?\s*C[ÓO]DIGO:\s*(\d+)\s*$/i);
  return m ? { name: m[1].trim(), code: m[2] } : { name: text, code: "" };
}

/** Lê o cabeçalho pelos rótulos (coluna A) e não por posição fixa. */
export function parseSheetMeta(rows: Rows): SheetMeta | null {
  const meta: SheetMeta = {
    uf: "",
    municipio: "",
    cursoNome: "",
    cursoCodigo: "",
    iesNome: "",
    iesCodigo: "",
    conceito: "",
    tipoVaga: "",
    modalidadeConcorrencia: "",
    campus: "",
  };
  let found = 0;
  for (const row of rows.slice(0, 30)) {
    const key = HEADER_LABELS[normalizeText(str(row[0]))];
    if (!key) continue;
    const value = str(row[1]);
    found++;
    if (key === "uf") meta.uf = value.split("-").pop()!.trim();
    else if (key === "cursoNome") {
      const { name, code } = splitCode(value);
      meta.cursoNome = name;
      meta.cursoCodigo = code;
    } else if (key === "iesNome") {
      const { name, code } = splitCode(value);
      meta.iesNome = name;
      meta.iesCodigo = code;
    } else meta[key] = value;
  }
  return found >= 5 && meta.cursoCodigo && meta.iesCodigo ? meta : null;
}

const RANK_RE = /^(\d+)\s*[°ºo]?\s*lugar/i;

function parseScore(v: Cell): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = str(v).replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Candidato real = linha com classificação "N° Lugar" e nome. As linhas de opções de curso são ignoradas. */
export function parseCandidates(rows: Rows): { candidates: Candidate[]; campus: string } {
  const candidates: Candidate[] = [];
  const campusCount = new Map<string, number>();
  for (const row of rows) {
    const m = str(row[0]).match(RANK_RE);
    const name = str(row[1]);
    if (!m || !name) continue;
    const statusRaw = str(row[7]);
    candidates.push({
      rank: Number(m[1]),
      name,
      score: parseScore(row[2]),
      inscription: str(row[3]),
      courseCode: str(row[4]).match(/\((\d+)\)\s*$/)?.[1] ?? "",
      statusRaw,
      status: classifyStatus(statusRaw),
    });
    const campus = str(row[6]).replace(/\s*\(\d+\)\s*$/, "");
    if (campus) campusCount.set(campus, (campusCount.get(campus) ?? 0) + 1);
  }
  const campus = [...campusCount].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  return { candidates, campus };
}

export interface ParsedSheet {
  sheetName: string;
  meta: SheetMeta;
  modality: ModalityCode | null;
  /** Candidatos do curso da própria aba, na ordem da lista. */
  candidates: Candidate[];
  /** Linhas de outro campus/curso encontradas na aba (ignoradas). */
  foreign: number;
}

/** Lê uma aba sem calcular indicadores. Retorna null quando não é uma lista de candidatos (ex.: "Página170"). */
export function parseSheet(sheetName: string, rows: Rows): ParsedSheet | null {
  const meta = parseSheetMeta(rows);
  if (!meta) return null;
  const parsed = parseCandidates(rows);
  // Algumas abas trazem linhas de outros campi da mesma IES (outro código de curso):
  // só entram na coleta as linhas do curso da própria aba.
  const candidates = parsed.candidates.filter((c) => !c.courseCode || c.courseCode === meta.cursoCodigo);
  meta.campus = parsed.campus;
  return {
    sheetName,
    meta,
    modality: resolveModality(meta.tipoVaga, meta.modalidadeConcorrencia),
    candidates,
    foreign: parsed.candidates.length - candidates.length,
  };
}

/**
 * Junta abas que pertencem ao mesmo curso e modalidade (ex.: "AC AC - Tabela 1" e "Tabela 2"),
 * sem contar o mesmo candidato duas vezes, e aplica as regras de coleta.
 */
export function collectGroup(parts: ParsedSheet[]): SheetCollection {
  const first = parts[0];
  const seen = new Map<string, Candidate>();
  const merged: Candidate[] = [];
  let conflict = false;
  for (const part of parts) {
    for (const c of part.candidates) {
      const key = c.inscription ? `${c.inscription}|${c.courseCode}` : "";
      const prev = key ? seen.get(key) : undefined;
      if (prev) {
        if (prev.statusRaw !== c.statusRaw || prev.rank !== c.rank) conflict = true;
        continue;
      }
      if (key) seen.set(key, c);
      merged.push(c);
    }
  }
  if (parts.length > 1) merged.sort((a, b) => a.rank - b.rank);

  const result = collectIndicators(merged);
  const foreign = parts.reduce((n, p) => n + p.foreign, 0);
  if (foreign > 0) result.revisar.push(`LISTA TEM ${foreign} LINHAS DE OUTRO CURSO (IGNORADAS) — CONFIRMAR`);
  if (conflict) result.revisar.push("DUPLICIDADE DUVIDOSA ENTRE TABELAS (situação ou posição diferente)");
  if (!first.modality) {
    result.revisar.push(
      `MODALIDADE NÃO RECONHECIDA (${first.meta.tipoVaga} / ${first.meta.modalidadeConcorrencia})`,
    );
  }
  return {
    sheetName: parts.map((p) => p.sheetName).join(" + "),
    meta: first.meta,
    modality: first.modality,
    result,
  };
}

/** Processa uma aba completa. Retorna null quando a aba não é uma lista de candidatos. */
export function collectSheet(sheetName: string, rows: Rows): SheetCollection | null {
  const parsed = parseSheet(sheetName, rows);
  return parsed ? collectGroup([parsed]) : null;
}
