"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface ChartPoint {
  edicao: string;
  corte: number | null;
  ultimo: number | null;
  aluno: number | null;
}

export default function HistoryChart({ data }: { data: ChartPoint[] }) {
  const vals = data.flatMap((d) => [d.corte, d.ultimo, d.aluno]).filter((v): v is number => !!v);
  const min = vals.length ? Math.floor(Math.min(...vals) - 20) : 0;
  const max = vals.length ? Math.ceil(Math.max(...vals) + 20) : 1000;
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="edicao" tick={{ fontSize: 12 }} />
          <YAxis domain={[min, max]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line name="Nota do último aprovado" dataKey="ultimo" stroke="#1e40af" strokeWidth={2} connectNulls />
          <Line name="Nota de corte" dataKey="corte" stroke="#f59e0b" strokeWidth={2} connectNulls />
          <Line name="Nota do aluno" dataKey="aluno" stroke="#0d8b94" strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
