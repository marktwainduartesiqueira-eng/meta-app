import XLSX from "xlsx";
import { readFileSync } from "node:fs";
import { parseSheetMeta } from "../../src/lib/collect/sheet";

const wb = XLSX.read(readFileSync(process.argv[2]), { type: "buffer" });
let sheetsWithForeign = 0;
let foreignRows = 0;
let dupsSameCourse = 0;
const samples: string[] = [];
for (const name of wb.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: "" }) as unknown[][];
  const meta = parseSheetMeta(rows as never);
  if (!meta) continue;
  let foreign = 0;
  const seen = new Set<string>();
  for (const r of rows) {
    if (!/^\d+\s*[°ºo]?\s*lugar/i.test(String(r[0]))) continue;
    const code = String(r[4]).match(/\((\d+)\)/)?.[1] ?? "";
    if (code !== meta.cursoCodigo) {
      foreign++;
      if (samples.length < 6) samples.push(`${name} | sheet=${meta.cursoCodigo} row=${code} ${r[6]}`);
      continue;
    }
    const key = String(r[3]);
    if (seen.has(key)) dupsSameCourse++;
    seen.add(key);
  }
  if (foreign) {
    sheetsWithForeign++;
    foreignRows += foreign;
  }
}
console.log({ sheetsWithForeign, foreignRows, dupsSameCourse });
console.log(samples);
