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

  const input = "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base";
  const pdfHref = `/api/relatorio?${new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString()}`;

  return (
    <div>
      <h1 className="mb-2 t-title text-brand-dark">Pesquisa de faculdades</h1>
      <p className="t-lead mb-8 text-muted">
        Referência por edição = nota do último aprovado (ou a nota de corte, quando não houver).
      </p>

      <form>
        <div className="border-t border-border py-6">
          <h2 className="t-caps mb-4 text-muted">Aluno</h2>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <label className="text-sm font-bold text-brand-dark">
              Nota do aluno
              <input name="nota" defaultValue={sp.nota ?? ""} placeholder="ex.: 745,3" className={`${input} mt-1 !border-brand bg-white tabular text-xl font-bold`} />
            </label>
            <label className="text-sm font-semibold">
              Nome do aluno(a)
              <input name="nome" defaultValue={sp.nome ?? ""} placeholder="para o PDF" className={`${input} mt-1`} />
            </label>
          </div>
        </div>

        <div className="border-t border-border py-6">
          <h2 className="t-caps mb-4 text-muted">Filtros</h2>
          <div className="grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)] md:grid-cols-[9rem_minmax(0,1fr)_14rem]">
            <label className="text-sm font-semibold">
              Modalidade
              <select name="modalidade" defaultValue={modalidade} className={`${input} mt-1`}>
                {MODALIDADES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <div className="text-sm font-semibold">
              Estados (um ou mais)
              <EstadosSelect initial={sp.uf ?? ""} />
            </div>
            <label className="text-sm font-semibold sm:col-span-2 md:col-span-1">
              IES (nome, cidade ou código)
              <input name="q" defaultValue={q} className={`${input} mt-1`} />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="so_chances" value="1" defaultChecked={!!sp.so_chances} /> Só chance Alta/Média
            </label>
            <button className="ml-auto rounded-full bg-brand px-8 py-2.5 text-sm font-bold text-white transition hover:bg-brand/90">Pesquisar</button>
          </div>
        </div>
      </form>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Erro na consulta: {error}</p>}

      <div className="border-t border-border pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="t-caps text-muted">Resultados</h2>
            <p className="mt-1 text-sm text-muted tabular">
              {total > list.length
                ? `Mostrando as ${list.length} melhores opções de ${total} em ${modalidade}${nota === null ? " (informe a nota para ordenar por chance)" : ""}`
                : `${total} resultado(s) em ${modalidade}`}
            </p>
          </div>
          {list.length > 0 && (
            <a href={pdfHref} target="_blank" className="inline-flex min-h-11 items-center rounded-full border-2 border-brand bg-white px-5 py-2 text-sm font-bold text-brand transition hover:bg-brand hover:text-white sm:min-h-0">
              Gerar relatório PDF
            </a>
          )}
        </div>

        <div className="mt-5 divide-y divide-border border-t border-border">
          {list.map((c) => (
            <div key={c.id} className="grid gap-4 py-6 md:grid-cols-[15rem_minmax(0,1fr)] md:items-center md:gap-8">
              <div>
                <Link
                  href={`/curso/${c.id}?modalidade=${encodeURIComponent(modalidade)}${nota !== null ? `&nota=${nota}` : ""}`}
                  className="-my-3 inline-block py-3 t-item text-brand hover:underline"
                >
                  {c.info.ies_nome}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  {c.info.campus} · {c.info.uf} · cód. {c.info.ies_codigo}
                </p>
                {nota !== null && (
                  <span className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-bold ${badge[c.res.chance]}`}>
                    {c.res.chance}
                  </span>
                )}
              </div>
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
    </div>
  );
}
