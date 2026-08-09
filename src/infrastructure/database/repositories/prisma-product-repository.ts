import type { Product } from "../../../domain/entities/product";
import type {
  CreateProductData,
  ProductRepository
} from "../../../domain/repositories/product-repository";
import { prisma } from "../prisma";

function mapProduct(produto: Product): Product {
  return {
    id: produto.id,
    nome: produto.nome,
    descricao: produto.descricao,
    categoria: produto.categoria,
    ativo: produto.ativo,
    criadoEm: produto.criadoEm,
    atualizadoEm: produto.atualizadoEm
  };
}

class PrismaProductRepository
  implements ProductRepository
{
  async findById(id: string): Promise<Product | null> {
    const produto = await prisma.produto.findUnique({
      where: {
        id
      }
    });

    return produto ? mapProduct(produto) : null;
  }

  async create(
    data: CreateProductData
  ): Promise<Product> {
    const produto = await prisma.produto.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        categoria: data.categoria
      }
    });

    return mapProduct(produto);
  }
}

export { PrismaProductRepository };