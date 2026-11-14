import XLSX from "xlsx";
import { readFileSync } from "node:fs";

const [file, sheet, from, to] = process.argv.slice(2);
const wb = XLSX.read(readFileSync(file), { type: "buffer" });
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { header: 1, raw: true, defval: "" }) as unknown[][];
console.log("rows:", rows.length);
rows.slice(Number(from), Number(to)).forEach((r, i) =>
  console.log(Number(from) + i + 1, r.slice(0, 10).map((c) => String(c).slice(0, 40)).join(" | ")),
);
