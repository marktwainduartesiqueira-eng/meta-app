import type { Candidate, CollectResult } from "./types";

const EMPTY: CollectResult = {
  inscritos: 0,
  preSelecionados: 0,
  postergados: 0,
  desistentes: 0,
  reprovados: 0,
  posicaoUltimoChamado: null,
  notaUltimoAprovado: null,
  txRotacao: null,
  corteClassificacao: null,
  ultimoChamadoNome: null,
  ultimoChamadoSituacao: null,
  revisar: [],
};

/**
 * Aplica as regras de coleta a uma lista de candidatos reais, na ordem oficial.
 * Função pura: não lê planilha nem consulta banco.
 */
export function collectIndicators(all: Candidate[]): CollectResult {
  const result: CollectResult = { ...EMPTY, revisar: [] };

  // Nº inscritos: lista inteira, qualquer situação (inclui "outro curso").
  result.inscritos = all.length;
  if (all.length === 0) {
    result.revisar.push("LISTA SEM CANDIDATOS");
    return result;
  }

  // "Outro curso" só conta em inscritos; some de todas as demais etapas.
  const list = all.filter((c) => c.status !== "OUTRO_CURSO");

  // 1º passo: último PRE-SELECIONADO da lista inteira.
  let lastPre = -1;
  list.forEach((c, i) => {
    if (c.status === "PRE_SELECIONADO") lastPre = i;
  });

  // 2º passo: depois dele, primeira sequência de 3 LISTA DE ESPERA consecutivas.
  let cut = -1;
  for (let i = lastPre + 1; i + 2 < list.length; i++) {
    if (
      list[i].status === "LISTA_ESPERA" &&
      list[i + 1].status === "LISTA_ESPERA" &&
      list[i + 2].status === "LISTA_ESPERA"
    ) {
      cut = i;
      break;
    }
  }

  if (cut === -1) {
    result.revisar.push("SEQUÊNCIA DE CORTE NÃO ENCONTRADA");
    return result;
  }
  result.corteClassificacao = list[cut].rank;

  // Faixa de análise: do 1º candidato até o imediatamente anterior ao corte.
  for (const c of list.slice(0, cut)) {
    if (c.status === "PRE_SELECIONADO") result.preSelecionados++;
    else if (c.status === "POSTERGADA") result.postergados++;
    else if (c.status === "DESISTIU") result.desistentes++;
    else if (c.status === "PERDEU_VAGA" || c.status === "REJEITADA_CPSA") result.reprovados++;
  }

  // Último chamado: subir a partir do corte ignorando LISTA DE ESPERA (e "outro curso", já removido).
  let last: Candidate | null = null;
  for (let i = cut - 1; i >= 0; i--) {
    if (list[i].status !== "LISTA_ESPERA") {
      last = list[i];
      break;
    }
  }

  if (!last) {
    result.revisar.push("ÚLTIMO CHAMADO NÃO IDENTIFICADO");
    return result;
  }

  result.posicaoUltimoChamado = last.rank;
  result.notaUltimoAprovado = last.score;
  result.ultimoChamadoNome = last.name;
  result.ultimoChamadoSituacao = last.statusRaw;
  if (last.score === null) result.revisar.push("NOTA ENEM AUSENTE OU ILEGÍVEL");
  // Situações fora da lista (ex.: Participação cancelada, Não formou turma, Vencido)
  // são válidas como último chamado, por decisão do usuário.
  return result;
}
