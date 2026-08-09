import type { User } from "../../../domain/entities/user";
import { UserRole } from "../../../domain/enums/user-role";
import type {
  CreateUserData,
  UserRepository
} from "../../../domain/repositories/user-repository";
import { PerfilUsuario } from "../../../generated/prisma/client";
import { prisma } from "../prisma";

type PrismaUserData = {
  id: string;
  unidadeId: string | null;
  nome: string;
  email: string;
  senhaHash: string;
  perfil: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
};

function mapUser(usuario: PrismaUserData): User {
  return {
    id: usuario.id,
    unidadeId: usuario.unidadeId,
    nome: usuario.nome,
    email: usuario.email,
    senhaHash: usuario.senhaHash,
    perfil: usuario.perfil as UserRole,
    ativo: usuario.ativo,
    criadoEm: usuario.criadoEm,
    atualizadoEm: usuario.atualizadoEm
  };
}

class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const usuario = await prisma.usuario.findUnique({
      where: {
        id
      }
    });

    return usuario ? mapUser(usuario) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const usuario = await prisma.usuario.findUnique({
      where: {
        email
      }
    });

    return usuario ? mapUser(usuario) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senhaHash: data.senhaHash,
        perfil: data.perfil as PerfilUsuario
      }
    });

    return mapUser(usuario);
  }
}

export { PrismaUserRepository };