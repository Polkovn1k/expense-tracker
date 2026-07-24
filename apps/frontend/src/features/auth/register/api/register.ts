import type { AuthUser, RegisterDto } from "@expense-tracker/shared";
import { apiClient } from "@/shared/api/client";

type RegisterResponse = {
  accessToken: string;
  user: AuthUser;
};

export function register(dto: RegisterDto): Promise<RegisterResponse> {
  return apiClient.post<RegisterResponse>("/auth/register", { body: dto });
}
