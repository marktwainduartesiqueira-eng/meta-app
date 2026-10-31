"use client";

import { CartesianGrid, Line, LineChart, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";

export interface MiniPoint {
  edicao: string;
  ref: number | null;
}

export default function MiniChart({ data, aluno }: { data: MiniPoint[]; aluno: number | null }) {
  const vals = [...data.map((d) => d.ref), aluno].filter((v): v is number => !!v);
  if (vals.length === 0) return <p className="py-6 text-center text-xs text-muted">Sem notas nas edições carregadas.</p>;
  const min = Math.floor(Math.min(...vals) - 15);
  const max = Math.ceil(Math.max(...vals) + 15);
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 18, right: 24, left: 24, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="edicao" tick={{ fontSize: 11 }} />
          <YAxis domain={[min, max]} hide />
          {aluno !== null && (
            <ReferenceLine
              y={aluno}
              stroke="#0d8b94"
              strokeDasharray="5 4"
              label={{ value: `Aluno ${aluno.toLocaleString("pt-BR")}`, position: "insideBottomRight", fontSize: 10, fill: "#0d8b94" }}
            />
          )}
          <Line dataKey="ref" stroke="#1e40af" strokeWidth={2.5} dot={{ r: 4, fill: "#1e40af" }} connectNulls isAnimationActive={false}>
            <LabelList dataKey="ref" position="top" fontSize={11} fill="#0f172a" formatter={(v) => (typeof v === "number" ? v.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "")} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
