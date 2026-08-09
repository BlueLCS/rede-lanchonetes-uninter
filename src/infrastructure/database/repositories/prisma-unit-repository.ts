import type { Unit } from "../../../domain/entities/unit";
import { UnitType } from "../../../domain/enums/unit-type";
import type {
  CreateUnitData,
  ListUnitsResult,
  UnitRepository,
  UpdateUnitData
} from "../../../domain/repositories/unit-repository";
import { TipoUnidade as PrismaUnitType } from "../../../generated/prisma/client";
import { prisma } from "../prisma";

type PrismaUnitData = {
  id: string;
  unidadeMatrizId: string | null;
  nome: string;
  tipo: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
};

function mapUnit(unidade: PrismaUnitData): Unit {
  return {
    id: unidade.id,
    unidadeMatrizId: unidade.unidadeMatrizId,
    nome: unidade.nome,
    tipo: unidade.tipo as UnitType,
    logradouro: unidade.logradouro,
    numero: unidade.numero,
    bairro: unidade.bairro,
    cidade: unidade.cidade,
    uf: unidade.uf,
    cep: unidade.cep,
    ativo: unidade.ativo,
    criadoEm: unidade.criadoEm,
    atualizadoEm: unidade.atualizadoEm
  };
}

class PrismaUnitRepository implements UnitRepository {
  async findById(id: string): Promise<Unit | null> {
    const unidade = await prisma.unidade.findUnique({
      where: {
        id
      }
    });

    return unidade ? mapUnit(unidade) : null;
  }

  async listActive(
    page: number,
    limit: number
  ): Promise<ListUnitsResult> {
    const [unidades, total] = await prisma.$transaction([
      prisma.unidade.findMany({
        where: {
          ativo: true
        },
        orderBy: {
          nome: "asc"
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.unidade.count({
        where: {
          ativo: true
        }
      })
    ]);

    return {
      items: unidades.map(mapUnit),
      total
    };
  }

  async create(data: CreateUnitData): Promise<Unit> {
    const unidade = await prisma.unidade.create({
      data: {
        unidadeMatrizId: data.unidadeMatrizId,
        nome: data.nome,
        tipo: data.tipo as PrismaUnitType,
        logradouro: data.logradouro,
        numero: data.numero,
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf,
        cep: data.cep
      }
    });

    return mapUnit(unidade);
  }

  async update(
    id: string,
    data: UpdateUnitData
  ): Promise<Unit> {
    const unidade = await prisma.unidade.update({
      where: {
        id
      },
      data: {
        unidadeMatrizId: data.unidadeMatrizId,
        nome: data.nome,
        tipo: data.tipo
          ? (data.tipo as PrismaUnitType)
          : undefined,
        logradouro: data.logradouro,
        numero: data.numero,
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf,
        cep: data.cep,
        ativo: data.ativo
      }
    });

    return mapUnit(unidade);
  }
}

export { PrismaUnitRepository };