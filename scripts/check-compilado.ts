import XLSX from "xlsx";
import { readFileSync } from "node:fs";
import { mapColumns, parseCompiladoSheet } from "../src/lib/import/compilado";

for (const ed of ["25.1", "25.2", "26.1"]) {
  const wb = XLSX.read(readFileSync(`..\\Dados Compilados - FIES ${ed}.xlsx`), { type: "buffer" });
  console.log("=== edição", ed);
  const keys = new Set<string>();
  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: "" }) as never;
    const recs = parseCompiladoSheet(name, rows);
    recs.forEach((r) => keys.add(r.chave));
    const cnt = (f: (r: (typeof recs)[number]) => unknown) => recs.filter((r) => f(r) != null).length;
    console.log(
      `${name.trim().padEnd(10)} recs=${recs.length} corte=${cnt((r) => r.notaCorte)} vagas=${cnt((r) => r.vagas)} insc=${cnt((r) => r.inscritos)} pos=${cnt((r) => r.posUltimoChamado)} nota=${cnt((r) => r.notaUltimoAprovado)} ensino=${cnt((r) => r.info.tipoEnsino)} sal=${cnt((r) => r.info.expectativaSalario)}`,
    );
    if (name === wb.SheetNames[0]) console.log("  colunas:", mapColumns(rows), "\n  ex:", JSON.stringify(recs[0]));
  }
  console.log("cursos distintos:", keys.size);
}
