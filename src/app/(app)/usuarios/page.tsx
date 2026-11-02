import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import UserActions from "./user-actions";

interface Row {
  id: string;
  nome: string;
  apelido: string | null;
  email: string | null;
  papel: "admin" | "consultor";
  ativo: boolean;
  created_at: string;
}

export default async function UsuariosPage() {
  const me = await getCurrentProfile();
  if (me?.papel !== "admin") {
    return <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted">Apenas administradores acessam esta página.</p>;
  }
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id,nome,apelido,email,papel,ativo,created_at").order("created_at");
  const rows = (data ?? []) as Row[];
  // "Aguardando" = ainda inativo e nunca aprovado; aproximamos por inativo (reativar usa o mesmo botão).
  const aguardando = rows.filter((r) => !r.ativo);
  const ativos = rows.filter((r) => r.ativo);

  const fmt = (d: string) => new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const Table = ({ list, pendente }: { list: Row[]; pendente: boolean }) => (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-white text-left text-xs text-muted">
          <tr>
            <th className="px-3 py-2">Nome</th>
            <th className="px-3 py-2">E-mail</th>
            <th className="px-3 py-2">Cadastro</th>
            <th className="px-3 py-2">Ação</th>
          </tr>
        </thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.id} className="border-t border-border">
              <td className="px-3 py-2">
                <div className="font-medium">{u.nome || "—"}</div>
                {u.apelido && <div className="text-xs text-muted">“{u.apelido}”</div>}
              </td>
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2 whitespace-nowrap">{fmt(u.created_at)}</td>
              <td className="px-3 py-2">
                {u.id === me.id ? <span className="text-xs text-muted">Você</span> : <UserActions id={u.id} ativo={u.ativo} papel={u.papel} pendente={pendente} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-brand-dark">Usuários</h1>
        <p className="text-sm text-muted">Quem se cadastra pelo “Primeiro acesso” fica aguardando aqui até você aprovar.</p>
      </div>

      <section>
        <h2 className="mb-2 font-display text-lg font-extrabold text-brand-dark">
          Aguardando aprovação / desativados ({aguardando.length})
        </h2>
        {aguardando.length ? <Table list={aguardando} pendente /> : <p className="text-sm text-muted">Ninguém aguardando.</p>}
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg font-extrabold text-brand-dark">Equipe ativa ({ativos.length})</h2>
        <Table list={ativos} pendente={false} />
      </section>
    </div>
  );
}
