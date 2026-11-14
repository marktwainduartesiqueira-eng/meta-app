"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client";
import { parseCompiladoSheet, type CompiladoRecord } from "@/lib/import/compilado";

function guessEdition(filename: string): string {
  const m = filename.match(/(\d{2,4})\.([12])/);
  if (!m) return "";
  return `${m[1].length === 2 ? "20" + m[1] : m[1]}.${m[2]}`;
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export default function ImportForm() {
  const [edition, setEdition] = useState("");
  const [records, setRecords] = useState<CompiladoRecord[]>([]);
  const [fileName, setFileName] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const add = (s: string) => setLog((l) => [...l, s]);

  async function onFile(file: File) {
    setLog([]);
    setFileName(file.name);
    setEdition(guessEdition(file.name));
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const all: CompiladoRecord[] = [];
    for (const name of wb.SheetNames) {
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: "" });
      all.push(...parseCompiladoSheet(name, rows as never));
    }
    setRecords(all);
  }

  async function runImport() {
    if (!/^\d{4}\.[12]$/.test(edition)) return add("Informe a edição no formato 2026.1.");
    setBusy(true);
    setLog([]);
    try {
      const sb = createClient();
      const must = <T,>(r: { data: T | null; error: { message: string } | null }, ctx: string): NonNullable<T> => {
        if (r.error || r.data === null) throw new Error(`${ctx}: ${r.error?.message ?? "sem retorno"}`);
        return r.data as NonNullable<T>;
      };

      const ed = must(
        await sb.from("editions").upsert({ codigo: edition }, { onConflict: "codigo" }).select("id").single(),
        "edição",
      );
      const check = (r: { error: { message: string } | null }, ctx: string) => {
        if (r.error) throw new Error(`${ctx}: ${r.error.message}`);
      };
      const edId = (ed as unknown as { id: number }).id;
      const { data: mods } = await sb.from("modalities").select("id,codigo");
      const modId = new Map((mods ?? []).map((m) => [m.codigo as string, m.id as number]));

      // Mantém a última ocorrência de cada (curso, modalidade) para evitar conflito no mesmo lote.
      const byKey = new Map<string, CompiladoRecord>();
      records.forEach((r) => byKey.set(`${r.chave}#${r.modality}`, r));
      const recs = [...byKey.values()];
      if (recs.length < records.length) add(`Aviso: ${records.length - recs.length} linha(s) duplicada(s) na planilha; vale a última.`);

      const iesMap = new Map(recs.map((r) => [r.iesCodigo, { codigo: r.iesCodigo, nome: r.iesNome }]));
      const iesRows = must(
        await sb.from("ies").upsert([...iesMap.values()], { onConflict: "codigo" }).select("id,codigo"),
        "IES",
      );
      const iesId = new Map(iesRows.map((i) => [i.codigo as string, i.id as number]));
      add(`IES: ${iesRows.length}`);

      const courseMap = new Map<string, CompiladoRecord>();
      recs.forEach((r) => courseMap.set(r.chave, r));
      const courseRows = [];
      for (const part of chunk([...courseMap.values()], 200)) {
        const data = must(
          await sb
            .from("courses")
            .upsert(
              part.map((r) => ({
                chave: r.chave,
                ies_id: iesId.get(r.iesCodigo),
                codigo: r.cursoCodigo,
                campus: r.campus,
                municipio: r.municipio,
                uf: r.uf,
                mesorregiao: r.mesorregiao || null,
              })),
              { onConflict: "chave" },
            )
            .select("id,chave"),
          "cursos",
        );
        courseRows.push(...data);
      }
      const courseId = new Map(courseRows.map((c) => [c.chave as string, c.id as number]));
      add(`Cursos/campi: ${courseRows.length}`);

      let n = 0;
      for (const part of chunk(recs, 300)) {
        check(
          await sb.from("cutoff_records").upsert(
            part.map((r) => ({
              edition_id: edId,
              course_id: courseId.get(r.chave),
              modality_id: modId.get(r.modality),
              nota_corte: r.notaCorte,
              vagas: r.vagas,
              inscritos: r.inscritos,
              pre_selecionados: r.preSelecionados,
              postergados: r.postergados,
              desistentes: r.desistentes,
              reprovados: r.reprovados,
              pos_ultimo_chamado: r.posUltimoChamado,
              nota_ultimo_aprovado: r.notaUltimoAprovado,
              tx_rotacao: r.txRotacao,
              extras: r.extras,
              updated_at: new Date().toISOString(),
            })),
            { onConflict: "edition_id,course_id,modality_id" },
          ),
          "notas",
        );
        n += part.length;
        add(`Notas gravadas: ${n}/${recs.length}`);
      }

      // Informações do curso: uma por (edição, curso); prefere a modalidade AC.
      const infoMap = new Map<string, CompiladoRecord>();
      recs.forEach((r) => {
        const cur = infoMap.get(r.chave);
        if (!cur || r.modality === "AC") infoMap.set(r.chave, r);
      });
      for (const part of chunk([...infoMap.values()], 300)) {
        check(
          await sb.from("course_info").upsert(
            part.map((r) => ({
              edition_id: edId,
              course_id: courseId.get(r.chave),
              inicio_curso: r.info.inicioCurso,
              conceito_mec: r.info.conceitoMec,
              enamed: r.info.enamed,
              tipo_ensino: r.info.tipoEnsino,
              indice_indexacao: r.info.indiceIndexacao,
              expectativa_salario: r.info.expectativaSalario,
            })),
            { onConflict: "edition_id,course_id" },
          ),
          "info dos cursos",
        );
      }
      add(`Concluído: edição ${edition} importada.`);
    } catch (e) {
      add(`ERRO — ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  const byMod = records.reduce<Record<string, number>>((a, r) => ((a[r.modality] = (a[r.modality] ?? 0) + 1), a), {});

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <label className="block text-sm font-semibold">
        Planilha “Dados Compilados” (.xlsx)
        <input
          type="file"
          accept=".xlsx"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-white"
        />
      </label>

      {records.length > 0 && (
        <>
          <div className="text-sm">
            <b>{fileName}</b>: {records.length} registros lidos —{" "}
            {Object.entries(byMod)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" · ")}
          </div>
          <label className="block w-40 text-sm font-semibold">
            Edição
            <input
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              placeholder="2026.1"
              className="mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
            />
          </label>
          <button
            onClick={runImport}
            disabled={busy}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? "Importando…" : "Importar para o banco"}
          </button>
        </>
      )}

      {log.length > 0 && (
        <pre className="whitespace-pre-wrap rounded-lg bg-brand-dark p-4 text-xs text-white/90">{log.join("\n")}</pre>
      )}
    </div>
  );
}
