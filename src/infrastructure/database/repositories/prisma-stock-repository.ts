import type { StockMovement } from "../../../domain/entities/stock-movement";
import type {
  Stock,
  StockListItem
} from "../../../domain/entities/stock";
import { StockMovementType } from "../../../domain/enums/stock-movement-type";
import type {
  ApplyStockMovementData,
  ApplyStockMovementResult,
  ListStockResult,
  StockRepository
} from "../../../domain/repositories/stock-repository";
import { TipoMovimentacaoEstoque as PrismaMovementType } from "../../../generated/prisma/client";
import { prisma } from "../prisma";

type PrismaStockData = {
  id: string;
  unidadeId: string;
  produtoId: string;
  quantidadeDisponivel: number;
  quantidadeReservada: number;
  criadoEm: Date;
  atualizadoEm: Date;
};

type PrismaMovementData = {
  id: string;
  estoqueId: string;
  pedidoId: string | null;
  usuarioId: string | null;
  tipo: string;
  quantidade: number;
  saldoAnterior: number;
  saldoPosterior: number;
  motivo: string | null;
  criadoEm: Date;
};

function mapStock(estoque: PrismaStockData): Stock {
  return {
    id: estoque.id,
    unidadeId: estoque.unidadeId,
    produtoId: estoque.produtoId,
    quantidadeDisponivel: estoque.quantidadeDisponivel,
    quantidadeReservada: estoque.quantidadeReservada,
    criadoEm: estoque.criadoEm,
    atualizadoEm: estoque.atualizadoEm
  };
}

function mapMovement(
  movement: PrismaMovementData
): StockMovement {
  return {
    id: movement.id,
    estoqueId: movement.estoqueId,
    pedidoId: movement.pedidoId,
    usuarioId: movement.usuarioId,
    tipo: movement.tipo as StockMovementType,
    quantidade: movement.quantidade,
    saldoAnterior: movement.saldoAnterior,
    saldoPosterior: movement.saldoPosterior,
    motivo: movement.motivo,
    criadoEm: movement.criadoEm
  };
}

class PrismaStockRepository implements StockRepository {
  async listByUnit(
    unidadeId: string,
    page: number,
    limit: number
  ): Promise<ListStockResult> {
    const [estoques, total] = await prisma.$transaction([
      prisma.estoque.findMany({
        where: {
          unidadeId
        },
        include: {
          produto: true
        },
        orderBy: {
          produto: {
            nome: "asc"
          }
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.estoque.count({
        where: {
          unidadeId
        }
      })
    ]);

    const items: StockListItem[] = estoques.map(
      (estoque) => ({
        ...mapStock(estoque),
        produtoNome: estoque.produto.nome
      })
    );

    return {
      items,
      total
    };
  }

  async applyMovement(
    data: ApplyStockMovementData
  ): Promise<ApplyStockMovementResult> {
    return prisma.$transaction(async (transaction) => {
      let estoque = await transaction.estoque.findUnique({
        where: {
          unidadeId_produtoId: {
            unidadeId: data.unidadeId,
            produtoId: data.produtoId
          }
        }
      });

      if (
        !estoque &&
        data.tipo === StockMovementType.SAIDA
      ) {
        return {
          success: false as const,
          reason: "STOCK_NOT_FOUND" as const
        };
      }

      if (!estoque) {
        estoque = await transaction.estoque.create({
          data: {
            unidadeId: data.unidadeId,
            produtoId: data.produtoId,
            quantidadeDisponivel: 0,
            quantidadeReservada: 0
          }
        });
      }

      const saldoAnterior = estoque.quantidadeDisponivel;

      if (
        data.tipo === StockMovementType.SAIDA &&
        saldoAnterior < data.quantidade
      ) {
        return {
          success: false as const,
          reason: "INSUFFICIENT_STOCK" as const
        };
      }

      const saldoPosterior =
        data.tipo === StockMovementType.ENTRADA
          ? saldoAnterior + data.quantidade
          : saldoAnterior - data.quantidade;

      const estoqueAtualizado =
        await transaction.estoque.update({
          where: {
            id: estoque.id
          },
          data: {
            quantidadeDisponivel: saldoPosterior
          }
        });

      const movimentacao =
        await transaction.movimentacaoEstoque.create({
          data: {
            estoqueId: estoque.id,
            usuarioId: data.usuarioId,
            tipo: data.tipo as PrismaMovementType,
            quantidade: data.quantidade,
            saldoAnterior,
            saldoPosterior,
            motivo: data.motivo
          }
        });

      return {
        success: true as const,
        stock: mapStock(estoqueAtualizado),
        movement: mapMovement(movimentacao)
      };
    });
  }
}

export { PrismaStockRepository };