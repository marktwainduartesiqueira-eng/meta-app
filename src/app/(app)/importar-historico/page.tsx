import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";
import ImportForm from "./import-form";

export default async function ImportarHistoricoPage() {
  const profile = await getCurrentProfile();
  if (profile?.papel !== "admin") redirect("/");
  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 font-display text-2xl font-extrabold text-brand-dark sm:text-3xl">Importar histórico</h1>
      <p className="mb-6 text-sm text-muted">
        Carrega uma planilha “Dados Compilados” de uma edição para o banco de notas. Reimportar a mesma edição
        atualiza os registros existentes.
      </p>
      <ImportForm />
    </div>
  );
}
