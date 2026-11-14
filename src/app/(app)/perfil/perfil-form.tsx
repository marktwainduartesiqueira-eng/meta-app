"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PerfilForm({ id, nome, apelido, email, preview }: { id: string; nome: string; apelido: string; email: string; preview: string }) {
  const router = useRouter();
  const [nomeV, setNomeV] = useState(nome);
  const [apelidoV, setApelidoV] = useState(apelido);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const { error } = await createClient()
      .from("profiles")
      .update({ nome: nomeV.trim(), apelido: apelidoV.trim() || null })
      .eq("id", id);
    setBusy(false);
    if (error) return setMsg(`Não foi possível salvar: ${error.message}`);
    setMsg("Perfil atualizado.");
    router.refresh();
  }

  const input = "mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
  return (
    <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <label className="block text-sm font-semibold">
        Como você quer ser chamado(a)?
        <input value={apelidoV} onChange={(e) => setApelidoV(e.target.value)} maxLength={40} placeholder="ex.: Ana Beatriz" className={input} />
        <span className="mt-1 block text-xs font-normal text-muted">Aparece em &ldquo;Boa tarde, {apelidoV.trim() || preview}!&rdquo;</span>
      </label>
      <label className="block text-sm font-semibold">
        Nome completo
        <input value={nomeV} onChange={(e) => setNomeV(e.target.value)} className={input} />
      </label>
      <label className="block text-sm font-semibold">
        E-mail
        <input value={email} disabled className={`${input} bg-slate-50 text-muted`} />
      </label>
      {msg && <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">{msg}</p>}
      <button disabled={busy} className="rounded-full bg-brand px-7 py-2.5 text-sm font-bold text-white disabled:opacity-60">
        {busy ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
