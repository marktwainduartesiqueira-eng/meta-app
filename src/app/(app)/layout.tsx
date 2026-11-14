import Image from "next/image";
import Link from "next/link";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { displayName } from "@/lib/names";
import SignOutButton from "./sign-out-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || !profile.ativo) {
    // Não redireciona para /login: o proxy devolveria para cá e criaria um laço.
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-sm text-sm text-muted">
          {profile
            ? "Seu cadastro está aguardando a aprovação de um administrador (ou a conta foi desativada). Assim que for liberado, é só entrar de novo."
            : "Não foi possível carregar seu perfil. Fale com o administrador."}
        </p>
        <div className="rounded-lg bg-brand-dark p-2">
          <SignOutButton />
        </div>
      </div>
    );
  }

  let pendentes = 0;
  if (profile.papel === "admin") {
    const supabase = await createClient();
    const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("ativo", false);
    pendentes = count ?? 0;
  }

  const links = [
    { href: "/", label: "Início" },
    { href: "/pesquisa", label: "Pesquisa" },
    { href: "/coleta", label: "Coleta" },
    ...(profile.papel === "admin"
      ? [
          { href: "/importar-historico", label: "Importar histórico" },
          { href: "/usuarios", label: "Usuários", badge: pendentes },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <header className="bg-brand-dark text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 sm:py-3">
          <Link href="/" aria-label="Metta Estudantil — início" className="shrink-0">
            <Image src="/brand/logo.jpg" alt="Metta Estudantil" width={618} height={383} className="h-12 w-auto sm:h-14" priority />
          </Link>
          {/* No celular os links descem para uma segunda linha, com rolagem lateral se não couberem. */}
          <nav className="order-last flex w-full gap-5 overflow-x-auto whitespace-nowrap pb-1 text-sm text-white/80 sm:order-none sm:w-auto sm:flex-1 sm:pb-0">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="py-1 hover:text-accent">
                {l.label}
                {"badge" in l && l.badge ? (
                  <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-extrabold text-brand-dark">{l.badge}</span>
                ) : null}
              </Link>
            ))}
          </nav>
          <Link href="/perfil" className="ml-auto max-w-[9rem] truncate text-xs text-white/70 hover:text-accent sm:ml-0 sm:max-w-none" title="Editar meu perfil">
            {displayName(profile)} · {profile.papel === "admin" ? "Admin" : "Consultor"}
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
