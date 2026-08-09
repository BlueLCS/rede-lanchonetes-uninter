import type { MenuItem } from "../../../domain/entities/menu-item";
import type {
  ListMenuResult,
  MenuRepository,
  SetMenuItemData
} from "../../../domain/repositories/menu-repository";
import { prisma } from "../prisma";

type PrismaMenuData = {
  id: string;
  unidadeId: string;
  produtoId: string;
  preco: {
    toString(): string;
  };
  disponivel: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
  produto: {
    nome: string;
    descricao: string | null;
    categoria: string;
  };
};

function mapMenuItem(item: PrismaMenuData): MenuItem {
  return {
    id: item.id,
    unidadeId: item.unidadeId,
    produtoId: item.produtoId,
    nome: item.produto.nome,
    descricao: item.produto.descricao,
    categoria: item.produto.categoria,
    preco: Number(item.preco.toString()),
    disponivel: item.disponivel,
    criadoEm: item.criadoEm,
    atualizadoEm: item.atualizadoEm
  };
}

class PrismaMenuRepository implements MenuRepository {
  async findByUnitAndProduct(
    unidadeId: string,
    produtoId: string
  ): Promise<MenuItem | null> {
    const item = await prisma.produtoUnidade.findUnique({
      where: {
        unidadeId_produtoId: {
          unidadeId,
          produtoId
        }
      },
      include: {
        produto: true
      }
    });

    return item ? mapMenuItem(item) : null;
  }

  async listAvailableByUnit(
    unidadeId: string,
    page: number,
    limit: number
  ): Promise<ListMenuResult> {
    const where = {
      unidadeId,
      disponivel: true,
      produto: {
        ativo: true
      }
    };

    const [items, total] = await prisma.$transaction([
      prisma.produtoUnidade.findMany({
        where,
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
      prisma.produtoUnidade.count({
        where
      })
    ]);

    return {
      items: items.map(mapMenuItem),
      total
    };
  }

  async upsert(
    data: SetMenuItemData
  ): Promise<MenuItem> {
    const item = await prisma.produtoUnidade.upsert({
      where: {
        unidadeId_produtoId: {
          unidadeId: data.unidadeId,
          produtoId: data.produtoId
        }
      },
      update: {
        preco: data.preco,
        disponivel: data.disponivel
      },
      create: {
        unidadeId: data.unidadeId,
        produtoId: data.produtoId,
        preco: data.preco,
        disponivel: data.disponivel
      },
      include: {
        produto: true
      }
    });

    return mapMenuItem(item);
  }
}

export { PrismaMenuRepository };