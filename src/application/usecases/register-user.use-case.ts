import { UserRole } from "../../domain/enums/user-role";
import type { UserRepository } from "../../domain/repositories/user-repository";
import { AppError } from "../../shared/errors/app-error";

type RegisterUserInput = {
  nome: string;
  email: string;
  senha: string;
};

type PasswordHasher = {
  hash(value: string): Promise<string>;
};

class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: RegisterUserInput) {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError(
        409,
        "EMAIL_JA_CADASTRADO",
        "Já existe um usuário cadastrado com este e-mail.",
        [
          {
            field: "email",
            issue: "O e-mail informado já está em uso."
          }
        ]
      );
    }

    const senhaHash = await this.passwordHasher.hash(input.senha);

    const usuario = await this.userRepository.create({
      nome: input.nome.trim(),
      email,
      senhaHash,
      perfil: UserRole.CLIENTE
    });

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
      criadoEm: usuario.criadoEm
    };
  }
}

export { RegisterUserUseCase };
export type { RegisterUserInput };