import { UnitType } from "../enums/unit-type";

type Unit = {
  id: string;
  unidadeMatrizId: string | null;
  nome: string;
  tipo: UnitType;
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

export type { Unit };