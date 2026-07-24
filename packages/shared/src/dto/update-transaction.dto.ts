import type { TransactionType } from "../types/transaction.ts";

export interface UpdateTransactionDto {
  amount?: number;
  type?: TransactionType;
  description?: string;
  date?: string;
  categoryId?: string;
}
