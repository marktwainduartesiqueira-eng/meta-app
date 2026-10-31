import { collectGroup, type ParsedSheet } from "./sheet";
import type { SheetCollection } from "./types";

/** Agrupa abas do mesmo curso e modalidade (consolida "Tabela 1" + "Tabela 2") e coleta os indicadores. */
export function buildCollections(parsed: ParsedSheet[]): { key: string; collection: SheetCollection }[] {
  const groups = new Map<string, ParsedSheet[]>();
  for (const p of parsed) {
    const key = `${p.meta.iesCodigo}|${p.meta.cursoCodigo}|${p.modality ?? "?"}`;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return [...groups].map(([key, parts]) => ({ key, collection: collectGroup(parts) }));
}
