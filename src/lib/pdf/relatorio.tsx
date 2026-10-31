import { Circle, Document, Image, Line, Page, Polyline, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
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
  fac: { flexDirection: "row", borderWidth: 1, borderColor: C.line, borderRadius: 6, marginBottom: 7, overflow: "hidden" },
  facInfo: { width: 180, padding: 8, backgroundColor: "#f8fafc" },
  facName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.night },
  facChart: { flex: 1, padding: 4, alignItems: "center", justifyContent: "center" },
  note: { fontSize: 7.5, color: C.muted, marginTop: 6, lineHeight: 1.4 },
  mensagem: { marginTop: 6, paddingVertical: 8, paddingHorizontal: 12, borderLeftWidth: 3, borderLeftColor: C.amber, backgroundColor: "#fffbeb", borderRadius: 3 },
  mensagemTxt: { fontSize: 10, fontFamily: "Helvetica-Oblique", color: C.night, lineHeight: 1.4 },
  contact: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8, padding: 8, borderRadius: 6, backgroundColor: C.night, color: "#fff" },
  qr: { width: 62, height: 62, borderRadius: 4, backgroundColor: "#fff" },
  footer: { position: "absolute", bottom: 16, left: 26, right: 26, fontSize: 7, color: C.muted, flexDirection: "row", justifyContent: "space-between" },
});

const f = (n: number | null) => (n === null ? "—" : n.toLocaleString("pt-BR", { maximumFractionDigits: 2 }));

function ScoreChart({ labels, values, aluno }: { labels: string[]; values: (number | null)[]; aluno: number | null }) {
  const W = 290;
  const H = 104;
  const padX = 34;
  const top = 22;
  const bottom = 20;
  const nums = [...values, aluno].filter((v): v is number => !!v);
  if (nums.length === 0) return <Text style={{ color: C.muted }}>Sem notas nas edições carregadas.</Text>;
  const lo = Math.min(...nums) - 15;
  const hi = Math.max(...nums) + 15;
  const x = (i: number) => (labels.length === 1 ? W / 2 : padX + (i * (W - 2 * padX)) / (labels.length - 1));
  const y = (v: number) => top + ((hi - v) * (H - top - bottom)) / (hi - lo);
  const pts = values.map((v, i) => (v ? { x: x(i), y: y(v), v } : null));
  const line = pts.filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <Svg width={W} height={H}>
      <Line x1={padX - 10} y1={H - bottom} x2={W - padX + 10} y2={H - bottom} stroke={C.line} strokeWidth={1} />
      {aluno !== null && (
        <>
          <Line x1={0} y1={7} x2={16} y2={7} stroke={C.teal} strokeWidth={1.2} strokeDasharray="4 3" />
          <Text x={20} y={10} style={{ fontSize: 7.5, fill: C.teal }}>
            {`Nota do aluno: ${f(aluno)}`}
          </Text>
          <Line x1={padX - 10} y1={y(aluno)} x2={W - padX + 10} y2={y(aluno)} stroke={C.teal} strokeWidth={1} strokeDasharray="4 3" />
        </>
      )}
      {line.length > 1 && <Polyline points={line.map((p) => `${p.x},${p.y}`).join(" ")} stroke={C.blue} strokeWidth={2} fill="none" />}
      {line.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={C.blue} />
      ))}
      {line.map((p, i) => {
        // Se a linha da nota do aluno passa logo acima do ponto, o valor vai para baixo dele.
        const nearAbove = aluno !== null && y(aluno) <= p.y && p.y - y(aluno) < 14;
        return (
          <Text key={`t${i}`} x={p.x} y={nearAbove ? p.y + 14 : p.y - 8} style={{ fontSize: 8, fill: "#0f172a" }} textAnchor="middle">
            {f(p.v)}
          </Text>
        );
      })}
      {labels.map((l, i) => (
        <Text key={l} x={x(i)} y={H - 6} style={{ fontSize: 8, fill: C.muted }} textAnchor="middle">
          {l}
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
                <Text style={{ marginTop: 8, fontSize: 11, fontFamily: "Helvetica-Bold", color: CHANCE_COLOR[it.res.chance] }}>
                  Chance {it.res.chance}
                </Text>
              )}
            </View>
            <View style={s.facChart}>
              <ScoreChart
                labels={p.editions}
                values={p.editions.map((e) => (it.byEd.get(e) ? referenceScore(it.byEd.get(e)!) : null))}
                aluno={p.nota}
              />
            </View>
          </View>
        ))}

        <Text style={s.note}>
          Notas por edição = nota ENEM do último aprovado (ou nota de corte, quando indisponível). A chance é uma estimativa
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

