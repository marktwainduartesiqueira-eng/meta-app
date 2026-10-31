"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setInfo("");
    setLoading(true);
    const supabase = createClient();
    if (mode === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) setErro("E-mail ou senha incorretos.");
      else {
        router.replace("/");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome, apelido: apelido.trim() } },
      });
      if (error) setErro(error.message);
      else if (data.session) {
        router.replace("/");
        router.refresh();
      } else setInfo("Conta criada. Confirme o e-mail enviado e depois entre.");
    }
    setLoading(false);
  }

  const input =
    "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-dark px-4">
      <Image src="/brand/logo.jpg" alt="Metta Estudantil" width={618} height={383} className="h-36 w-auto" priority />
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-brand-dark">Assessoria FIES</h1>
          <p className="text-sm text-muted">Acesso restrito à equipe</p>
        </div>

        {mode === "criar" && (
          <>
            <label className="mb-3 block text-sm font-medium">
              Nome completo
              <input className={`${input} mt-1`} value={nome} onChange={(e) => setNome(e.target.value)} required />
            </label>
            <label className="mb-3 block text-sm font-medium">
              Como você quer ser chamado(a)?
              <input className={`${input} mt-1`} value={apelido} onChange={(e) => setApelido(e.target.value)} maxLength={40} placeholder="ex.: Mark Twain" required />
            </label>
          </>
        )}
        <label className="mb-3 block text-sm font-medium">
          E-mail
          <input
            type="email"
            className={`${input} mt-1`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="mb-4 block text-sm font-medium">
          Senha
          <input
            type="password"
            minLength={8}
            className={`${input} mt-1`}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </label>

        {erro && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
        {info && <p className="mb-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">{info}</p>}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
        >
          {loading ? "Aguarde…" : mode === "entrar" ? "Entrar" : "Criar conta"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}
          className="mt-4 w-full text-center text-xs text-muted hover:text-brand"
        >
          {mode === "entrar" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
        </button>
      </form>
    </main>
  );
}
