import { UserRole } from "../../domain/enums/user-role";
import type { RefreshSessionRepository } from "../../domain/repositories/refresh-session-repository";
import type { UserRepository } from "../../domain/repositories/user-repository";
import { AppError } from "../../shared/errors/app-error";

type LoginUserInput = {
  email: string;
  senha: string;
};

type PasswordComparer = {
  compare(value: string, hash: string): Promise<boolean>;
};

type TokenService = {
  generate(data: {
    userId: string;
    perfil: UserRole;
    unidadeId: string | null;
  }): string;
};

type RefreshTokenGenerator = {
  generate(): {
    token: string;
    tokenHash: string;
    expiresAt: Date;
  };
};

function invalidCredentialsError() {
  return new AppError(
    401,
    "CREDENCIAIS_INVALIDAS",
    "E-mail ou senha inválidos.",
    [
      {
        field: "emailOuSenha",
        issue: "Não foi possível autenticar com os dados informados."
      }
    ]
  );
}

class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordComparer: PasswordComparer,
    private readonly tokenService: TokenService,
    private readonly refreshSessionRepository: RefreshSessionRepository,
    private readonly refreshTokenGenerator: RefreshTokenGenerator
  ) {}

  async execute(input: LoginUserInput) {
    const email = input.email.trim().toLowerCase();
    const usuario = await this.userRepository.findByEmail(email);

    if (!usuario) {
      throw invalidCredentialsError();
    }

    const validPassword = await this.passwordComparer.compare(
      input.senha,
      usuario.senhaHash
    );

    if (!validPassword) {
      throw invalidCredentialsError();
    }

    if (!usuario.ativo) {
      throw new AppError(
        403,
        "USUARIO_INATIVO",
        "Este usuário está inativo e não pode acessar o sistema."
      );
    }

    const accessToken = this.tokenService.generate({
      userId: usuario.id,
      perfil: usuario.perfil,
      unidadeId: usuario.unidadeId
    });

    const refresh = this.refreshTokenGenerator.generate();

    await this.refreshSessionRepository.create({
      usuarioId: usuario.id,
      tokenHash: refresh.tokenHash,
      expiraEm: refresh.expiresAt
    });

    return {
      accessToken,
      refreshToken: refresh.token,
      tokenType: "Bearer",
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        unidadeId: usuario.unidadeId
      }
    };
  }
}

export { LoginUserUseCase };