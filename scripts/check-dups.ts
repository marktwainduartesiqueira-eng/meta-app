import XLSX from "xlsx";
import { readFileSync } from "node:fs";
import { parseCandidates } from "../src/lib/collect/sheet";

const wb = XLSX.read(readFileSync(process.argv[2]), { type: "buffer" });
for (const name of wb.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: "" });
  const { candidates } = parseCandidates(rows as never);
  const by = new Map<string, typeof candidates>();
  for (const c of candidates) by.set(c.inscription, [...(by.get(c.inscription) ?? []), c]);
  for (const [k, v] of by) {
    if (k && v.length > 1) console.log(name, k, v.map((c) => `${c.rank}:${c.name}:${c.score}:${c.statusRaw}`));
  }
}
