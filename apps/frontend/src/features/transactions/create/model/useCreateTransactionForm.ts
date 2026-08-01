"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Transaction } from "@/entities/transaction";
import { TransactionType } from "@/entities/transaction";
import { ApiError } from "@/shared/api/client";
import { createTransaction } from "../api/createTransaction";

const transactionSchema = z.object({
  amount: z.number().positive("Сумма должна быть больше нуля"),
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
  date: z.string().min(1, "Укажите дату"),
  categoryId: z.string().min(1, "Выберите категорию"),
  description: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function useCreateTransactionForm(onSuccess: (transaction: Transaction) => void) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      type: TransactionType.EXPENSE,
      date: today(),
      categoryId: "",
      description: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const transaction = await createTransaction({
        ...values,
        description: values.description || undefined,
      });
      onSuccess(transaction);
      form.reset({ amount: 0, type: TransactionType.EXPENSE, date: today(), categoryId: "", description: "" });
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : "Не удалось создать транзакцию. Попробуйте ещё раз.",
      );
    }
  });

  return { form, onSubmit, submitError };
}
