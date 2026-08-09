import { AuthController } from "../../api/controllers/auth.controller";
import { RegisterUserUseCase } from "../../application/usecases/register-user.use-case";
import { PrismaUserRepository } from "../../infrastructure/database/repositories/prisma-user-repository";
import { BcryptPasswordHasher } from "../../infrastructure/security/bcrypt-password-hasher";

function makeAuthController() {
  const userRepository = new PrismaUserRepository();
  const passwordHasher = new BcryptPasswordHasher();

  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    passwordHasher
  );

  return new AuthController(registerUserUseCase);
}

export { makeAuthController };