import XLSX from "xlsx";
import { readFileSync } from "node:fs";

const [file, sheet] = process.argv.slice(2);
const wb = XLSX.read(readFileSync(file), { type: "buffer" });
const name = sheet ?? wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: "" }) as unknown[][];
console.log(file.split("\\").pop(), name, "rows", rows.length);
for (let i = 0; i < 4; i++) {
  console.log(
    "H" + i,
    rows[i].map((c, j) => (String(c).trim() ? `${XLSX.utils.encode_col(j)}=${String(c).replace(/\s+/g, " ").slice(0, 38)}` : "")).filter(Boolean).join(" ; "),
  );
}
let data = 0;
const sample: string[] = [];
for (const r of rows) {
  if (/\(\d+\)/.test(String(r[1])) && /\d/.test(String(r[2]))) {
    data++;
    if (sample.length < 2) sample.push(r.map((c, j) => `${XLSX.utils.encode_col(j)}=${String(c).slice(0, 30)}`).join(" ; "));
  }
}
console.log("data rows:", data);
console.log(sample);
