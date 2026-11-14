import JSZip from "jszip";
import { readFileSync } from "node:fs";

const [a, b] = process.argv.slice(2);
const stats = async (f) => {
  const z = await JSZip.loadAsync(readFileSync(f));
  const out = {};
  const wb = await z.file("xl/workbook.xml").async("string");
  const names = [...wb.matchAll(/<sheet [^>]*name="([^"]+)"/g)].map((m) => m[1]);
  out.names = names;
  out.files = Object.keys(z.files).filter((n) => !n.endsWith("/")).length;
  for (let i = 1; i <= names.length; i++) {
    const x = await z.file(`xl/worksheets/sheet${i}.xml`).async("string");
    out[names[i - 1]] = {
      rows: (x.match(/<row /g) ?? []).length,
      hidden: (x.match(/<row [^>]*hidden="1"/g) ?? []).length,
      ht: (x.match(/<row [^>]*ht="/g) ?? []).length,
      custom: (x.match(/customHeight="1"/g) ?? []).length,
      merges: (x.match(/<mergeCell /g) ?? []).length,
      cols: (x.match(/<col /g) ?? []).length,
      cf: (x.match(/<conditionalFormatting/g) ?? []).length,
      sheetFormatPr: (x.match(/<sheetFormatPr[^>]*>/) ?? [""])[0],
      outline: (x.match(/outlineLevel="/g) ?? []).length,
    };
  }
  return out;
};
const A = await stats(a);
const B = await stats(b);
console.log("names", JSON.stringify(A.names) === JSON.stringify(B.names), "files", A.files, B.files);
for (const n of A.names) console.log(n, "\n  orig", JSON.stringify(A[n]), "\n  out ", JSON.stringify(B[n]));
