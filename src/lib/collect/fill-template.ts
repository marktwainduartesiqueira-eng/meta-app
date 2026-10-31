import JSZip from "jszip";
import type { CollectIndicators } from "./types";
import type { TemplateEntry, TemplateIndex } from "./template";

export interface FillItem {
  entry: TemplateEntry;
  /** Valores nulos não são escritos (a célula fica como está). */
  values: {
    [K in
      | "inscritos"
      | "preSelecionados"
      | "postergados"
      | "desistentes"
      | "reprovados"
      | "posicaoUltimoChamado"
      | "notaUltimoAprovado"]: CollectIndicators[K] | null;
  };
}

const FIELD_TO_COLUMN: Record<keyof FillItem["values"], string> = {
  inscritos: "inscritos",
  preSelecionados: "pre",
  postergados: "postergados",
  desistentes: "desistentes",
  reprovados: "reprovados",
  posicaoUltimoChamado: "pos",
  notaUltimoAprovado: "nota",
};

function colLetter(index0: number): string {
  let n = index0 + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function colIndex(letters: string): number {
  return [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
}

const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");

/** Resolve o caminho do XML de cada aba (nome → arquivo) lendo workbook.xml e suas relações. */
async function sheetFiles(zip: JSZip): Promise<Map<string, string>> {
  const wb = await zip.file("xl/workbook.xml")!.async("string");
  const rels = await zip.file("xl/_rels/workbook.xml.rels")!.async("string");
  const target = new Map<string, string>();
  for (const m of rels.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = m[0].match(/\bId="([^"]+)"/)?.[1];
    const t = m[0].match(/\bTarget="([^"]+)"/)?.[1];
    if (id && t) target.set(id, t.startsWith("/") ? t.slice(1) : `xl/${t}`);
  }
  const out = new Map<string, string>();
  for (const m of wb.matchAll(/<sheet\b[^>]*>/g)) {
    const name = m[0].match(/\bname="([^"]*)"/)?.[1];
    const rid = m[0].match(/\br:id="([^"]+)"/)?.[1];
    const file = rid ? target.get(rid) : undefined;
    if (name && file) out.set(decode(name), file);
  }
  return out;
}

/**
 * Escreve números em células de uma aba alterando só o XML dessas células:
 * estilos, alturas de linha, larguras, formatações condicionais e demais arquivos ficam intactos.
 * Retorna o XML novo e quantas células foram escritas; células com fórmula são puladas.
 */
export function patchSheetXml(
  xml: string,
  edits: Map<number, Map<number, number>>,
): { xml: string; written: number; skipped: number } {
  let written = 0;
  let skipped = 0;
  const out = xml.replace(/<row\b[^>]*?(?:\/>|>[\s\S]*?<\/row>)/g, (rowXml) => {
    const rowNum = Number(rowXml.match(/\br="(\d+)"/)?.[1]);
    const cols = edits.get(rowNum);
    if (!cols) return rowXml;

    // Linha vazia no formato <row .../> vira <row ...></row>.
    let open: string;
    let body: string;
    if (/\/>$/.test(rowXml) && !/<\/row>$/.test(rowXml)) {
      open = rowXml.replace(/\s*\/>$/, ">");
      body = "";
    } else {
      open = rowXml.match(/^<row\b[^>]*>/)![0];
      body = rowXml.slice(open.length, rowXml.length - "</row>".length);
    }

    const cells: { col: number; xml: string }[] = [];
    for (const m of body.matchAll(/<c\b[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g)) {
      const ref = m[0].match(/\br="([A-Z]+)\d+"/)?.[1];
      if (ref) cells.push({ col: colIndex(ref), xml: m[0] });
    }

    for (const [col, value] of cols) {
      const ref = `${colLetter(col)}${rowNum}`;
      const existing = cells.find((c) => c.col === col);
      if (existing && /<f\b/.test(existing.xml)) {
        skipped++;
        continue;
      }
      const style = existing?.xml.match(/^<c\b[^>]*\bs="(\d+)"/)?.[1];
      const cellXml = `<c r="${ref}"${style ? ` s="${style}"` : ""}><v>${value}</v></c>`;
      if (existing) existing.xml = cellXml;
      else cells.push({ col, xml: cellXml });
      written++;
    }
    cells.sort((a, b) => a.col - b.col);
    return `${open}${cells.map((c) => c.xml).join("")}</row>`;
  });
  return { xml: out, written, skipped };
}

/** Textos da tabela de strings compartilhadas, na ordem dos índices. */
export function parseSharedStrings(xml: string): string[] {
  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((m) =>
    decode([...m[1].replace(/<rPh\b[\s\S]*?<\/rPh>/g, "").matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")),
  );
}

/** Quebra o texto em linhas por palavra, como a célula com "quebrar texto" faz. */
function wrappedLines(text: string, charsPerLine: number): number {
  let lines = 0;
  for (const para of text.split(/\r?\n/)) {
    let cur = 0;
    let n = 1;
    for (const word of para.split(/\s+/).filter(Boolean)) {
      let w = word.length;
      while (w > charsPerLine) {
        // palavra maior que a linha: ocupa linhas inteiras
        n += cur > 0 ? 1 : 0;
        w -= charsPerLine;
        cur = 0;
      }
      if (cur === 0) cur = w;
      else if (cur + 1 + w <= charsPerLine) cur += 1 + w;
      else {
        n++;
        cur = w;
      }
    }
    lines += n;
  }
  return Math.max(lines, 1);
}

const LINE_PT = 12.75;
const PAD_PT = 3;

/**
 * Aumenta a altura das linhas cujo texto (colunas B e C, que quebram em várias linhas) não cabe.
 * Nunca diminui uma altura existente. Só mexe nos atributos ht/customHeight da linha.
 */
export function fitRowHeights(xml: string, strings: string[]): { xml: string; adjusted: number } {
  const widths = new Map<number, number>();
  for (const m of xml.matchAll(/<col\b[^>]*>/g)) {
    const min = Number(m[0].match(/\bmin="(\d+)"/)?.[1]);
    const max = Number(m[0].match(/\bmax="(\d+)"/)?.[1]);
    const w = Number(m[0].match(/\bwidth="([\d.]+)"/)?.[1]);
    if (min && max && w) for (let c = min; c <= max; c++) widths.set(c - 1, w);
  }
  let adjusted = 0;
  const out = xml.replace(/<row\b[^>]*>[\s\S]*?<\/row>/g, (rowXml) => {
    const open = rowXml.match(/^<row\b[^>]*>/)![0];
    let need = 0;
    for (const m of rowXml.matchAll(/<c\b[^>]*?>([\s\S]*?)<\/c>/g)) {
      const ref = m[0].match(/\br="([A-Z]+)\d+"/)?.[1];
      if (!ref) continue;
      const col = colIndex(ref);
      if (col !== 1 && col !== 2) continue;
      let text = "";
      if (/\bt="s"/.test(m[0])) text = strings[Number(m[1].match(/<v>(\d+)<\/v>/)?.[1])] ?? "";
      else if (/\bt="inlineStr"/.test(m[0])) text = decode([...m[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(""));
      if (!text) continue;
      const width = widths.get(col) ?? 8.43;
      // Negrito (coluna B) ocupa mais espaço; margem de 1 caractere para o recuo da célula.
      const chars = Math.max(Math.floor(width / (col === 1 ? 1.2 : 1.05)) - 1, 4);
      need = Math.max(need, wrappedLines(text, chars) * LINE_PT + PAD_PT);
    }
    const cur = Number(open.match(/\bht="([\d.]+)"/)?.[1] ?? 0);
    if (need <= cur || need === 0) return rowXml;
    const ht = Math.ceil(need * 4) / 4;
    let newOpen = /\bht="/.test(open) ? open.replace(/\bht="[\d.]+"/, `ht="${ht}"`) : open.replace(/^<row\b/, `<row ht="${ht}"`);
    if (!/\bcustomHeight="/.test(newOpen)) newOpen = newOpen.replace(/>$/, ' customHeight="1">');
    else newOpen = newOpen.replace(/\bcustomHeight="\d"/, 'customHeight="1"');
    adjusted++;
    return newOpen + rowXml.slice(open.length);
  });
  return { xml: out, adjusted };
}

/**
 * Preenche a planilha-base preservando tudo que não é indicador. TX rotação nunca é escrita.
 * Edita o XML do .xlsx diretamente (sem reescrever o arquivo por uma biblioteca de planilhas).
 */
export async function fillTemplate(
  templateBytes: ArrayBuffer,
  index: TemplateIndex,
  items: FillItem[],
  rowOffsets: Record<string, number>,
): Promise<{ bytes: ArrayBuffer; written: number; skipped: number; heightsAdjusted: number }> {
  const zip = await JSZip.loadAsync(templateBytes);
  const files = await sheetFiles(zip);

  const bySheet = new Map<string, Map<number, Map<number, number>>>();
  for (const item of items) {
    const cols = index.columns[item.entry.modality];
    if (!cols) continue;
    const excelRow = item.entry.rowIndex + (rowOffsets[item.entry.sheet] ?? 0) + 1;
    const sheet = bySheet.get(item.entry.sheet) ?? new Map<number, Map<number, number>>();
    const row = sheet.get(excelRow) ?? new Map<number, number>();
    for (const [field, colKey] of Object.entries(FIELD_TO_COLUMN)) {
      const value = item.values[field as keyof FillItem["values"]];
      const col = cols[colKey];
      if (value === null || value === undefined || !Number.isFinite(value) || col === undefined) continue;
      row.set(col, value);
    }
    sheet.set(excelRow, row);
    bySheet.set(item.entry.sheet, sheet);
  }

  let written = 0;
  let skipped = 0;
  for (const [sheetName, edits] of bySheet) {
    const path = files.get(sheetName);
    const file = path ? zip.file(path) : null;
    if (!path || !file) throw new Error(`Aba "${sheetName}" não encontrada no arquivo da planilha-base.`);
    const res = patchSheetXml(await file.async("string"), edits);
    zip.file(path, res.xml);
    written += res.written;
    skipped += res.skipped;
  }
  // Alturas: todas as abas, para nenhuma faculdade ficar com o texto cortado.
  const ssFile = zip.file("xl/sharedStrings.xml");
  const strings = ssFile ? parseSharedStrings(await ssFile.async("string")) : [];
  let heightsAdjusted = 0;
  for (const path of new Set(files.values())) {
    const file = zip.file(path);
    if (!file) continue;
    const res = fitRowHeights(await file.async("string"), strings);
    if (res.adjusted) zip.file(path, res.xml);
    heightsAdjusted += res.adjusted;
  }
  const bytes = await zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" });
  return { bytes, written, skipped, heightsAdjusted };
}
