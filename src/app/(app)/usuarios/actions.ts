"use server";

import { revalidatePath } from "next/cache";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";

/** Aprova/desativa um usuário ou troca o papel. Só admin (RLS e trigger também barram). */
export async function atualizarUsuario(id: string, mudanca: { ativo?: boolean; papel?: "admin" | "consultor" }) {
  const me = await getCurrentProfile();
  if (me?.papel !== "admin") return { erro: "Apenas administradores podem alterar usuários." };
  if (id === me.id) return { erro: "Você não pode alterar a sua própria conta por aqui." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(mudanca).eq("id", id);
  if (error) return { erro: error.message };
  revalidatePath("/usuarios");
  revalidatePath("/", "layout");
  return { erro: null };
}
