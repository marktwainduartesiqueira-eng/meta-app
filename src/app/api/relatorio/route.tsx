import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile, createClient } from "@/lib/supabase/server";
import { runSearch } from "@/lib/search";
import { Relatorio } from "@/lib/pdf/relatorio";
import { mensagemMotivacional } from "@/lib/pdf/mensagens";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !profile.ativo) return new NextResponse("Não autorizado", { status: 401 });

  const sp = Object.fromEntries(request.nextUrl.searchParams.entries());
  const supabase = await createClient();
  const out = await runSearch(supabase, sp);
  if (out.error) return new NextResponse(`Erro na consulta: ${out.error}`, { status: 500 });

  const filtros = [
    sp.regiao && `região ${sp.regiao}`,
    sp.uf && `UF ${sp.uf.toUpperCase()}`,
    sp.q && `busca “${sp.q}”`,
    sp.so_chances && "só chance Alta/Média",
  ]
    .filter(Boolean)
    .join(" · ");

  const aluno = (sp.nome ?? "").trim().slice(0, 80);
  const buffer = await renderToBuffer(
    <Relatorio
      aluno={aluno}
      nota={out.nota}
      modalidade={out.modalidade}
      filtros={filtros}
      editions={out.editions}
      items={out.list}
      total={out.total}
      data={new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
      mensagem={mensagemMotivacional(`${aluno}|${out.nota ?? ""}`)}
      logo={{ data: await readFile(path.join(process.cwd(), "public", "brand", "logo.jpg")), format: "jpg" }}
      qr={{ data: await readFile(path.join(process.cwd(), "public", "brand", "qr-instagram.jpg")), format: "jpg" }}
    />,
  );

  const safeName = (aluno || "geral").normalize("NFD").replace(/[^\w]+/g, "_");
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="relatorio_fies_${safeName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
