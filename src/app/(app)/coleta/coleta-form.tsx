"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { parseSheet, type ParsedSheet, type Rows } from "@/lib/collect/sheet";
import { buildCollections } from "@/lib/collect/pipeline";
import { indexTemplate, matchToTemplate, type MatchResult, type TemplateEntry, type TemplateIndex } from "@/lib/collect/template";
import { fillTemplate, type FillItem } from "@/lib/collect/fill-template";
import { MODALITY_ORDER, type SheetCollection } from "@/lib/collect/types";

type NumKey = "inscritos" | "preSelecionados" | "postergados" | "desistentes" | "reprovados" | "posicaoUltimoChamado" | "notaUltimoAprovado";
const NUM_FIELDS: { key: NumKey; label: string }[] = [
  { key: "inscritos", label: "Inscritos" },
  { key: "preSelecionados", label: "Pré-sel." },
  { key: "postergados", label: "Posterg." },
  { key: "desistentes", label: "Desist." },
  { key: "reprovados", label: "Reprov." },
  { key: "posicaoUltimoChamado", label: "Pos. último" },
  { key: "notaUltimoAprovado", label: "Nota último" },
];

interface Job {
  key: string;
  c: SheetCollection;
  match: MatchResult;
  chosen: TemplateEntry | null;
  confirmedMatch: boolean;
  values: Record<NumKey, number | null>;
  manual: NumKey[];
  /** Valor recalculado que divergiu de uma correção manual preservada. */
  divergent: NumKey[];
  approved: boolean;
}

interface Saved {
  values: Partial<Record<NumKey, number | null>>;
  entryKey?: string;
}

const entryKey = (e: TemplateEntry) => `${e.sheet}#${e.rowIndex}`;
const storageKey = (ed: string) => `metta-coleta-manual:${ed}`;

function sheetRows(ws: XLSX.WorkSheet): { rows: Rows; offset: number } {
  const offset = ws["!ref"] ? XLSX.utils.decode_range(ws["!ref"]).s.r : 0;
  return { rows: XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" }) as Rows, offset };
}

const tick = () => new Promise((r) => setTimeout(r, 30));

export default function ColetaForm() {
  const [edition, setEdition] = useState("");
  const [tplFile, setTplFile] = useState<File | null>(null);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tpl, setTpl] = useState<{ bytes: ArrayBuffer; index: TemplateIndex; offsets: Record<string, number> } | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [onlyPending, setOnlyPending] = useState(false);
  const [tab, setTab] = useState<string | null>(null);

  function loadSaved(): Record<string, Saved> {
    try {
      return JSON.parse(localStorage.getItem(storageKey(edition)) ?? "{}");
    } catch {
      return {};
    }
  }
  function persist(next: Job[]) {
    const out: Record<string, Saved> = {};
    for (const j of next) {
      if (j.manual.length === 0 && !j.confirmedMatch) continue;
      out[j.key] = {
        values: Object.fromEntries(j.manual.map((k) => [k, j.values[k]])),
        entryKey: j.confirmedMatch && j.chosen ? entryKey(j.chosen) : undefined,
      };
    }
    try {
      localStorage.setItem(storageKey(edition), JSON.stringify(out));
    } catch {
      /* armazenamento indisponível: correções valem só nesta sessão */
    }
  }

  async function process() {
    if (!tplFile || rawFiles.length === 0) return;
    setBusy(true);
    setJobs([]);
    try {
      setMsg("Lendo a planilha-base…");
      await tick();
      const tplBytes = await tplFile.arrayBuffer();
      const twb = XLSX.read(tplBytes, { type: "array" });
      const offsets: Record<string, number> = {};
      const index = indexTemplate(
        twb.SheetNames.map((name) => {
          const { rows, offset } = sheetRows(twb.Sheets[name]);
          offsets[name] = offset;
          return { name, rows };
        }),
      );
      setTpl({ bytes: tplBytes, index, offsets });

      const parsed: ParsedSheet[] = [];
      for (const file of rawFiles) {
        setMsg(`Lendo ${file.name}…`);
        await tick();
        const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
        for (const name of wb.SheetNames) {
          const p = parseSheet(`${file.name.replace(/\.xlsx$/i, "")} / ${name}`, sheetRows(wb.Sheets[name]).rows);
          if (p) parsed.push(p);
        }
      }

      setMsg("Aplicando as regras de coleta…");
      await tick();
      const saved = loadSaved();
      const entryByKey = new Map(index.entries.map((e) => [entryKey(e), e]));
      const built: Job[] = buildCollections(parsed).map(({ key, collection }) => {
        const match = matchToTemplate(collection, index);
        const sv = saved[key];
        const r = collection.result;
        const values: Record<NumKey, number | null> = {
          inscritos: r.inscritos,
          preSelecionados: r.corteClassificacao === null ? null : r.preSelecionados,
          postergados: r.corteClassificacao === null ? null : r.postergados,
          desistentes: r.corteClassificacao === null ? null : r.desistentes,
          reprovados: r.corteClassificacao === null ? null : r.reprovados,
          posicaoUltimoChamado: r.posicaoUltimoChamado,
          notaUltimoAprovado: r.notaUltimoAprovado,
        };
        const manual: NumKey[] = [];
        const divergent: NumKey[] = [];
        for (const [k, v] of Object.entries(sv?.values ?? {}) as [NumKey, number | null][]) {
          if (values[k] !== v) divergent.push(k);
          values[k] = v;
          manual.push(k);
        }
        const savedEntry = sv?.entryKey ? entryByKey.get(sv.entryKey) : undefined;
        return {
          key,
          c: collection,
          match,
          chosen: savedEntry ?? (match.status === "auto" ? match.entry : null),
          confirmedMatch: !!savedEntry,
          values,
          manual,
          divergent,
          approved: false,
        };
      });
      built.sort((a, b) => (a.c.meta.uf + a.c.meta.iesNome).localeCompare(b.c.meta.uf + b.c.meta.iesNome));
      setJobs(built);
      setMsg(`${built.length} faculdades/modalidades processadas a partir de ${parsed.length} abas.`);
    } catch (e) {
      setMsg(`ERRO — ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  const rowUse = useMemo(() => {
    const m = new Map<string, number>();
    jobs.forEach((j) => j.chosen && m.set(entryKey(j.chosen), (m.get(entryKey(j.chosen)) ?? 0) + 1));
    return m;
  }, [jobs]);

  function reasons(j: Job): string[] {
    const out = [...j.c.result.revisar];
    if (!j.chosen) out.push(`REVISAR — ${j.match.reason || "FACULDADE NÃO CORRESPONDIDA"}`);
    else if (j.match.status === "revisar" && !j.confirmedMatch) out.push("REVISAR — CONFIRME A CORRESPONDÊNCIA");
    if (j.chosen && (rowUse.get(entryKey(j.chosen)) ?? 0) > 1) out.push("LINHA DA PLANILHA-BASE USADA POR MAIS DE UMA FACULDADE");
    if (j.divergent.length) out.push("CORREÇÃO MANUAL PRESERVADA DIFERE DO NOVO CÁLCULO");
    return out;
  }

  function update(key: string, fn: (j: Job) => Job) {
    setJobs((prev) => {
      const next = prev.map((j) => (j.key === key ? fn(j) : j));
      persist(next);
      return next;
    });
  }

  const status = (j: Job) => reasons(j);
  const exportable = (j: Job) => !!j.chosen && (status(j).length === 0 || j.approved) && (rowUse.get(entryKey(j.chosen)) ?? 0) === 1;

  const counts = {
    total: jobs.length,
    ok: jobs.filter((j) => status(j).length === 0).length,
    out: jobs.filter(exportable).length,
  };

  async function download() {
    if (!tpl) return;
    setBusy(true);
    try {
      const items: FillItem[] = jobs.filter(exportable).map((j) => ({ entry: j.chosen!, values: j.values }));
      const { bytes, written, skipped, heightsAdjusted } = await fillTemplate(tpl.bytes, tpl.index, items, tpl.offsets);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Dados Coletados - FIES ${edition}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg(
        `Planilha gerada: ${items.length} linhas preenchidas (${written} células)${skipped ? `, ${skipped} células com fórmula foram preservadas` : ""}; altura aumentada em ${heightsAdjusted} linhas para o texto caber. ` +
          "Para completar outras modalidades depois, use este arquivo como planilha-base no próximo envio.",
      );
    } catch (e) {
      setMsg(`ERRO ao gerar a planilha — ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  const tabStats = MODALITY_ORDER.map((m) => {
    const list = jobs.filter((j) => (j.c.modality ?? "?") === m);
    return { m, total: list.length, pending: list.filter((j) => status(j).length > 0).length };
  });
  const unknown = jobs.filter((j) => !j.c.modality).length;
  const activeTab = tab ?? tabStats.find((t) => t.total > 0)?.m ?? "AC";
  const shown = jobs.filter(
    (j) => (j.c.modality ?? "?") === activeTab && (!onlyPending || status(j).length > 0),
  );
  const cell = "px-3 py-2";
  const fileInput = "mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-white";

  return (
    <div className="space-y-6">
      <div className="grid gap-5 rounded-2xl border border-border bg-card p-6 md:grid-cols-3">
        <label className="text-sm font-semibold">
          1. Planilha-base (Tabela Modelo.xlsx)
          <input type="file" accept=".xlsx" className={fileInput} onChange={(e) => setTplFile(e.target.files?.[0] ?? null)} />
        </label>
        <label className="text-sm font-semibold">
          2. Planilhas brutas do MEC (uma ou mais)
          <input type="file" accept=".xlsx" multiple className={fileInput} onChange={(e) => setRawFiles([...(e.target.files ?? [])])} />
          <span className="mt-1 block text-xs font-normal text-muted">Tabela 1 e Tabela 2 da mesma modalidade são consolidadas.</span>
        </label>
        <div className="flex flex-col justify-between gap-3">
          <label className="text-sm font-semibold">
            Edição
            <input value={edition} onChange={(e) => setEdition(e.target.value)} placeholder="ex.: 2026.2" className="mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base" />
          </label>
          <button onClick={process} disabled={busy || !tplFile || rawFiles.length === 0 || !edition.trim()} className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {busy ? "Processando…" : "Processar"}
          </button>
        </div>
      </div>

      {msg && <p className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-800">{msg}</p>}

      {jobs.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm">
              <b>{counts.total}</b> registros · <b className="text-emerald-700">{counts.ok}</b> validados ·{" "}
              <b className="text-amber-700">{counts.total - counts.ok}</b> para revisar · <b>{counts.out}</b> serão preenchidos
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyPending} onChange={(e) => setOnlyPending(e.target.checked)} /> Só pendências
            </label>
            <button onClick={download} disabled={busy || counts.out === 0} className="ml-auto rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              Baixar planilha preenchida
            </button>
          </div>
          <p className="text-xs text-muted">
            Linhas com pendência só entram na planilha se você marcar “Aprovar mesmo assim”. TX rotação nunca é preenchida.
            Valores que você editar ficam salvos neste navegador e não são sobrescritos ao reprocessar.
          </p>

          <div className="flex flex-wrap gap-2">
            {tabStats.map((t) => (
              <button
                key={t.m}
                onClick={() => setTab(t.m)}
                disabled={t.total === 0}
                className={`rounded-full border px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                  activeTab === t.m ? "border-brand bg-brand text-white" : "border-border bg-card"
                }`}
              >
                {t.m}
                <span className="ml-2 text-xs">
                  {t.total === 0 ? "não enviada" : t.pending === 0 ? `${t.total} ✓` : `${t.total} · ${t.pending} a revisar`}
                </span>
              </button>
            ))}
          </div>
          {unknown > 0 && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {unknown} registro(s) com modalidade não reconhecida não aparecem nas abas e não serão preenchidos.
            </p>
          )}

          <div className="scroll-shadow max-h-[75dvh] overflow-auto rounded-2xl border border-border bg-card">
            <table className="sticky-first w-full text-sm">
              <thead className="sticky top-0 z-10 bg-brand-dark text-left text-white">
                <tr>
                  <th className={cell}>UF</th>
                  <th className={cell}>Faculdade / município</th>
                  <th className={cell}>Cód. IES / curso</th>
                  {NUM_FIELDS.map((f) => (
                    <th key={f.key} className={cell}>{f.label}</th>
                  ))}
                  <th className={cell}>Linha na planilha-base</th>
                  <th className={`${cell} min-w-64`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((j) => {
                  const rs = status(j);
                  return (
                    <tr key={j.key} className="border-t border-border align-top">
                      <td className={cell}>{j.c.meta.uf}</td>
                      <td className={cell}>
                        <div className="font-medium">{j.c.meta.iesNome}</div>
                        <div className="text-muted">{j.c.meta.municipio}</div>
                      </td>
                      <td className={cell}>{j.c.meta.iesCodigo}<br />{j.c.meta.cursoCodigo}</td>
                      {NUM_FIELDS.map((f) => (
                        <td key={f.key} className={cell}>
                          <input
                            defaultValue={j.values[f.key] ?? ""}
                            onBlur={(e) => {
                              const raw = e.target.value.trim().replace(",", ".");
                              const v = raw === "" ? null : Number(raw);
                              if (v !== null && !Number.isFinite(v)) return;
                              if (v === j.values[f.key]) return;
                              update(j.key, (x) => ({
                                ...x,
                                values: { ...x.values, [f.key]: v },
                                manual: x.manual.includes(f.key) ? x.manual : [...x.manual, f.key],
                                divergent: x.divergent.filter((d) => d !== f.key),
                              }));
                            }}
                            className={`w-20 rounded border px-1.5 py-1 ${j.manual.includes(f.key) ? "border-accent bg-amber-50" : "border-border"}`}
                          />
                        </td>
                      ))}
                      <td className={`${cell} min-w-72`}>
                        {j.chosen ? (
                          <div className="mb-1.5 rounded-lg bg-slate-50 p-2">
                            <div className="font-medium">{j.chosen.iesNome}</div>
                            <div className="text-muted">{j.chosen.campus}</div>
                            <div className="text-muted">
                              Cód. {j.chosen.iesCodigo}/{j.chosen.cursoCodigo} · aba {j.chosen.sheet}, linha{" "}
                              {j.chosen.rowIndex + (tpl?.offsets[j.chosen.sheet] ?? 0) + 1}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-1.5 text-amber-800">Nenhuma linha escolhida</div>
                        )}
                        <select
                          value={j.chosen ? entryKey(j.chosen) : ""}
                          onChange={(e) => {
                            const all = [...j.match.suggestions.map((s) => s.entry), ...(j.chosen ? [j.chosen] : [])];
                            const found = all.find((x) => entryKey(x) === e.target.value) ?? null;
                            update(j.key, (x) => ({ ...x, chosen: found, confirmedMatch: !!found }));
                          }}
                          title="Trocar a linha da planilha-base"
                          className="w-full rounded border border-border px-1 py-1"
                        >
                          <option value="">— nenhuma —</option>
                          {[...new Map([...(j.chosen ? [j.chosen] : []), ...j.match.suggestions.map((s) => s.entry)].map((e) => [entryKey(e), e])).values()].map((e) => (
                            <option key={entryKey(e)} value={entryKey(e)}>
                              {e.iesNome} — {e.campus} ({e.iesCodigo}/{e.cursoCodigo})
                            </option>
                          ))}
                        </select>
                        <div className="mt-0.5 text-xs text-muted">Trocar correspondência (5 sugestões)</div>
                      </td>
                      <td className={cell}>
                        {rs.length === 0 ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">VALIDADO</span>
                        ) : (
                          <div className="space-y-1">
                            {rs.map((r) => (
                              <div key={r} className="text-amber-800">{r.startsWith("REVISAR") ? r : `REVISAR — ${r}`}</div>
                            ))}
                            <label className="flex items-center gap-1 text-muted">
                              <input type="checkbox" checked={j.approved} onChange={(e) => update(j.key, (x) => ({ ...x, approved: e.target.checked }))} />
                              Aprovar mesmo assim
                            </label>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
