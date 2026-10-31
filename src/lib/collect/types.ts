export type ModalityCode = "AC" | "AC - PPIQ" | "AC - PcD" | "CAD" | "CAD - PPIQ" | "CAD - PcD";

export const MODALITY_ORDER: ModalityCode[] = [
  "AC",
  "AC - PPIQ",
  "AC - PcD",
  "CAD",
  "CAD - PPIQ",
  "CAD - PcD",
];

/** Categoria lógica de uma situação do candidato, já normalizada. */
export type StatusKind =
  | "PRE_SELECIONADO"
  | "POSTERGADA"
  | "DESISTIU"
  | "PERDEU_VAGA"
  | "REJEITADA_CPSA"
  | "LISTA_ESPERA"
  | "OUTRO_CURSO"
  | "OUTRA";

export interface Candidate {
  /** Classificação oficial (1, 2, 3...). */
  rank: number;
  name: string;
  /** Nota ENEM; null quando ausente ou ilegível. */
  score: number | null;
  /** Código da inscrição, usado para detectar duplicidade. */
  inscription: string;
  /** Código do curso da linha (coluna Curso), para separar listas que misturam campi da mesma IES. */
  courseCode: string;
  statusRaw: string;
  status: StatusKind;
}

export interface SheetMeta {
  uf: string;
  municipio: string;
  cursoNome: string;
  cursoCodigo: string;
  iesNome: string;
  iesCodigo: string;
  conceito: string;
  tipoVaga: string;
  modalidadeConcorrencia: string;
  /** Rótulo do campus (coluna "IES" dos candidatos), sem o código final. */
  campus: string;
}

export interface CollectIndicators {
  inscritos: number;
  preSelecionados: number;
  postergados: number;
  desistentes: number;
  reprovados: number;
  posicaoUltimoChamado: number | null;
  notaUltimoAprovado: number | null;
  txRotacao: null;
}

export interface CollectResult extends CollectIndicators {
  /** Classificação do candidato onde ocorre o corte (1º da sequência de 3 em lista de espera). */
  corteClassificacao: number | null;
  ultimoChamadoNome: string | null;
  ultimoChamadoSituacao: string | null;
  /** Vazio = VALIDADO. */
  revisar: string[];
}

export interface SheetCollection {
  sheetName: string;
  meta: SheetMeta;
  modality: ModalityCode | null;
  result: CollectResult;
}
