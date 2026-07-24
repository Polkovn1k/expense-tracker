"use client";

import { useMemo } from "react";
import type { Category } from "@/entities/category";
import { CreateTransactionDialog } from "@/features/transactions/create";
import { TransactionsList, useTransactionsList } from "@/features/transactions/list";
import { useCategories } from "@/features/categories/list";

export function TransactionsSection() {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { transactions, total, page, pageSize, setPage, isLoading, error, refetch } = useTransactionsList();

  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category])) as Record<string, Category>,
    [categories],
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Транзакции</h1>
        <CreateTransactionDialog
          categories={categories}
          categoriesLoading={categoriesLoading}
          onCreated={() => refetch()}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <TransactionsList
        transactions={transactions}
        categoriesById={categoriesById}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
