import type { Unit } from "../entities/unit";
import { UnitType } from "../enums/unit-type";

type CreateUnitData = {
  unidadeMatrizId?: string | null;
  nome: string;
  tipo: UnitType;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
};

type UpdateUnitData = {
  unidadeMatrizId?: string | null;
  nome?: string;
  tipo?: UnitType;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  ativo?: boolean;
};

type ListUnitsResult = {
  items: Unit[];
  total: number;
};

interface UnitRepository {
  findById(id: string): Promise<Unit | null>;
  listActive(page: number, limit: number): Promise<ListUnitsResult>;
  create(data: CreateUnitData): Promise<Unit>;
  update(id: string, data: UpdateUnitData): Promise<Unit>;
}

export type {
  CreateUnitData,
  ListUnitsResult,
  UnitRepository,
  UpdateUnitData
};