import type { CSSProperties } from "react";

/**
 * Arco graduado do Hero: escala de marcas (bisel de instrumento) atrás do cartão de edições.
 * Cada edição do banco é um trecho do arco (6 marcas); a última edição fica âmbar, como dado.
 * Só SVG + CSS (sem JS): a escala se traça e os trechos acendem em sequência, uma vez (~2s).
 * Sem animação (movimento reduzido), a escala aparece pronta e acesa.
 */
const MARCAS_POR_EDICAO = 6;
const CX = 200;
const CY = 205;
const RX = 190;
const RY = 150;

export default function ArcoGraduado({ edicoes }: { edicoes: number }) {
  const trechos = Math.max(1, edicoes);
  const total = trechos * MARCAS_POR_EDICAO;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 400 260"
      className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[112%] -translate-x-1/2 -translate-y-[79%] overflow-visible sm:w-[124%]"
    >
      {Array.from({ length: total + 1 }, (_, i) => {
        const theta = Math.PI + (i / total) * Math.PI;
        const principal = i % MARCAS_POR_EDICAO === 0;
        const k = principal ? 0.82 : 0.9;
        const x2 = CX + RX * Math.cos(theta);
        const y2 = CY + RY * Math.sin(theta);
        const x1 = CX + (x2 - CX) * k;
        const y1 = CY + (y2 - CY) * k;
        const trecho = Math.min(Math.floor(i / MARCAS_POR_EDICAO), trechos - 1);
        const maisRecente = edicoes > 0 && trecho === trechos - 1;
        const cor = maisRecente ? "#f59e0b" : principal ? "#ffffff" : "rgb(255 255 255 / 0.7)";
        return (
          <line
            key={i}
            className="arc-tick"
            pathLength={1}
            x1={x1.toFixed(2)}
            y1={y1.toFixed(2)}
            x2={x2.toFixed(2)}
            y2={y2.toFixed(2)}
            stroke="var(--c)"
            strokeWidth={principal ? 2.4 : 1.5}
            strokeLinecap="round"
            style={{ "--i": i, "--seg": trecho, "--c": cor } as CSSProperties}
          />
        );
      })}
    </svg>
  );
}
