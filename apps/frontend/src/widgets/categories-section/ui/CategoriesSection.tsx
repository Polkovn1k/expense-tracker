"use client";

import { CategoryFormDialog } from "@/features/categories/category-form";
import { DeleteCategoryButton } from "@/features/categories/delete";
import { CategoryTable, useCategories } from "@/features/categories/list";
import { Button } from "@/shared/ui/button";

export function CategoriesSection() {
  const { categories, isLoading, error, setCategories } = useCategories();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Категории</h1>
        <CategoryFormDialog
          onSaved={(category) => setCategories((prev) => [...prev, category])}
          trigger={<Button>Добавить категорию</Button>}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <CategoryTable
        categories={categories}
        isLoading={isLoading}
        renderActions={(category) => (
          <>
            <CategoryFormDialog
              category={category}
              onSaved={(updated) =>
                setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
              }
              trigger={
                <Button variant="ghost" size="sm">
                  Изменить
                </Button>
              }
            />
            <DeleteCategoryButton
              categoryId={category.id}
              categoryName={category.name}
              onDeleted={(id) => setCategories((prev) => prev.filter((c) => c.id !== id))}
            />
          </>
        )}
      />
    </div>
  );
}
