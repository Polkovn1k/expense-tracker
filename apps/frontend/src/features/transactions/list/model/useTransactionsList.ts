"use client";

import { useCallback, useEffect, useState } from "react";
import type { Transaction } from "@/entities/transaction";
import { ApiError } from "@/shared/api/client";
import { getTransactions } from "../api/getTransactions";

export function useTransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTransactions(page);
      setTransactions(result.data);
      setTotal(result.total);
      setPageSize(result.pageSize);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось загрузить транзакции.");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { transactions, total, page, pageSize, setPage, isLoading, error, refetch };
}
