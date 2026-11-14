import { getCurrentProfile } from "@/lib/supabase/server";
import { displayName } from "@/lib/names";
import PerfilForm from "./perfil-form";

export default async function PerfilPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  return (
    <div className="max-w-lg">
      <h1 className="mb-1 font-display text-2xl font-extrabold text-brand-dark sm:text-3xl">Meu perfil</h1>
      <p className="mb-6 text-sm text-muted">
        Escolha como você quer ser chamado(a). É esse nome que aparece nas saudações do sistema.
      </p>
      <PerfilForm
        id={profile.id}
        nome={profile.nome}
        apelido={profile.apelido ?? ""}
        email={profile.email ?? ""}
        preview={displayName(profile)}
      />
    </div>
  );
}
