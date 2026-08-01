import type { Category } from "@/entities/category";
import type { CreateCategoryDto } from "@expense-tracker/shared";
import { authApi } from "@/entities/session";

export function createCategory(dto: CreateCategoryDto): Promise<Category> {
  return authApi.post<Category>("/categories", { body: dto });
}
