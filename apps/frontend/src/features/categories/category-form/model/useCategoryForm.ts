"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Category } from "@/entities/category";
import { ApiError } from "@/shared/api/client";
import { createCategory } from "../api/createCategory";
import { updateCategory } from "../api/updateCategory";

const categorySchema = z.object({
  name: z.string().min(1, "Введите название"),
  color: z.string().min(1, "Укажите цвет"),
  icon: z.string().min(1, "Укажите иконку"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

type UseCategoryFormOptions = {
  category?: Category;
  onSuccess: (category: Category) => void;
};

export function useCategoryForm({ category, onSuccess }: UseCategoryFormOptions) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      color: category?.color ?? "#6366f1",
      icon: category?.icon ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const result = category ? await updateCategory(category.id, values) : await createCategory(values);
      onSuccess(result);
      form.reset();
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : "Не удалось сохранить категорию. Попробуйте ещё раз.");
    }
  });

  return { form, onSubmit, submitError };
}
