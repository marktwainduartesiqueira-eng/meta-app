"use client";

import { Bar, CartesianGrid, ComposedChart, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";

export interface MiniPoint {
  edicao: string;
  ref: number | null;
  /** Posição do último chamado na edição (pode existir sem nota). */
  pos: number | null;
}

const fmtNota = (v: unknown) => (typeof v === "number" ? v.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "");
const RED = "#dc2626";

/**
 * Barras azuis = nota da edição. Edições sem nota, mas com posição do último chamado, ganham barra âmbar
 * (altura = posição, em escala própria): mostra até onde a lista andou. Linha vermelha = nota do aluno.
 */
export default function MiniChart({ data, aluno }: { data: MiniPoint[]; aluno: number | null }) {
  const notas = data.map((d) => d.ref).filter((v): v is number => !!v);
  const posOnly = data.filter((d) => !d.ref && d.pos);
  if (notas.length === 0 && posOnly.length === 0) {
    return <p className="py-6 text-center text-xs text-muted">Sem notas nas edições carregadas.</p>;
  }
  const vals = [...notas, aluno].filter((v): v is number => !!v);
  const min = vals.length ? Math.floor(Math.min(...vals) - 60) : 0;
  const max = vals.length ? Math.ceil(Math.max(...vals) + 20) : 1;
  const posMax = Math.ceil(Math.max(...posOnly.map((d) => d.pos!), 1) * 1.2);
  const rows = data.map((d) => ({
    ...d,
    nota: d.ref ?? undefined,
    posBar: !d.ref && d.pos ? d.pos : undefined,
  }));
  const byEd = new Map(data.map((d) => [d.edicao, d]));

  const Tick = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) => {
    const d = byEd.get(payload?.value ?? "");
    return (
      <g transform={`translate(${x},${y})`}>
        <text textAnchor="middle" dy={12} fontSize={11} fill="#334155">
          {payload?.value}
        </text>
        <text textAnchor="middle" dy={25} fontSize={10} fontWeight={600} fill={d?.pos ? "#1e40af" : "#94a3b8"}>
          {d?.pos ? `${d.pos}º` : "—"}
        </text>
      </g>
    );
  };

  const AlunoLabel = ({ viewBox }: { viewBox?: { x: number; y: number; width: number } }) => {
    if (!viewBox || aluno === null) return null;
    const w = 86;
    const x = viewBox.x + viewBox.width - w;
    return (
      <g>
        <rect x={x} y={viewBox.y - 17} width={w} height={15} rx={3} fill={RED} />
        <text x={x + w / 2} y={viewBox.y - 6} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">
          Aluno {fmtNota(aluno)}
        </text>
      </g>
    );
  };

  return (
    <div>
      <div className="h-48 w-full">
        <ResponsiveContainer>
          <ComposedChart data={rows} margin={{ top: 22, right: 8, left: 8, bottom: 14 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="edicao" tick={<Tick />} tickLine={false} interval={0} height={36} />
            <YAxis yAxisId="nota" domain={[min, max]} hide />
            <YAxis yAxisId="pos" domain={[0, posMax]} hide />
            <Bar yAxisId="nota" dataKey="nota" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={38} isAnimationActive={false}>
              <LabelList dataKey="nota" position="top" fontSize={11} fill="#0f172a" formatter={fmtNota} />
            </Bar>
            <Bar yAxisId="pos" dataKey="posBar" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={38} isAnimationActive={false}>
              <LabelList dataKey="posBar" position="top" fontSize={11} fill="#92400e" formatter={(v) => (typeof v === "number" ? `${v}º` : "")} />
            </Bar>
            {aluno !== null && (
              <ReferenceLine yAxisId="nota" y={aluno} stroke={RED} strokeWidth={3.5} label={<AlunoLabel />} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-center text-[10px] text-muted">
        Azul: nota · Âmbar: posição do último chamado (edição sem nota) · Abaixo da edição: posição
      </p>
    </div>
  );
}
