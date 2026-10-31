import type { ModalityCode, StatusKind } from "./types";

export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Converte o texto da coluna Situação em uma categoria lógica. */
export function classifyStatus(raw: string): StatusKind {
  const s = normalizeText(raw);
  if (/SELEC\w*\.? ?OUTRO CURSO/.test(s)) return "OUTRO_CURSO";
  if (/^PRE[- ]?SELECIONAD[OA]$/.test(s)) return "PRE_SELECIONADO";
  if (s.startsWith("POSTERGAD")) return "POSTERGADA";
  if (s === "DESISTIU DA OPCAO") return "DESISTIU";
  if (s === "PERDEU A VAGA POR DECURSO DE PRAZO") return "PERDEU_VAGA";
  if (s === "REJEITADA PELA CPSA") return "REJEITADA_CPSA";
  if (s === "LISTA DE ESPERA") return "LISTA_ESPERA";
  return "OUTRA";
}

/** FIES/FIES SOCIAL × AMPLA/PPIQ/PCD → aba oficial. Retorna null se não reconhecer. */
export function resolveModality(tipoVaga: string, modalidade: string): ModalityCode | null {
  const t = normalizeText(tipoVaga);
  const m = normalizeText(modalidade);
  const social = t === "FIES SOCIAL";
  if (t !== "FIES" && !social) return null;
  const suffix =
    m === "AMPLA" ? "" : m === "PPIQ" ? " - PPIQ" : m === "PCD" ? " - PcD" : null;
  if (suffix === null) return null;
  return `${social ? "CAD" : "AC"}${suffix}` as ModalityCode;
}
