import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { estimateChance, referenceScore } from "@/lib/chance";
import HistoryChart from "./history-chart";

const MODALIDADES = ["AC", "AC - PPIQ", "AC - PcD", "CAD", "CAD - PPIQ", "CAD - PcD"];

type H = {
  modalidade: string;
  edicao: string;
  ies_nome: string;
  ies_codigo: string;
  campus: string | null;
  municipio: string | null;
  uf: string;
  regiao: string;
  nota_corte: number | null;
  nota_ultimo_aprovado: number | null;
  vagas: number | null;
  inscritos: number | null;
  pre_selecionados: number | null;
  postergados: number | null;
  desistentes: number | null;
  reprovados: number | null;
  pos_ultimo_chamado: number | null;
};

const f = (n: number | null) => (n === null || n === undefined ? "—" : n.toLocaleString("pt-BR", { maximumFractionDigits: 2 }));

export default async function CursoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^\d+$/.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("v_historico").select("*").eq("course_id", Number(id)).order("edicao");
  const rows = (data ?? []) as H[];
  if (rows.length === 0) notFound();

  const modalidade = MODALIDADES.includes(sp.modalidade ?? "") ? sp.modalidade! : rows[0].modalidade;
  const nota = sp.nota ? Number(sp.nota.replace(",", ".")) : null;
  const alunoNota = nota !== null && Number.isFinite(nota) ? nota : null;
  const mine = rows.filter((r) => r.modalidade === modalidade);
  const head = rows[0];

  const res = estimateChance(alunoNota, mine.map((r) => ({ edicao: r.edicao, ref: referenceScore(r) })));
  const chart = mine.map((r) => ({
    edicao: r.edicao,
    corte: r.nota_corte && r.nota_corte > 0 ? r.nota_corte : null,
    ultimo: r.nota_ultimo_aprovado && r.nota_ultimo_aprovado > 0 ? r.nota_ultimo_aprovado : null,
    aluno: alunoNota,
  }));

  return (
    <div className="space-y-6">
      <Link href="/pesquisa" className="text-sm text-brand hover:underline">← Voltar à pesquisa</Link>
      <div>
        <h1 className="t-title text-brand-dark">{head.ies_nome}</h1>
        <p className="text-sm text-muted">
          {head.campus} · {head.municipio}/{head.uf} · {head.regiao} · IES {head.ies_codigo}
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-4 border-t border-border pt-6">
        <label className="text-sm font-semibold">
          Modalidade
          <select name="modalidade" defaultValue={modalidade} className="mt-1 block rounded-xl border border-border bg-white px-3.5 py-2.5 text-base">
            {MODALIDADES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Nota do aluno
          <input name="nota" defaultValue={sp.nota ?? ""} className="mt-1 block w-32 rounded-xl border border-border bg-white px-3.5 py-2.5 text-base" />
        </label>
        <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand/90">Atualizar</button>
        {alunoNota !== null && (
          <div className="ml-auto text-right">
            <div className="text-sm text-muted">Chance estimada</div>
            <div className="font-display text-2xl font-extrabold text-brand">{res.chance}</div>
          </div>
        )}
      </form>
      {alunoNota !== null && <p className="text-sm text-muted">{res.explicacao} Estimativa histórica, sem garantia de aprovação.</p>}

      <div className="rise border-t border-border pt-6">
        <h2 className="t-caps mb-3 text-muted">Histórico de notas — {modalidade}</h2>
        {mine.length ? <HistoryChart data={chart} /> : <p className="text-sm text-muted">Sem registros nesta modalidade. Escolha outra modalidade acima e clique em Atualizar.</p>}
      </div>

      <div className="rise scroll-shadow overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="sticky-first w-full text-sm">
          <thead className="bg-brand-dark text-left text-sm text-white">
            <tr>
              {["Edição", "Nota de corte", "Último aprovado", "Pos. último chamado", "Vagas", "Inscritos", "Pré-sel.", "Postergados", "Desistentes", "Reprovados"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mine.map((r) => (
              <tr key={r.edicao} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{r.edicao}</td>
                <td className="px-4 py-3">{f(r.nota_corte && r.nota_corte > 0 ? r.nota_corte : null)}</td>
                <td className="px-4 py-3">{f(r.nota_ultimo_aprovado && r.nota_ultimo_aprovado > 0 ? r.nota_ultimo_aprovado : null)}</td>
                <td className="px-4 py-3">{f(r.pos_ultimo_chamado)}</td>
                <td className="px-4 py-3">{f(r.vagas)}</td>
                <td className="px-4 py-3">{f(r.inscritos)}</td>
                <td className="px-4 py-3">{f(r.pre_selecionados)}</td>
                <td className="px-4 py-3">{f(r.postergados)}</td>
                <td className="px-4 py-3">{f(r.desistentes)}</td>
                <td className="px-4 py-3">{f(r.reprovados)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
