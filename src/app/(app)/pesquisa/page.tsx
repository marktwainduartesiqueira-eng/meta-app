import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { referenceScore, type Chance } from "@/lib/chance";
import { MODALIDADES, runSearch } from "@/lib/search";
import EstadosSelect from "./estados-select";
import MiniChart from "./mini-chart";

const badge: Record<Chance, string> = {
  Alta: "bg-emerald-100 text-emerald-800",
  Média: "bg-amber-100 text-amber-800",
  Baixa: "bg-orange-100 text-orange-800",
  Improvável: "bg-red-100 text-red-800",
  "Sem histórico": "bg-slate-100 text-slate-600",
};

export default async function Pesquisa({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const supabase = await createClient();
  const { modalidade, nota, editions, list, total, error } = await runSearch(supabase, sp);

  const input = "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm";
  const pdfHref = `/api/relatorio?${new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString()}`;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-brand-dark">Pesquisa de faculdades</h1>
      <p className="mb-5 text-sm text-muted">
        Referência por edição = nota do último aprovado (ou a nota de corte, quando não houver).
      </p>

      <form className="mb-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6">
        <label className="text-xs font-medium">
          Nome do aluno(a)
          <input name="nome" defaultValue={sp.nome ?? ""} placeholder="para o PDF" className={`${input} mt-1`} />
        </label>
        <label className="text-xs font-medium">
          Nota do aluno
          <input name="nota" defaultValue={sp.nota ?? ""} placeholder="ex.: 745,3" className={`${input} mt-1`} />
        </label>
        <label className="text-xs font-medium">
          Modalidade
          <select name="modalidade" defaultValue={modalidade} className={`${input} mt-1`}>
            {MODALIDADES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <div className="text-xs font-medium lg:col-span-2">
          Estados (um ou mais)
          <EstadosSelect initial={sp.uf ?? ""} />
        </div>
        <label className="text-xs font-medium">
          IES (nome, cidade ou código)
          <input name="q" defaultValue={q} className={`${input} mt-1`} />
        </label>
        <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-6">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name="so_chances" value="1" defaultChecked={!!sp.so_chances} /> Só chance Alta/Média
          </label>
          <button className="ml-auto rounded-lg bg-brand px-6 py-2 text-sm font-semibold text-white">Pesquisar</button>
        </div>
      </form>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Erro na consulta: {error}</p>}

      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {total > list.length
            ? `Mostrando as ${list.length} melhores opções de ${total} em ${modalidade}${nota === null ? " (informe a nota para ordenar por chance)" : ""}`
            : `${total} resultado(s) em ${modalidade}`}
        </p>
        {list.length > 0 && (
          <a href={pdfHref} target="_blank" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-brand-dark">
            Gerar relatório PDF
          </a>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {list.map((c) => (
          <div key={c.id} className="flex flex-col rounded-xl border border-border bg-card p-4">
            <div className="mb-1 flex items-start justify-between gap-2">
              <Link
                href={`/curso/${c.id}?modalidade=${encodeURIComponent(modalidade)}${nota !== null ? `&nota=${nota}` : ""}`}
                className="font-semibold leading-snug text-brand hover:underline"
              >
                {c.info.ies_nome}
              </Link>
              {nota !== null && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badge[c.res.chance]}`}>
                  {c.res.chance}
                </span>
              )}
            </div>
            <p className="mb-2 text-xs text-muted">
              {c.info.campus} · {c.info.uf} · cód. {c.info.ies_codigo}
            </p>
            <MiniChart
              data={editions.map((e) => ({
                edicao: e,
                ref: c.byEd.get(e) ? referenceScore(c.byEd.get(e)!) : null,
                pos: c.byEd.get(e)?.pos_ultimo_chamado ?? null,
              }))}
              aluno={nota}
            />
          </div>
        ))}
      </div>
      {list.length === 0 && !error && (
        <p className="rounded-xl border border-border bg-card px-3 py-8 text-center text-sm text-muted">
          Nenhum resultado para esses filtros.
        </p>
      )}
    </div>
  );
}
