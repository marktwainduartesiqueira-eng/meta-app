import { Document, Image, Line, Page, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import { referenceScore } from "../chance";
import type { SearchItem } from "../search";

const C = { blue: "#1e40af", night: "#000063", amber: "#f59e0b", muted: "#64748b", line: "#e2e8f0", teal: "#0d8b94" };
const CHANCE_COLOR: Record<string, string> = {
  Alta: "#047857",
  Média: "#b45309",
  Baixa: "#c2410c",
  Improvável: "#b91c1c",
  "Sem histórico": "#64748b",
};

const s = StyleSheet.create({
  page: { padding: 26, paddingBottom: 40, fontSize: 9, color: "#0f172a", fontFamily: "Helvetica" },
  header: { backgroundColor: C.night, color: "#fff", paddingVertical: 7, paddingHorizontal: 14, borderRadius: 6, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 14 },
  logo: { width: 80, height: 50 },
  title: { fontSize: 17, fontFamily: "Helvetica-Bold" },
  sub: { fontSize: 9, color: "#cbd5e1", marginTop: 3 },
  box: { flexDirection: "row", gap: 8, marginBottom: 8 },
  card: { flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 4, padding: 6 },
  label: { fontSize: 7, color: C.muted, textTransform: "uppercase" },
  value: { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.blue, marginTop: 2 },
  fac: { flexDirection: "row", borderWidth: 1, borderColor: C.line, borderRadius: 6, marginBottom: 5, overflow: "hidden" },
  facInfo: { width: 180, padding: 6, backgroundColor: "#f8fafc" },
  facName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.night },
  facChart: { flex: 1, padding: 4, alignItems: "center", justifyContent: "center" },
  note: { fontSize: 7.5, color: C.muted, marginTop: 6, lineHeight: 1.4 },
  mensagem: { marginTop: 4, paddingVertical: 6, paddingHorizontal: 12, borderLeftWidth: 3, borderLeftColor: C.amber, backgroundColor: "#fffbeb", borderRadius: 3 },
  mensagemTxt: { fontSize: 10, fontFamily: "Helvetica-Oblique", color: C.night, lineHeight: 1.4 },
  contact: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6, padding: 7, borderRadius: 6, backgroundColor: C.night, color: "#fff" },
  qr: { width: 52, height: 52, borderRadius: 4, backgroundColor: "#fff" },
  footer: { position: "absolute", bottom: 16, left: 26, right: 26, fontSize: 7, color: C.muted, flexDirection: "row", justifyContent: "space-between" },
});

const f = (n: number | null) => (n === null ? "—" : n.toLocaleString("pt-BR", { maximumFractionDigits: 2 }));

function ScoreChart({
  labels,
  values,
  positions,
  aluno,
}: {
  labels: string[];
  values: (number | null)[];
  positions: (number | null)[];
  aluno: number | null;
}) {
  const W = 290;
  const H = 88;
  const padX = 20;
  const top = 17;
  const bottom = 26;
  const nums = [...values, aluno].filter((v): v is number => !!v);
  if (nums.length === 0 && !positions.some((p) => p)) return <Text style={{ color: C.muted }}>Sem notas nas edições carregadas.</Text>;
  const lo = nums.length ? Math.min(...nums) - 60 : 0;
  const hi = nums.length ? Math.max(...nums) + 20 : 1;
  const slot = (W - 2 * padX) / labels.length;
  const barW = Math.min(34, slot * 0.6);
  const cx = (i: number) => padX + slot * i + slot / 2;
  const base = H - bottom;
  const y = (v: number) => top + ((hi - v) * (base - top)) / (hi - lo);
  // Edições sem nota, mas com posição: barra âmbar em escala própria (mostra até onde a lista andou).
  const posOnly = positions.map((p, i) => (p && !values[i] ? p : null));
  const posMax = Math.max(...posOnly.filter((p): p is number => !!p), 1) * 1.2;
  const yPos = (p: number) => base - (p * (base - top)) / posMax;

  return (
    <Svg width={W} height={H}>
      <Line x1={padX - 8} y1={base} x2={W - padX + 8} y2={base} stroke={C.line} strokeWidth={1} />
      {values.map((v, i) =>
        v ? <Rect key={`b${i}`} x={cx(i) - barW / 2} y={y(v)} width={barW} height={base - y(v)} fill={C.blue} /> : null,
      )}
      {posOnly.map((p, i) =>
        p ? <Rect key={`pb${i}`} x={cx(i) - barW / 2} y={yPos(p)} width={barW} height={base - yPos(p)} fill={C.amber} /> : null,
      )}
      {values.map((v, i) => {
        const p = posOnly[i];
        return (
          <Text key={`t${i}`} x={cx(i)} y={v ? y(v) - 3 : p ? yPos(p) - 3 : base - 4} style={{ fontSize: 8, fill: v ? "#0f172a" : p ? "#92400e" : "#94a3b8" }} textAnchor="middle">
            {v ? f(v) : p ? `${p}º` : "sem dados"}
          </Text>
        );
      })}
      {aluno !== null && (
        <>
          <Line x1={padX - 8} y1={y(aluno)} x2={W - padX + 8} y2={y(aluno)} stroke="#dc2626" strokeWidth={3} />
          <Rect x={padX - 8} y={y(aluno) - 12} width={52} height={10} fill="#dc2626" />
          <Text x={padX - 5} y={y(aluno) - 4} style={{ fontSize: 7.5, fill: "#ffffff" }}>
            {`Aluno ${f(aluno)}`}
          </Text>
        </>
      )}
      {labels.map((l, i) => (
        <Text key={l} x={cx(i)} y={base + 10} style={{ fontSize: 8, fill: C.muted }} textAnchor="middle">
          {l}
        </Text>
      ))}
      {positions.map((p, i) => (
        <Text key={`p${i}`} x={cx(i)} y={base + 20} style={{ fontSize: 7.5, fill: p ? C.blue : "#94a3b8" }} textAnchor="middle">
          {p ? `${p}º` : "—"}
        </Text>
      ))}
    </Svg>
  );
}

export interface RelatorioProps {
  aluno: string;
  nota: number | null;
  modalidade: string;
  filtros: string;
  editions: string[];
  items: SearchItem[];
  total: number;
  data: string;
  mensagem: string;
  logo: { data: Buffer; format: "jpg" | "png" };
  qr: { data: Buffer; format: "jpg" | "png" };
}

export function Relatorio(p: RelatorioProps) {
  return (
    <Document title={`Relatório FIES — ${p.aluno || "aluno(a)"}`} author="Metta Estudantil">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={p.logo} style={s.logo} />
          <View>
            <Text style={s.title}>Relatório de histórico de notas</Text>
            <Text style={s.sub}>
              {p.aluno ? `Aluno(a): ${p.aluno}` : "Relatório geral"} · gerado em {p.data}
            </Text>
          </View>
        </View>

        <View style={s.box}>
          <View style={s.card}>
            <Text style={s.label}>Nota ENEM do aluno(a)</Text>
            <Text style={s.value}>{f(p.nota)}</Text>
          </View>
          <View style={s.card}>
            <Text style={s.label}>Modalidade</Text>
            <Text style={s.value}>{p.modalidade}</Text>
          </View>
          <View style={s.card}>
            <Text style={s.label}>Opções apresentadas</Text>
            <Text style={s.value}>
              {p.items.length}
              {p.total > p.items.length ? ` de ${p.total}` : ""}
            </Text>
          </View>
        </View>
        {p.filtros ? <Text style={{ marginBottom: 8, color: C.muted }}>Filtros: {p.filtros}</Text> : null}

        {p.items.map((it) => (
          <View key={it.id} style={s.fac} wrap={false}>
            <View style={s.facInfo}>
              <Text style={s.facName}>{it.info.ies_nome}</Text>
              <Text style={{ color: C.muted, fontSize: 8, marginTop: 3 }}>
                {it.info.campus} · {it.info.uf}
              </Text>
              <Text style={{ color: C.muted, fontSize: 8 }}>Código IES {it.info.ies_codigo}</Text>
              {p.nota !== null && (
                <Text style={{ marginTop: 4, fontSize: 11, fontFamily: "Helvetica-Bold", color: CHANCE_COLOR[it.res.chance] }}>
                  Chance {it.res.chance}
                </Text>
              )}
            </View>
            <View style={s.facChart}>
              <ScoreChart
                labels={p.editions}
                values={p.editions.map((e) => (it.byEd.get(e) ? referenceScore(it.byEd.get(e)!) : null))}
                positions={p.editions.map((e) => it.byEd.get(e)?.pos_ultimo_chamado ?? null)}
                aluno={p.nota}
              />
            </View>
          </View>
        ))}

        <Text style={s.note}>
          Barras = nota ENEM do último aprovado (ou nota de corte, quando indisponível); barras âmbar = edição sem nota, com altura pela posição do último chamado (mostra até onde a lista andou); abaixo de cada edição, a posição. A linha vermelha é a nota do aluno. A chance é uma estimativa
          baseada apenas no histórico das edições carregadas e não garante aprovação.
        </Text>

        <View style={s.mensagem} wrap={false}>
          <Text style={s.mensagemTxt}>{p.mensagem}</Text>
        </View>

        <View style={s.contact} wrap={false}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={p.qr} style={s.qr} />
          <View>
            <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold" }}>Fale com a Metta Estudantil</Text>
            <Text style={{ marginTop: 4, color: "#e2e8f0" }}>Instagram: @mettaestudantil</Text>
            <Text style={{ color: "#e2e8f0" }}>E-mail: contato@mettaestudantil.com</Text>
            <Text style={{ marginTop: 4, fontSize: 7.5, color: C.amber }}>Aponte a câmera para o QR Code e siga a gente.</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>Metta Estudantil · Assessoria FIES</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

