type Product = {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type { Product };