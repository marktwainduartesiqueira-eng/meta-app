import XLSX from "xlsx";
import { readFileSync } from "node:fs";
import { indexTemplate } from "../src/lib/collect/template";

const tpl = XLSX.read(readFileSync(process.argv[2]), { type: "buffer" });
const idx = indexTemplate(
  tpl.SheetNames.map((name) => ({ name, rows: XLSX.utils.sheet_to_json(tpl.Sheets[name], { header: 1, raw: true, defval: "" }) as never })),
);
const ac = idx.entries.filter((e) => e.modality === "AC");
const byUf = new Map<string, number>();
ac.forEach((e) => byUf.set(e.uf, (byUf.get(e.uf) ?? 0) + 1));
console.log("AC rows:", ac.length, [...byUf]);
for (const uf of ["TO", "MA", "PA"]) console.log(uf, ac.filter((e) => e.uf === uf).slice(0, 4).map((e) => `${e.iesCodigo}/${e.cursoCodigo} ${e.iesNome} | ${e.campus}`));
