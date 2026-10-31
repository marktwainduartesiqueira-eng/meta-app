/** Frases curtas de acolhimento para o relatório do aluno (processo que gera ansiedade). */
export const MENSAGENS_MOTIVACIONAIS = [
  "Respire fundo: você já chegou até aqui, e isso diz muito sobre a sua dedicação.",
  "Sua nota é só um número. Seu esforço e seu sonho são muito maiores que ele.",
  "Ansiedade é sinal de que isso importa para você. Confie no seu preparo e siga em frente.",
  "Um passo de cada vez: a sua vaga está sendo construída a cada escolha bem planejada.",
  "Estamos com você em cada etapa dessa jornada. Você não está só.",
  "Quem se prepara com tanto cuidado merece colher bons resultados. Acredite no seu caminho.",
  "Calma, o processo é longo, mas você não precisa percorrê-lo com medo. Vamos juntos.",
];

/** Escolha estável: o mesmo aluno e nota recebem sempre a mesma frase. */
export function mensagemMotivacional(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return MENSAGENS_MOTIVACIONAIS[h % MENSAGENS_MOTIVACIONAIS.length];
}
