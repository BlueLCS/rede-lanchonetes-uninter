import type { StockMovement } from "../entities/stock-movement";
import type {
  Stock,
  StockListItem
} from "../entities/stock";
import { StockMovementType } from "../enums/stock-movement-type";

type ApplyStockMovementData = {
  unidadeId: string;
  produtoId: string;
  usuarioId: string;
  tipo: StockMovementType.ENTRADA | StockMovementType.SAIDA;
  quantidade: number;
  motivo: string;
};

type ApplyStockMovementResult =
  | {
      success: true;
      stock: Stock;
      movement: StockMovement;
    }
  | {
      success: false;
      reason: "STOCK_NOT_FOUND" | "INSUFFICIENT_STOCK";
    };

type ListStockResult = {
  items: StockListItem[];
  total: number;
};

interface StockRepository {
  listByUnit(
    unidadeId: string,
    page: number,
    limit: number
  ): Promise<ListStockResult>;

  applyMovement(
    data: ApplyStockMovementData
  ): Promise<ApplyStockMovementResult>;
}

export type {
  ApplyStockMovementData,
  ApplyStockMovementResult,
  ListStockResult,
  StockRepository
};