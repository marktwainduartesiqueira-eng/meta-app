import ColetaForm from "./coleta-form";

// Admin e Consultor fazem coleta; só o Admin importa histórico. A coleta não grava no banco.
export default function ColetaPage() {
  return (
    // Ocupa a largura inteira da janela para a tabela de revisão caber sem rolagem lateral.
    <div className="relative left-1/2 w-screen -translate-x-1/2 px-6">
      <h1 className="mb-1 font-display text-2xl font-extrabold text-brand-dark sm:text-3xl">Coleta de dados</h1>
      <p className="mb-6 text-sm text-muted">
        Envie a planilha-base (Tabela Modelo) e as planilhas brutas do MEC. O sistema aplica as regras de coleta,
        mostra a revisão e preenche a Tabela Modelo. Tudo é processado no seu navegador; nada é enviado antes de você
        baixar o resultado.
      </p>
      <ColetaForm />
    </div>
  );
}
