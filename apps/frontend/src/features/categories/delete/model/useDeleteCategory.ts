"use client";

import { useState } from "react";
import { ApiError } from "@/shared/api/client";
import { deleteCategory } from "../api/deleteCategory";

export function useDeleteCategory(onDeleted: (id: string) => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteCategory(id);
      onDeleted(id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось удалить категорию.");
    } finally {
      setIsDeleting(false);
    }
  };

  return { remove, isDeleting, error };
}
