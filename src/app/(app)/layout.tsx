import Image from "next/image";
import Link from "next/link";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { displayName } from "@/lib/names";
import { MorphicNavbar } from "@/components/kokonutui/morphic-navbar";
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

  // Mesmos links de antes (admin vê Importar e Usuários); o selo de pendentes continua em "Usuários".
  const navItems = Object.fromEntries(
    links.map((l) => [
      l.href,
      {
        name:
          "badge" in l && l.badge ? (
            <span className="inline-flex items-center">
              {l.label}
              <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-xs font-extrabold text-brand-dark">{l.badge}</span>
            </span>
          ) : (
            l.label
          ),
      },
    ]),
  );

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <header className="z-40 bg-brand-dark text-white lg:sticky lg:top-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 sm:py-3">
          <Link href="/" aria-label="Metta Estudantil — início" className="shrink-0">
            <Image src="/brand/logo.png" alt="Metta Estudantil" width={603} height={300} className="h-11 w-auto sm:h-12" priority />
          </Link>
          {/* Menu Morphic (KokonutUI): no celular desce para uma segunda linha, com rolagem lateral se não couber. */}
          <div className="nav-scroll scroll-shadow-dark order-last w-full overflow-x-auto whitespace-nowrap pb-1 [scrollbar-width:none] lg:order-none lg:w-auto lg:flex-1 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            <MorphicNavbar items={navItems} compact className="justify-start px-0 py-0" />
          </div>
          <Link href="/perfil" className="ml-auto max-w-[9rem] truncate text-xs text-white/80 hover:text-white sm:ml-0 sm:max-w-none lg:text-sm" title="Editar meu perfil">
            {displayName(profile)} · {profile.papel === "admin" ? "Admin" : "Consultor"}
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:py-10">{children}</main>
    </div>
  );
}
