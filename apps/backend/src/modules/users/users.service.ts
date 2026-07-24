import { ConflictException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { UsersRepository } from "./users.repository";

export type SafeUser = Omit<User, "passwordHash">;

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async createUser(params: { name: string; email: string; password: string }): Promise<User> {
    const existing = await this.usersRepository.findByEmail(params.email);
    if (existing) {
      throw new ConflictException("Email already in use");
    }

    const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS);
    return this.usersRepository.create({
      name: params.name,
      email: params.email,
      passwordHash,
    });
  }

  validatePassword(user: User, plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, user.passwordHash);
  }

  toSafeUser(user: User): SafeUser {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
