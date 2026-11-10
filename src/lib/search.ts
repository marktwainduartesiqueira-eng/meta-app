import type { SupabaseClient } from "@supabase/supabase-js";
import { estimateChance, referenceScore, type ChanceResult } from "./chance";

/** 26 estados + Distrito Federal. */
export const ESTADOS: [string, string][] = [
  ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"], ["BA", "Bahia"], ["CE", "Ceará"],
  ["DF", "Distrito Federal"], ["ES", "Espírito Santo"], ["GO", "Goiás"], ["MA", "Maranhão"], ["MT", "Mato Grosso"],
  ["MS", "Mato Grosso do Sul"], ["MG", "Minas Gerais"], ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"],
  ["PE", "Pernambuco"], ["PI", "Piauí"], ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"], ["RO", "Rondônia"], ["RR", "Roraima"], ["SC", "Santa Catarina"],
  ["SP", "São Paulo"], ["SE", "Sergipe"], ["TO", "Tocantins"],
];
export const MODALIDADES = ["AC", "AC - PPIQ", "AC - PcD", "CAD", "CAD - PPIQ", "CAD - PcD"];

export type SearchParams = Record<string, string | undefined>;

export interface HistRow {
  course_id: number;
  ies_codigo: string;
  ies_nome: string;
  campus: string | null;
  municipio: string | null;
  uf: string;
  regiao: string;
  edicao: string;
  nota_corte: number | null;
  nota_ultimo_aprovado: number | null;
  vagas: number | null;
  pos_ultimo_chamado: number | null;
}

export interface SearchItem {
  id: number;
  info: HistRow;
  byEd: Map<string, HistRow>;
  res: ChanceResult;
}

/** Máximo de faculdades exibidas na pesquisa e no relatório PDF. */
export const MAX_RESULTS = 5;

/** Máximo de faculdades por estado quando a cota é informada. */
export const MAX_POR_ESTADO = 20;

/** Lê `SP:5,RN:1` (ou só `SP,RN`, que vale MAX_RESULTS por estado) em UF → quantidade. */
export function parseUfQuotas(raw: string): Map<string, number> {
  const out = new Map<string, number>();
  for (const part of raw.toUpperCase().split(",")) {
    const [uf, n] = part.split(":");
    if (!ESTADOS.some(([x]) => x === uf)) continue;
    const qtd = Math.min(MAX_POR_ESTADO, Math.max(1, Math.floor(Number(n)) || MAX_RESULTS));
    out.set(uf, qtd);
  }
  return out;
}

const CHANCE_RANK: Record<string, number> = { Alta: 0, Média: 1, Baixa: 2, Improvável: 3, "Sem histórico": 4 };

export interface SearchOutput {
  modalidade: string;
  nota: number | null;
  editions: string[];
  /** Até MAX_RESULTS itens, já ordenados. */
  list: SearchItem[];
  /** Total de faculdades que atendem aos filtros, antes do limite. */
  total: number;
  error: string | null;
}

export async function runSearch(supabase: SupabaseClient, sp: SearchParams): Promise<SearchOutput> {
  const modalidade = MODALIDADES.includes(sp.modalidade ?? "") ? sp.modalidade! : "AC";
  const parsed = sp.nota ? Number(sp.nota.replace(",", ".")) : null;
  const nota = parsed !== null && Number.isFinite(parsed) ? parsed : null;
  const q = (sp.q ?? "").trim();

  let query = supabase
    .from("v_historico")
    .select("course_id,ies_codigo,ies_nome,campus,municipio,uf,regiao,edicao,nota_corte,nota_ultimo_aprovado,vagas,pos_ultimo_chamado")
    .eq("modalidade", modalidade)
    .order("ies_nome")
    .limit(5000);
  if (sp.curso && /^\d+$/.test(sp.curso)) query = query.eq("course_id", Number(sp.curso));
  const quotas = parseUfQuotas(sp.uf ?? "");
  if (quotas.size) query = query.in("uf", [...quotas.keys()]);
  if (q) {
    const safe = q.replace(/[%,()*]/g, " ");
    query = /^\d+$/.test(safe)
      ? query.eq("ies_codigo", safe)
      : query.or(`ies_nome.ilike.%${safe}%,campus.ilike.%${safe}%,municipio.ilike.%${safe}%`);
  }
  const { data, error } = await query;
  const rows = (data ?? []) as HistRow[];

  const editions = [...new Set(rows.map((r) => r.edicao))].sort();
  const byCourse = new Map<number, { info: HistRow; byEd: Map<string, HistRow> }>();
  for (const r of rows) {
    const c = byCourse.get(r.course_id) ?? { info: r, byEd: new Map() };
    c.byEd.set(r.edicao, r);
    byCourse.set(r.course_id, c);
  }

  const list = [...byCourse.entries()]
    .map(([id, c]) => ({
      id,
      ...c,
      res: estimateChance(
        nota,
        editions.map((e) => ({ edicao: e, ref: c.byEd.get(e) ? referenceScore(c.byEd.get(e)!) : null })),
      ),
    }))
    .filter((c) => !sp.so_chances || ["Alta", "Média"].includes(c.res.chance));

  // Com nota informada: melhores chances primeiro (e, no empate, a referência mais recente mais alta).
  if (nota !== null) {
    const latest = (c: SearchItem) => {
      const last = [...editions].reverse().map((e) => c.byEd.get(e)).find((r) => r && referenceScore(r));
      return last ? (referenceScore(last) ?? 0) : 0;
    };
    list.sort((a, b) => CHANCE_RANK[a.res.chance] - CHANCE_RANK[b.res.chance] || latest(b) - latest(a));
  }

  let shown = list.slice(0, MAX_RESULTS);
  if (quotas.size) {
    // Cota por estado: as N melhores de cada UF, mantendo a ordem geral.
    const used = new Map<string, number>();
    shown = list.filter((c) => {
      const n = used.get(c.info.uf) ?? 0;
      if (n >= (quotas.get(c.info.uf) ?? 0)) return false;
      used.set(c.info.uf, n + 1);
      return true;
    });
  }

  return { modalidade, nota, editions, list: shown, total: list.length, error: error?.message ?? null };
}
