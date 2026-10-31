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
        <h1 className="text-2xl font-bold text-brand-dark">{head.ies_nome}</h1>
        <p className="text-sm text-muted">
          {head.campus} · {head.municipio}/{head.uf} · {head.regiao} · IES {head.ies_codigo}
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <label className="text-xs font-medium">
          Modalidade
          <select name="modalidade" defaultValue={modalidade} className="mt-1 block rounded-lg border border-border px-3 py-2 text-sm">
            {MODALIDADES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium">
          Nota do aluno
          <input name="nota" defaultValue={sp.nota ?? ""} className="mt-1 block w-32 rounded-lg border border-border px-3 py-2 text-sm" />
        </label>
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Atualizar</button>
        {alunoNota !== null && (
          <div className="ml-auto text-right">
            <div className="text-xs text-muted">Chance estimada</div>
            <div className="text-xl font-bold text-brand">{res.chance}</div>
          </div>
        )}
      </form>
      {alunoNota !== null && <p className="text-xs text-muted">{res.explicacao} Estimativa histórica, sem garantia de aprovação.</p>}

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-2 font-semibold">Histórico de notas — {modalidade}</h2>
        {mine.length ? <HistoryChart data={chart} /> : <p className="text-sm text-muted">Sem registros nesta modalidade.</p>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-brand-dark text-left text-xs text-white">
            <tr>
              {["Edição", "Nota de corte", "Último aprovado", "Pos. último chamado", "Vagas", "Inscritos", "Pré-sel.", "Postergados", "Desistentes", "Reprovados"].map((h) => (
                <th key={h} className="px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mine.map((r) => (
              <tr key={r.edicao} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{r.edicao}</td>
                <td className="px-3 py-2">{f(r.nota_corte && r.nota_corte > 0 ? r.nota_corte : null)}</td>
                <td className="px-3 py-2">{f(r.nota_ultimo_aprovado && r.nota_ultimo_aprovado > 0 ? r.nota_ultimo_aprovado : null)}</td>
                <td className="px-3 py-2">{f(r.pos_ultimo_chamado)}</td>
                <td className="px-3 py-2">{f(r.vagas)}</td>
                <td className="px-3 py-2">{f(r.inscritos)}</td>
                <td className="px-3 py-2">{f(r.pre_selecionados)}</td>
                <td className="px-3 py-2">{f(r.postergados)}</td>
                <td className="px-3 py-2">{f(r.desistentes)}</td>
                <td className="px-3 py-2">{f(r.reprovados)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
