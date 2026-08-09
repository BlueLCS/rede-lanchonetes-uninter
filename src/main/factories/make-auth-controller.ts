import { AuthController } from "../../api/controllers/auth.controller";
import { LoginUserUseCase } from "../../application/usecases/login-user.use-case";
import { RegisterUserUseCase } from "../../application/usecases/register-user.use-case";
import { PrismaUserRepository } from "../../infrastructure/database/repositories/prisma-user-repository";
import { BcryptPasswordHasher } from "../../infrastructure/security/bcrypt-password-hasher";
import { JwtTokenService } from "../../infrastructure/security/jwt-token-service";

function makeAuthController() {
  const userRepository = new PrismaUserRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService();

  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    passwordHasher
  );

  const loginUserUseCase = new LoginUserUseCase(
    userRepository,
    passwordHasher,
    tokenService
  );

  return new AuthController(
    registerUserUseCase,
    loginUserUseCase
  );
}

export { makeAuthController };