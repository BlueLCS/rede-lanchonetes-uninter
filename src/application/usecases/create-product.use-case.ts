import type { ProductRepository } from "../../domain/repositories/product-repository";

type CreateProductInput = {
  nome: string;
  descricao?: string | null;
  categoria: string;
};

class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository
  ) {}

  async execute(input: CreateProductInput) {
    return this.productRepository.create({
      nome: input.nome.trim(),
      descricao: input.descricao?.trim() || null,
      categoria: input.categoria.trim().toUpperCase()
    });
  }
}

export { CreateProductUseCase };