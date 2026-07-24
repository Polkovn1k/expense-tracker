"use client";

import { useCallback, useEffect, useState } from "react";
import { getCategories, type Category } from "@/entities/category";
import { ApiError } from "@/shared/api/client";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setCategories(await getCategories());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось загрузить категории.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, isLoading, error, refetch, setCategories };
}
