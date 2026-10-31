import XLSX from "xlsx";
import { readFileSync } from "node:fs";

const wb = XLSX.read(readFileSync(process.argv[2]), { type: "buffer" });
for (const name of wb.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: "" }) as unknown[][];
  const blocks: string[] = [];
  rows.forEach((r, i) => {
    const a = String(r[0] ?? "").trim().toUpperCase();
    if (a === "CURSO:" || a === "IES:") blocks.push(`${i + 1}:${a}${String(r[1] ?? "").slice(0, 60)}`);
  });
  const cursos = blocks.filter((b) => b.includes(":CURSO:"));
  if (cursos.length !== 1) console.log(name, "blocos de curso:", cursos.length, blocks.slice(0, 6));
}
