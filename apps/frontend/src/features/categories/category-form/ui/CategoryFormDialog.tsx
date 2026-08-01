"use client";

import { useState } from "react";
import type { Category } from "@/entities/category";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useCategoryForm } from "../model/useCategoryForm";

type CategoryFormDialogProps = {
  category?: Category;
  onSaved: (category: Category) => void;
  trigger: React.ReactNode;
};

export function CategoryFormDialog({ category, onSaved, trigger }: CategoryFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { form, onSubmit, submitError } = useCategoryForm({
    category,
    onSuccess: (result) => {
      setOpen(false);
      onSaved(result);
    },
  });
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Редактировать категорию" : "Новая категория"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="category-name">Название</Label>
            <Input id="category-name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category-color">Цвет</Label>
            <Input
              id="category-color"
              type="color"
              className="h-8 w-16 p-1"
              aria-invalid={!!errors.color}
              {...register("color")}
            />
            {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category-icon">Иконка (эмодзи)</Label>
            <Input id="category-icon" aria-invalid={!!errors.icon} {...register("icon")} />
            {errors.icon && <p className="text-sm text-destructive">{errors.icon.message}</p>}
          </div>
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
