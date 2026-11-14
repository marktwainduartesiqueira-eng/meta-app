// Executa o motor de coleta sobre uma planilha bruta e imprime um resumo (verificação manual).
import XLSX from "xlsx";
import { readFileSync } from "node:fs";
import { collectSheet } from "../../src/lib/collect/sheet";

const file = process.argv[2];
const wb = XLSX.read(readFileSync(file), { type: "buffer" });
const rows: Record<string, unknown>[] = [];
let skipped = 0;
let review = 0;
const reasons = new Map<string, number>();

for (const name of wb.SheetNames) {
  const data = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: "" });
  const out = collectSheet(name, data as never);
  if (!out) {
    skipped++;
    continue;
  }
  const r = out.result;
  if (r.revisar.length) review++;
  for (const x of r.revisar) reasons.set(x.replace(/\(.*\)/, ""), (reasons.get(x.replace(/\(.*\)/, "")) ?? 0) + 1);
  rows.push({
    UF: out.meta.uf,
    IES: out.meta.iesNome.slice(0, 28),
    Mun: out.meta.municipio.slice(0, 14),
    CodIES: out.meta.iesCodigo,
    CodCurso: out.meta.cursoCodigo,
    Mod: out.modality,
    Insc: r.inscritos,
    Pre: r.preSelecionados,
    Post: r.postergados,
    Desi: r.desistentes,
    Repr: r.reprovados,
    Pos: r.posicaoUltimoChamado,
    Nota: r.notaUltimoAprovado,
    Status: r.revisar.length ? "REVISAR " + r.revisar.join("; ") : "VALIDADO",
  });
}
console.table(rows.slice(0, Number(process.argv[3] ?? 15)));
console.log({ abas: wb.SheetNames.length, processadas: rows.length, ignoradas: skipped, revisar: review });
console.log([...reasons]);
