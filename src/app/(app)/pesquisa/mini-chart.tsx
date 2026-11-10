"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";

export interface MiniPoint {
  edicao: string;
  ref: number | null;
  /** Posição do último chamado na edição (pode existir sem nota). */
  pos: number | null;
}

const fmtNota = (v: unknown) => (typeof v === "number" ? v.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "");

/** Barras = nota por edição; abaixo de cada edição, a posição do último chamado; linha vermelha = nota do aluno. */
export default function MiniChart({ data, aluno }: { data: MiniPoint[]; aluno: number | null }) {
  const notas = data.map((d) => d.ref).filter((v): v is number => !!v);
  if (notas.length === 0 && !data.some((d) => d.pos)) {
    return <p className="py-6 text-center text-xs text-muted">Sem notas nas edições carregadas.</p>;
  }
  const vals = [...notas, aluno].filter((v): v is number => !!v);
  const min = vals.length ? Math.floor(Math.min(...vals) - 60) : 0;
  const max = vals.length ? Math.ceil(Math.max(...vals) + 20) : 1;
  const rows = data.map((d) => ({ ...d, nota: d.ref ?? undefined }));
  const byEd = new Map(data.map((d) => [d.edicao, d]));

  const Tick = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) => {
    const d = byEd.get(payload?.value ?? "");
    return (
      <g transform={`translate(${x},${y})`}>
        <text textAnchor="middle" dy={12} fontSize={11} fill="#334155">
          {payload?.value}
        </text>
        <text textAnchor="middle" dy={25} fontSize={10} fill={d?.pos ? "#1e40af" : "#94a3b8"}>
          {d?.pos ? `${d.pos}º` : "—"}
        </text>
      </g>
    );
  };

  return (
    <div>
      <div className="h-44 w-full">
        <ResponsiveContainer>
          <BarChart data={rows} margin={{ top: 18, right: 16, left: 16, bottom: 14 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="edicao" tick={<Tick />} tickLine={false} interval={0} height={36} />
            <YAxis domain={[min, max]} hide />
            <Bar dataKey="nota" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={38} isAnimationActive={false}>
              <LabelList dataKey="nota" position="top" fontSize={11} fill="#0f172a" formatter={fmtNota} />
            </Bar>
            {aluno !== null && (
              <ReferenceLine
                y={aluno}
                stroke="#dc2626"
                strokeWidth={2.5}
                label={{ value: `Aluno ${fmtNota(aluno)}`, position: "insideTopRight", fontSize: 10, fill: "#dc2626" }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-center text-[10px] text-muted">
        Barras: nota por edição · Abaixo da edição: posição do último chamado
      </p>
    </div>
  );
}
