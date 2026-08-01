import { authApi } from "@/entities/session";
import type { Category } from "../model/types";

export function getCategories(): Promise<Category[]> {
  return authApi.get<Category[]>("/categories");
}
