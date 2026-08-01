import type { Category } from "@/entities/category";
import { authApi } from "@/entities/session";

export function deleteCategory(id: string): Promise<Category> {
  return authApi.delete<Category>(`/categories/${encodeURIComponent(id)}`);
}
