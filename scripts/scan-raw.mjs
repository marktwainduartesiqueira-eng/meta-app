// Varredura exploratória da planilha bruta: lista situações, tipos de vaga e modalidades reais.
import XLSX from "xlsx";
import { readFileSync } from "node:fs";

const file = process.argv[2];
const wb = XLSX.read(readFileSync(file), { type: "buffer" });
const situ = new Map();
const hdr = new Map();
let candidates = 0;
let weird = [];

for (const name of wb.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: "" });
  const get = (r, c) => String(rows[r]?.[c] ?? "").trim();
  const tipo = get(16, 1);
  const mod = get(17, 1);
  const k = `${tipo} | ${mod}`;
  hdr.set(k, (hdr.get(k) ?? 0) + 1);
  if (!get(14, 1) && !get(13, 1)) weird.push(name);
  for (let r = 20; r < rows.length; r++) {
    const cls = get(r, 0);
    const nome = get(r, 1);
    if (/Lugar/i.test(cls) && nome) {
      candidates++;
      const s = get(r, 7);
      situ.set(s, (situ.get(s) ?? 0) + 1);
    }
  }
}
console.log("sheets:", wb.SheetNames.length, "candidates:", candidates);
console.log("tipo|modalidade:", [...hdr]);
console.log("situacoes:", [...situ].sort((a, b) => b[1] - a[1]));
console.log("abas sem cabecalho:", weird);
