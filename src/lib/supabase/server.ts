import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Chamado de um Server Component: o proxy já renova a sessão.
          }
        },
      },
    },
  );
}

export interface Profile {
  id: string;
  nome: string;
  apelido: string | null;
  email: string | null;
  papel: "admin" | "consultor";
  ativo: boolean;
}

/** Usuário logado + perfil, ou null. Em cache por requisição (layout e página compartilham). */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  // getClaims valida o JWT localmente, sem ida ao servidor de autenticação.
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id,nome,apelido,email,papel,ativo")
    .eq("id", id)
    .single();
  return (profile as Profile | null) ?? null;
});
