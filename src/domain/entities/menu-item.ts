type MenuItem = {
  id: string;
  unidadeId: string;
  produtoId: string;
  nome: string;
  descricao: string | null;
  categoria: string;
  preco: number;
  disponivel: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type { MenuItem };