import type { Category } from "@/entities/category";
import type { UpdateCategoryDto } from "@expense-tracker/shared";
import { authApi } from "@/entities/session";

export function updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
  return authApi.patch<Category>(`/categories/${encodeURIComponent(id)}`, { body: dto });
}
