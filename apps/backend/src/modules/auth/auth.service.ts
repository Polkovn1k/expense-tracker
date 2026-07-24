import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { SafeUser, UsersService } from "../users/users.service";
import { JwtPayload } from "./types/jwt-payload.type";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(params: { name: string; email: string; password: string }): Promise<{ accessToken: string; user: SafeUser }> {
    const user = await this.usersService.createUser(params);
    return this.buildAuthResponse(user);
  }

  async login(params: { email: string; password: string }): Promise<{ accessToken: string; user: SafeUser }> {
    const user = await this.usersService.findByEmail(params.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValid = await this.usersService.validatePassword(user, params.password);
    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User): { accessToken: string; user: SafeUser } {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: this.usersService.toSafeUser(user),
    };
  }
}
