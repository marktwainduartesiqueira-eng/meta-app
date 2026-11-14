import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";
import ImportForm from "./import-form";

export const metadata = { title: "Importar histórico" };

export default async function ImportarHistoricoPage() {
  const profile = await getCurrentProfile();
  if (profile?.papel !== "admin") redirect("/");
  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 t-title text-brand-dark">Importar histórico</h1>
      <p className="t-lead mb-6 text-muted">
        Carrega uma planilha “Dados Compilados” de uma edição para o banco de notas. Reimportar a mesma edição
        atualiza os registros existentes.
      </p>
      <ImportForm />
    </div>
  );
}
