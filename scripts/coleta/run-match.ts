import XLSX from "xlsx";
import { readFileSync } from "node:fs";
import { parseSheet } from "../../src/lib/collect/sheet";
import { buildCollections } from "../../src/lib/collect/pipeline";
import { indexTemplate, matchToTemplate } from "../../src/lib/collect/template";

const [rawFile, tplFile] = process.argv.slice(2);
const rd = (f: string) => XLSX.read(readFileSync(f), { type: "buffer" });
const tpl = rd(tplFile);
const idx = indexTemplate(
  tpl.SheetNames.map((name) => ({ name, rows: XLSX.utils.sheet_to_json(tpl.Sheets[name], { header: 1, raw: true, defval: "" }) as never })),
);
console.log("template entries:", idx.entries.length, "ref:", tpl.Sheets[tpl.SheetNames[0]]["!ref"]);

const raw = rd(rawFile);
const parsed = raw.SheetNames.flatMap((n) => {
  const p = parseSheet(n, XLSX.utils.sheet_to_json(raw.Sheets[n], { header: 1, raw: true, defval: "" }) as never);
  return p ? [p] : [];
});
const cols = buildCollections(parsed);
let auto = 0;
const pend: string[] = [];
const usedRows = new Map<string, number>();
for (const { collection: c } of cols) {
  const m = matchToTemplate(c, idx);
  if (m.status === "auto") {
    auto++;
    const k = `${m.entry!.modality}#${m.entry!.rowIndex}`;
    usedRows.set(k, (usedRows.get(k) ?? 0) + 1);
  } else pend.push(`${c.meta.uf} ${c.meta.iesNome} [${c.meta.iesCodigo}/${c.meta.cursoCodigo}] ${c.meta.municipio} -> ${m.reason}${m.entry ? " sug:" + m.entry.cursoCodigo : ""}`);
}
console.log({ colecoes: cols.length, auto, pendentes: pend.length, linhasRepetidas: [...usedRows.values()].filter((n) => n > 1).length });
console.log(pend.join("\n"));
