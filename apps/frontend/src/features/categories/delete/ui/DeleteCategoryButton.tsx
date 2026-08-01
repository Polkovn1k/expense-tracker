"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { useDeleteCategory } from "../model/useDeleteCategory";

type DeleteCategoryButtonProps = {
  categoryId: string;
  categoryName: string;
  onDeleted: (id: string) => void;
};

export function DeleteCategoryButton({ categoryId, categoryName, onDeleted }: DeleteCategoryButtonProps) {
  const { remove, isDeleting, error } = useDeleteCategory(onDeleted);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Удалить
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить категорию «{categoryName}»?</AlertDialogTitle>
          <AlertDialogDescription>
            Действие необратимо. Транзакции, привязанные к этой категории, также будут удалены.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} onClick={() => remove(categoryId)}>
            {isDeleting ? "Удаление..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
