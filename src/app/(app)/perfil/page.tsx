import { getCurrentProfile } from "@/lib/supabase/server";
import { displayName } from "@/lib/names";
import PerfilForm from "./perfil-form";

export default async function PerfilPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  return (
    <div className="max-w-lg">
      <h1 className="mb-2 t-title text-brand-dark">Meu perfil</h1>
      <p className="t-lead mb-6 text-muted">
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
