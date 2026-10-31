import XLSX from "xlsx";
import { readFileSync, writeFileSync } from "node:fs";
import { parseSheet } from "../src/lib/collect/sheet";
import { buildCollections } from "../src/lib/collect/pipeline";
import { indexTemplate, matchToTemplate } from "../src/lib/collect/template";
import { fillTemplate, type FillItem } from "../src/lib/collect/fill-template";

const [rawFile, tplFile, outFile] = process.argv.slice(2);
const rd = (f: string) => XLSX.read(readFileSync(f), { type: "buffer" });
const rowsOf = (ws: XLSX.WorkSheet) => XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" }) as never;
const tpl = rd(tplFile);
const idx = indexTemplate(tpl.SheetNames.map((name) => ({ name, rows: rowsOf(tpl.Sheets[name]) })));
const raw = rd(rawFile);
const parsed = raw.SheetNames.flatMap((n) => {
  const p = parseSheet(n, rowsOf(raw.Sheets[n]));
  return p ? [p] : [];
});
const items: FillItem[] = [];
for (const { collection: c } of buildCollections(parsed)) {
  const m = matchToTemplate(c, idx);
  if (m.status !== "auto" || c.result.revisar.length) continue;
  const r = c.result;
  items.push({ entry: m.entry!, values: { inscritos: r.inscritos, preSelecionados: r.preSelecionados, postergados: r.postergados, desistentes: r.desistentes, reprovados: r.reprovados, posicaoUltimoChamado: r.posicaoUltimoChamado, notaUltimoAprovado: r.notaUltimoAprovado } });
}
const buf = readFileSync(tplFile);
fillTemplate(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer, idx, items, {}).then((o) => {
  writeFileSync(outFile, Buffer.from(o.bytes));
  console.log("linhas:", items.length, "células:", o.written, "tamanho:", o.bytes.byteLength);
});
