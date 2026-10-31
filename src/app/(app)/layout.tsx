import Image from "next/image";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/supabase/server";
import { displayName } from "@/lib/names";
import SignOutButton from "./sign-out-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || !profile.ativo) {
    // Não redireciona para /login: o proxy devolveria para cá e criaria um laço.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-sm text-sm text-muted">
          Não foi possível carregar seu perfil, ou sua conta está desativada. Fale com o administrador.
        </p>
        <div className="rounded-lg bg-brand-dark p-2">
          <SignOutButton />
        </div>
      </div>
    );
  }

  const links = [
    { href: "/", label: "Início" },
    { href: "/pesquisa", label: "Pesquisa" },
    { href: "/coleta", label: "Coleta" },
    ...(profile.papel === "admin" ? [{ href: "/importar-historico", label: "Importar histórico" }] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <header className="bg-brand-dark text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link href="/" aria-label="Metta Estudantil — início">
            <Image src="/brand/logo.jpg" alt="Metta Estudantil" width={618} height={383} className="h-14 w-auto" priority />
          </Link>
          <nav className="flex flex-1 gap-4 text-sm text-white/80">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-accent">
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/perfil" className="hidden text-xs text-white/70 hover:text-accent sm:block" title="Editar meu perfil">
            {displayName(profile)} · {profile.papel === "admin" ? "Admin" : "Consultor"}
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
