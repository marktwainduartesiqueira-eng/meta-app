import XLSX from "xlsx";
import { readFileSync } from "node:fs";
import { parseCompiladoSheet } from "../../src/lib/import/compilado";
for (const ed of ["25.1", "25.2", "26.1"]) {
  const wb = XLSX.read(readFileSync(`Tabelas/Dados Compilados - FIES ${ed}.xlsx`), { type: "buffer" });
  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: "" }) as never;
    const seen = new Map<string, string>();
    for (const r of parseCompiladoSheet(name, rows)) {
      if (seen.has(r.chave)) console.log(ed, name.trim(), "DUP", r.chave, seen.get(r.chave), r.cursoCodigo, r.campus);
      seen.set(r.chave, r.cursoCodigo);
    }
  }
}
