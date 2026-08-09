type Stock = {
  id: string;
  unidadeId: string;
  produtoId: string;
  quantidadeDisponivel: number;
  quantidadeReservada: number;
  criadoEm: Date;
  atualizadoEm: Date;
};

type StockListItem = Stock & {
  produtoNome: string;
};

export type { Stock, StockListItem };