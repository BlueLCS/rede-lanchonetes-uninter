import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PerfilUsuario,
  PrismaClient,
  TipoMovimentacaoEstoque,
  TipoUnidade
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("A variável DATABASE_URL não foi configurada.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const unidade = await prisma.unidade.upsert({
    where: {
      id: "00000000-0000-4000-8000-000000000001"
    },
    update: {
      nome: "Lanchonete Centro",
      ativo: true
    },
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      nome: "Lanchonete Centro",
      tipo: TipoUnidade.MATRIZ,
      logradouro: "Rua Central",
      numero: "100",
      bairro: "Centro",
      cidade: "Curitiba",
      uf: "PR",
      cep: "80000-000",
      ativo: true
    }
  });

  const senhaHash = await bcrypt.hash("Senha123!", 10);

  const administrador = await prisma.usuario.upsert({
    where: {
      email: "admin@lanchonete.local"
    },
    update: {
      senhaHash,
      ativo: true
    },
    create: {
      id: "00000000-0000-4000-8000-000000000011",
      unidadeId: unidade.id,
      nome: "Administrador",
      email: "admin@lanchonete.local",
      senhaHash,
      perfil: PerfilUsuario.ADMIN
    }
  });

  const cliente = await prisma.usuario.upsert({
    where: {
      email: "cliente@exemplo.com"
    },
    update: {
      senhaHash,
      ativo: true
    },
    create: {
      id: "00000000-0000-4000-8000-000000000012",
      nome: "Cliente Teste",
      email: "cliente@exemplo.com",
      senhaHash,
      perfil: PerfilUsuario.CLIENTE
    }
  });

  const produtos = [
    {
      id: "00000000-0000-4000-8000-000000000101",
      movimentoId: "00000000-0000-4000-8000-000000000201",
      nome: "X-Burger",
      descricao: "Pão, carne, queijo e molho",
      categoria: "LANCHE",
      preco: "18.90",
      quantidade: 50
    },
    {
      id: "00000000-0000-4000-8000-000000000102",
      movimentoId: "00000000-0000-4000-8000-000000000202",
      nome: "Batata Frita",
      descricao: "Porção individual de batata frita",
      categoria: "ACOMPANHAMENTO",
      preco: "10.00",
      quantidade: 40
    },
    {
      id: "00000000-0000-4000-8000-000000000103",
      movimentoId: "00000000-0000-4000-8000-000000000203",
      nome: "Refrigerante",
      descricao: "Refrigerante em lata",
      categoria: "BEBIDA",
      preco: "6.00",
      quantidade: 60
    }
  ];

  for (const item of produtos) {
    const produto = await prisma.produto.upsert({
      where: {
        id: item.id
      },
      update: {
        nome: item.nome,
        descricao: item.descricao,
        categoria: item.categoria,
        ativo: true
      },
      create: {
        id: item.id,
        nome: item.nome,
        descricao: item.descricao,
        categoria: item.categoria,
        ativo: true
      }
    });

    await prisma.produtoUnidade.upsert({
      where: {
        unidadeId_produtoId: {
          unidadeId: unidade.id,
          produtoId: produto.id
        }
      },
      update: {
        preco: item.preco,
        disponivel: true
      },
      create: {
        unidadeId: unidade.id,
        produtoId: produto.id,
        preco: item.preco,
        disponivel: true
      }
    });

    const estoque = await prisma.estoque.upsert({
      where: {
        unidadeId_produtoId: {
          unidadeId: unidade.id,
          produtoId: produto.id
        }
      },
      update: {},
      create: {
        unidadeId: unidade.id,
        produtoId: produto.id,
        quantidadeDisponivel: item.quantidade,
        quantidadeReservada: 0
      }
    });

    await prisma.movimentacaoEstoque.upsert({
      where: {
        id: item.movimentoId
      },
      update: {},
      create: {
        id: item.movimentoId,
        estoqueId: estoque.id,
        usuarioId: administrador.id,
        tipo: TipoMovimentacaoEstoque.ENTRADA,
        quantidade: item.quantidade,
        saldoAnterior: 0,
        saldoPosterior: item.quantidade,
        motivo: "Estoque inicial do sistema"
      }
    });
  }

  const consentimentoExistente =
    await prisma.consentimentoLgpd.findFirst({
      where: {
        usuarioId: cliente.id,
        finalidade: "PROGRAMA_FIDELIDADE",
        versaoTermo: "1.0"
      }
    });

  if (!consentimentoExistente) {
    await prisma.consentimentoLgpd.create({
      data: {
        usuarioId: cliente.id,
        finalidade: "PROGRAMA_FIDELIDADE",
        aceito: true,
        versaoTermo: "1.0"
      }
    });
  }

  await prisma.contaFidelidade.upsert({
    where: {
      usuarioId: cliente.id
    },
    update: {},
    create: {
      usuarioId: cliente.id,
      saldoPontos: 0
    }
  });

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((error) => {
    console.error("Erro ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });