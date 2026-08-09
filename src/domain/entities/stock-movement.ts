import { StockMovementType } from "../enums/stock-movement-type";

type StockMovement = {
  id: string;
  estoqueId: string;
  pedidoId: string | null;
  usuarioId: string | null;
  tipo: StockMovementType;
  quantidade: number;
  saldoAnterior: number;
  saldoPosterior: number;
  motivo: string | null;
  criadoEm: Date;
};

export type { StockMovement };