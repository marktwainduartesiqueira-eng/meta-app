export type Chance = "Alta" | "Média" | "Baixa" | "Improvável" | "Sem histórico";

export interface EditionScore {
  edicao: string;
  /** Nota do último aprovado; se ausente, a nota de corte da planilha. */
  ref: number | null;
}

export interface ChanceResult {
  chance: Chance;
  refs: EditionScore[];
  media: number | null;
  maxima: number | null;
  minima: number | null;
  explicacao: string;
}

export function referenceScore(r: { nota_ultimo_aprovado: number | null; nota_corte: number | null }): number | null {
  const v = r.nota_ultimo_aprovado ?? r.nota_corte;
  return v && v > 0 ? v : null;
}

/**
 * Estimativa transparente: compara a nota do aluno com a nota de referência de cada edição.
 * Alta: ≥ maior referência · Média: ≥ média · Baixa: ≥ menor referência · Improvável: abaixo de todas.
 * É uma estimativa histórica, não uma garantia.
 */
export function estimateChance(nota: number | null, history: EditionScore[]): ChanceResult {
  const refs = history.filter((h) => h.ref !== null).sort((a, b) => a.edicao.localeCompare(b.edicao));
  if (refs.length === 0) {
    return { chance: "Sem histórico", refs: history, media: null, maxima: null, minima: null, explicacao: "Sem notas de referência nas edições carregadas." };
  }
  const vals = refs.map((h) => h.ref as number);
  const media = vals.reduce((a, b) => a + b, 0) / vals.length;
  const maxima = Math.max(...vals);
  const minima = Math.min(...vals);
  const base = { refs: history, media, maxima, minima };
  if (nota === null) return { ...base, chance: "Sem histórico", explicacao: "Informe a nota do aluno para estimar." };

  let chance: Chance;
  if (nota >= maxima) chance = "Alta";
  else if (nota >= media) chance = "Média";
  else if (nota >= minima) chance = "Baixa";
  else chance = "Improvável";

  const f = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return {
    ...base,
    chance,
    explicacao: `Nota ${f(nota)} · referência por edição: ${refs.map((h) => `${h.edicao}: ${f(h.ref as number)}`).join(", ")} · média ${f(media)}.`,
  };
}
