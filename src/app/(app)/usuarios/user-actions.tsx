"use client";

import { useState, useTransition } from "react";
import { atualizarUsuario } from "./actions";

export default function UserActions({ id, ativo, papel, pendente }: { id: string; ativo: boolean; papel: "admin" | "consultor"; pendente: boolean }) {
  const [pending, start] = useTransition();
  const [erro, setErro] = useState("");

  function run(m: { ativo?: boolean; papel?: "admin" | "consultor" }) {
    setErro("");
    start(async () => {
      const r = await atualizarUsuario(id, m);
      if (r.erro) setErro(r.erro);
    });
  }

  const btn = "rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {ativo ? (
        <>
          <select
            value={papel}
            disabled={pending}
            onChange={(e) => run({ papel: e.target.value as "admin" | "consultor" })}
            className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs"
          >
            <option value="consultor">Consultor</option>
            <option value="admin">Admin</option>
          </select>
          <button disabled={pending} onClick={() => run({ ativo: false })} className={`${btn} border border-border text-red-700`}>
            Desativar
          </button>
        </>
      ) : (
        <button disabled={pending} onClick={() => run({ ativo: true })} className={`${btn} bg-brand text-white`}>
          {pendente ? "Aprovar" : "Reativar"}
        </button>
      )}
      {erro && <span className="text-xs text-red-700">{erro}</span>}
    </div>
  );
}
