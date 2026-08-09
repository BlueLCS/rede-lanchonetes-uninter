import { AuthController } from "../../api/controllers/auth.controller";
import { LoginUserUseCase } from "../../application/usecases/login-user.use-case";
import { LogoutUserUseCase } from "../../application/usecases/logout-user.use-case";
import { RefreshAccessTokenUseCase } from "../../application/usecases/refresh-access-token.use-case";
import { RegisterUserUseCase } from "../../application/usecases/register-user.use-case";
import { PrismaRefreshSessionRepository } from "../../infrastructure/database/repositories/prisma-refresh-session-repository";
import { PrismaUserRepository } from "../../infrastructure/database/repositories/prisma-user-repository";
import { BcryptPasswordHasher } from "../../infrastructure/security/bcrypt-password-hasher";
import { JwtTokenService } from "../../infrastructure/security/jwt-token-service";
import { RefreshTokenService } from "../../infrastructure/security/refresh-token-service";

function makeAuthController() {
  const userRepository = new PrismaUserRepository();
  const sessionRepository = new PrismaRefreshSessionRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService();
  const refreshTokenService = new RefreshTokenService();

  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    passwordHasher
  );

  const loginUserUseCase = new LoginUserUseCase(
    userRepository,
    passwordHasher,
    tokenService,
    sessionRepository,
    refreshTokenService
  );

  const refreshAccessTokenUseCase =
    new RefreshAccessTokenUseCase(
      sessionRepository,
      userRepository,
      tokenService,
      refreshTokenService
    );

  const logoutUserUseCase = new LogoutUserUseCase(
    sessionRepository,
    refreshTokenService
  );

  return new AuthController(
    registerUserUseCase,
    loginUserUseCase,
    refreshAccessTokenUseCase,
    logoutUserUseCase
  );
}

export { makeAuthController };