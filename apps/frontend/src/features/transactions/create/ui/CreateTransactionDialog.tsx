"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";
import type { Category } from "@/entities/category";
import { TransactionType, type Transaction } from "@/entities/transaction";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useCreateTransactionForm } from "../model/useCreateTransactionForm";

type CreateTransactionDialogProps = {
  categories: Category[];
  categoriesLoading: boolean;
  onCreated: (transaction: Transaction) => void;
};

export function CreateTransactionDialog({ categories, categoriesLoading, onCreated }: CreateTransactionDialogProps) {
  const [open, setOpen] = useState(false);

  const { form, onSubmit, submitError } = useCreateTransactionForm((transaction) => {
    setOpen(false);
    onCreated(transaction);
  });
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const noCategories = !categoriesLoading && categories.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Добавить транзакцию</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая транзакция</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="transaction-amount">Сумма</Label>
            <Input
              id="transaction-amount"
              type="number"
              step="0.01"
              aria-invalid={!!errors.amount}
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Тип</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TransactionType.EXPENSE}>Расход</SelectItem>
                    <SelectItem value={TransactionType.INCOME}>Доход</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Категория</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={noCategories}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={noCategories ? "Сначала создайте категорию" : "Выберите категорию"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="transaction-date">Дата</Label>
            <Input id="transaction-date" type="date" aria-invalid={!!errors.date} {...register("date")} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="transaction-description">Описание</Label>
            <Input id="transaction-description" {...register("description")} />
          </div>
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || noCategories}>
              {isSubmitting ? "Сохранение..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
