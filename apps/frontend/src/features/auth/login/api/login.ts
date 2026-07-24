import type { AuthUser, LoginDto } from "@expense-tracker/shared";
import { apiClient } from "@/shared/api/client";

type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export function login(dto: LoginDto): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/auth/login", { body: dto });
}
