import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ClipboardCheck,
  Database,
  FileText,
  GraduationCap,
  MapPin,
  Search,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { displayName } from "@/lib/names";

const PHRASES = [
  "Cada nota conta uma história. Vamos ajudar mais um aluno a conquistar a bolsa?",
  "Dados bem organizados viram decisões seguras. Bom trabalho hoje!",
  "Por trás de cada nota existe um sonho. Bora transformá-lo em aprovação!",
  "Informação clara é o primeiro passo para a bolsa de Medicina.",
  "Precisão em primeiro lugar: é ela que dá confiança ao aluno e à família.",
  "Hoje é dia de aproximar mais um estudante do curso que ele sempre sonhou.",
];

function greeting() {
  const h = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()));
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default async function Home() {
  const [supabase, profile] = await Promise.all([createClient(), getCurrentProfile()]);
  const [eds, ies, cursos, regs] = await Promise.all([
    supabase.from("editions").select("codigo", { count: "exact" }).order("codigo"),
    supabase.from("ies").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("cutoff_records").select("id", { count: "exact", head: true }),
  ]);
  const isAdmin = profile?.papel === "admin";
  const day = Number(new Intl.DateTimeFormat("en-CA", { day: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date()));
  const phrase = PHRASES[day % PHRASES.length];
  const editions = (eds.data ?? []).map((e) => e.codigo as string);

  const stats = [
    { label: "Edições no banco", value: eds.count ?? 0, icon: Database, tone: "bg-brand text-white", sub: editions.join(" · ") || "nenhuma ainda" },
    { label: "Instituições (IES)", value: ies.count ?? 0, icon: Building2, tone: "bg-sun text-brand-dark", sub: "faculdades de Medicina" },
    { label: "Cursos e campi", value: cursos.count ?? 0, icon: MapPin, tone: "bg-white text-brand-dark border border-border", sub: "em todo o Brasil" },
    { label: "Registros de notas", value: regs.count ?? 0, icon: BarChart3, tone: "bg-brand-dark text-white", sub: "histórico por modalidade" },
  ];

  const actions = [
    { href: "/pesquisa", title: "Pesquisar faculdades", text: "Filtre por nota, modalidade e região e veja o histórico de cada curso.", icon: Search, tone: "bg-sun text-brand-dark", show: true },
    { href: "/pesquisa", title: "Gerar relatório PDF", text: "Monte um relatório com a marca da Metta para o aluno levar para casa.", icon: FileText, tone: "bg-white text-brand-dark border border-border", show: true },
    { href: "/coleta", title: "Coleta de dados", text: "Transforme as planilhas brutas do MEC na Tabela Modelo, com revisão.", icon: ClipboardCheck, tone: "bg-brand text-white", show: true },
    { href: "/importar-historico", title: "Importar histórico", text: "Adicione ao banco as notas de uma edição já compilada.", icon: UploadCloud, tone: "bg-brand-dark text-white", show: isAdmin },
  ].filter((a) => a.show);

  const steps = [
    { n: 1, t: "Informe a nota", d: "Coloque a nota do ENEM do aluno e escolha a modalidade." },
    { n: 2, t: "Compare as opções", d: "Veja as 3 melhores chances com o histórico de cada edição." },
    { n: 3, t: "Entregue o relatório", d: "Gere o PDF e envie ao aluno com o contato da Metta." },
  ];

  return (
    <div className="space-y-8">
      {/* Boas-vindas */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-dark px-6 py-10 text-white sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -left-10 -top-12 h-44 w-44 rounded-full bg-sun" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-64 w-64 rounded-full bg-brand/70" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-52 w-52 rounded-[3rem] bg-sun/90 rotate-12" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="pl-0 sm:pl-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
              <Sparkles size={14} className="text-sun" /> Assessoria FIES · Metta Estudantil
            </span>
            <h1 className="mt-4 font-display text-3xl font-black leading-tight sm:text-5xl">
              {greeting()}, <span className="text-sun">{profile ? displayName(profile) : ""}</span>!
            </h1>
            <p className="mt-3 max-w-xl text-base text-white/85 sm:text-lg">{phrase}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/pesquisa" className="inline-flex items-center gap-2 rounded-xl bg-sun px-5 py-3 text-sm font-extrabold text-brand-dark transition hover:-translate-y-0.5 hover:shadow-lg">
                Começar uma pesquisa <ArrowRight size={16} />
              </Link>
              <Link href="/coleta" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-bold transition hover:bg-white/10">
                Abrir a coleta
              </Link>
            </div>
          </div>

          {/* Cartão no estilo dos posts da Metta */}
          <div className="floaty relative mx-auto w-full max-w-xs">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sun text-brand-dark">
                  <GraduationCap size={24} />
                </span>
                <div>
                  <div className="font-display text-sm font-extrabold">Bolsa de Medicina</div>
                  <div className="text-xs text-white/70">Seu aluno mais perto do sonho</div>
                </div>
              </div>
              <div className="rounded-xl bg-white p-3 text-brand-dark">
                <div className="text-[11px] font-semibold uppercase text-muted">Edições no banco</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(editions.length ? editions : ["—"]).map((e) => (
                    <span key={e} className="rounded-full bg-sun px-2.5 py-0.5 text-xs font-extrabold">{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${s.tone}`}>
            <s.icon className="absolute -right-2 -top-2 opacity-15" size={86} />
            <div className="relative">
              <div className="text-sm font-semibold opacity-80">{s.label}</div>
              <div className="font-display mt-1 text-4xl font-black">{s.value.toLocaleString("pt-BR")}</div>
              <div className="mt-1 text-xs opacity-75">{s.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Atalhos */}
      <section>
        <h2 className="font-display mb-4 text-xl font-extrabold text-brand-dark">O que vamos fazer hoje?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((a) => (
            <Link key={a.title} href={a.href} className={`group flex flex-col rounded-3xl p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${a.tone}`}>
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/10">
                <a.icon size={24} />
              </span>
              <h3 className="font-display text-lg font-extrabold leading-snug">{a.title}</h3>
              <p className="mt-1 flex-1 text-sm opacity-85">{a.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold">
                Abrir <ArrowRight size={15} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Passo a passo */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="font-display mb-5 text-xl font-extrabold text-brand-dark">Do atendimento ao relatório, em 3 passos</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-4">
              <span className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sun text-lg font-black text-brand-dark">{s.n}</span>
              <div>
                <div className="font-display font-extrabold text-brand-dark">{s.t}</div>
                <p className="text-sm text-muted">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="pb-4 text-center text-xs text-muted">
        Metta Estudantil · @mettaestudantil · contato@mettaestudantil.com
      </p>
    </div>
  );
}
