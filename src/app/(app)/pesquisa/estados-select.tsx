"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ESTADOS } from "@/lib/search";

/** Seleção de vários estados. Envia `uf=SP,MG` num campo oculto do formulário. */
export default function EstadosSelect({ initial }: { initial: string }) {
  const [sel, setSel] = useState<string[]>(
    initial
      .toUpperCase()
      .split(",")
      .filter((u) => ESTADOS.some(([x]) => x === u)),
  );
  const toggle = (uf: string) => setSel((s) => (s.includes(uf) ? s.filter((x) => x !== uf) : [...s, uf]));
  const resumo = sel.length === 0 ? "Todos os estados" : sel.length <= 4 ? [...sel].sort().join(", ") : `${sel.length} estados`;

  return (
    <div className="relative">
      <input type="hidden" name="uf" value={[...sel].sort().join(",")} />
      <details className="group">
        <summary className="mt-1 flex cursor-pointer list-none items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-sm [&::-webkit-details-marker]:hidden">
          <span className="truncate">{resumo}</span>
          <ChevronDown size={16} className="shrink-0 transition group-open:rotate-180" />
        </summary>
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-white p-2 shadow-lg">
          <button type="button" onClick={() => setSel([])} className="mb-1 w-full rounded px-2 py-1 text-left text-xs font-semibold text-brand hover:bg-slate-50">
            Limpar seleção (todos)
          </button>
          {ESTADOS.map(([uf, nome]) => (
            <label key={uf} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm font-normal hover:bg-slate-50">
              <input type="checkbox" checked={sel.includes(uf)} onChange={() => toggle(uf)} />
              {nome} ({uf})
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}
