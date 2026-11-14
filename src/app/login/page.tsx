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
      if (error) {
        setErro("E-mail ou senha incorretos.");
        setLoading(false);
      } else {
        // Mantém "Aguarde…" até a nova página abrir.
        router.replace("/");
      }
      return;
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome, apelido: apelido.trim() } },
      });
      if (error) {
        setErro(
          /rate limit/i.test(error.message)
            ? "Muitas tentativas. Aguarde alguns minutos e tente de novo."
            : /already registered/i.test(error.message)
              ? "Este e-mail já tem cadastro. Use “Já tenho conta”."
              : error.message,
        );
      } else if (data.user && data.user.identities?.length === 0) {
        setErro("Este e-mail já tem cadastro. Use “Já tenho conta”.");
      } else {
        if (data.session) {
          const { data: p } = await supabase.from("profiles").select("ativo").eq("id", data.user!.id).single();
          if (p?.ativo) {
            // Primeiro usuário do sistema (vira admin) entra direto.
            router.replace("/");
            return;
          }
          await supabase.auth.signOut();
        }
        setInfo("Cadastro enviado! Um administrador vai analisar e liberar seu acesso. Depois é só entrar com seu e-mail e senha.");
        setMode("entrar");
        setSenha("");
      }
    }
    setLoading(false);
  }

  const input =
    "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-brand-dark px-4 py-6">
      <Image src="/brand/logo.png" alt="Metta Estudantil" width={603} height={300} className="h-24 w-auto sm:h-28" priority />
      <form onSubmit={submit} className="rise w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="t-section text-brand-dark">Assessoria FIES</h1>
          <p className="text-sm text-muted">Acesso restrito à equipe</p>
        </div>

        {mode === "criar" && (
          <>
            <label className="mb-3 block text-sm font-semibold">
              Nome completo
              <input className={`${input} mt-1`} value={nome} onChange={(e) => setNome(e.target.value)} required />
            </label>
            <label className="mb-3 block text-sm font-semibold">
              Como você quer ser chamado(a)?
              <input className={`${input} mt-1`} value={apelido} onChange={(e) => setApelido(e.target.value)} maxLength={40} placeholder="ex.: Ana Beatriz" required />
            </label>
          </>
        )}
        <label className="mb-3 block text-sm font-semibold">
          E-mail
          <input
            type="email"
            className={`${input} mt-1`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="mb-4 block text-sm font-semibold">
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
          className="w-full rounded-full bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand/90 disabled:opacity-60"
        >
          {loading ? "Aguarde…" : mode === "entrar" ? "Entrar" : "Criar conta"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}
          className="mt-4 w-full rounded-full border border-border-strong py-2.5 text-center text-sm font-semibold text-brand transition hover:bg-brand/5"
        >
          {mode === "entrar" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
        </button>
      </form>
    </main>
  );
}
