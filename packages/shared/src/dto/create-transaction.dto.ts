import type { TransactionType } from "../types/transaction.ts";

export interface CreateTransactionDto {
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
  categoryId: string;
}
