import { UserRole } from "../enums/user-role";

type User = {
  id: string;
  unidadeId: string | null;
  nome: string;
  email: string;
  senhaHash: string;
  perfil: UserRole;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type { User };