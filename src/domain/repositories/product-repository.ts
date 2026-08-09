import type { Product } from "../entities/product";

type CreateProductData = {
  nome: string;
  descricao?: string | null;
  categoria: string;
};

interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  create(data: CreateProductData): Promise<Product>;
}

export type { CreateProductData, ProductRepository };