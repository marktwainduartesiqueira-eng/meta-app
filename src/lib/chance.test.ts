import { describe, expect, it } from "vitest";
import { estimateChance } from "./chance";

const h = [
  { edicao: "2025.1", ref: 700 },
  { edicao: "2025.2", ref: 740 },
  { edicao: "2026.1", ref: 760 },
];

describe("estimateChance", () => {
  it("classifica pela posição da nota entre as referências", () => {
    expect(estimateChance(770, h).chance).toBe("Alta");
    expect(estimateChance(745, h).chance).toBe("Média");
    expect(estimateChance(710, h).chance).toBe("Baixa");
    expect(estimateChance(650, h).chance).toBe("Improvável");
  });
  it("sem referências ou sem nota não classifica", () => {
    expect(estimateChance(700, [{ edicao: "2026.1", ref: null }]).chance).toBe("Sem histórico");
    expect(estimateChance(null, h).chance).toBe("Sem histórico");
  });
});
