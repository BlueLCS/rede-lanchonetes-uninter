import type { User } from "../entities/user";
import { UserRole } from "../enums/user-role";

type CreateUserData = {
  nome: string;
  email: string;
  senhaHash: string;
  perfil: UserRole;
};

interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}

export type { CreateUserData, UserRepository };