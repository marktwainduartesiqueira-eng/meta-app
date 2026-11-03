"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ESTADOS, MAX_POR_ESTADO, MAX_RESULTS, parseUfQuotas } from "@/lib/search";

/** Seleção de estados com a quantidade de faculdades de cada um. Envia `uf=SP:5,RN:1` num campo oculto. */
export default function EstadosSelect({ initial }: { initial: string }) {
  const [sel, setSel] = useState<Record<string, number>>(Object.fromEntries(parseUfQuotas(initial)));
  const ufs = Object.keys(sel).sort();
  const toggle = (uf: string) =>
    setSel((s) => {
      const { [uf]: removed, ...rest } = s;
      return removed ? rest : { ...s, [uf]: MAX_RESULTS };
    });
  const setQtd = (uf: string, v: string) =>
    setSel((s) => ({ ...s, [uf]: Math.min(MAX_POR_ESTADO, Math.max(1, Math.floor(Number(v)) || 1)) }));
  const resumo =
    ufs.length === 0 ? "Todos os estados" : ufs.length <= 4 ? ufs.map((u) => `${u} (${sel[u]})`).join(", ") : `${ufs.length} estados`;

  return (
    <div className="relative">
      <input type="hidden" name="uf" value={ufs.map((u) => `${u}:${sel[u]}`).join(",")} />
      <details className="group">
        <summary className="mt-1 flex cursor-pointer list-none items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-sm [&::-webkit-details-marker]:hidden">
          <span className="truncate">{resumo}</span>
          <ChevronDown size={16} className="shrink-0 transition group-open:rotate-180" />
        </summary>
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-white p-2 shadow-lg">
          <button type="button" onClick={() => setSel({})} className="mb-1 w-full rounded px-2 py-1 text-left text-xs font-semibold text-brand hover:bg-slate-50">
            Limpar seleção (todos)
          </button>
          <p className="mb-1 px-2 text-[11px] font-normal text-muted">Marque o estado e informe quantas faculdades listar dele.</p>
          {ESTADOS.map(([uf, nome]) => (
            <div key={uf} className="flex items-center gap-2 rounded px-2 py-1 text-sm font-normal hover:bg-slate-50">
              <label className="flex flex-1 cursor-pointer items-center gap-2">
                <input type="checkbox" checked={uf in sel} onChange={() => toggle(uf)} />
                {nome} ({uf})
              </label>
              {uf in sel && (
                <input
                  type="number"
                  min={1}
                  max={MAX_POR_ESTADO}
                  value={sel[uf]}
                  onChange={(e) => setQtd(uf, e.target.value)}
                  aria-label={`Quantidade de faculdades em ${nome}`}
                  className="w-14 rounded border border-border px-1.5 py-0.5 text-center text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
