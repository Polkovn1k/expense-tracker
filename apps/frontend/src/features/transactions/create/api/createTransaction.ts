import type { CreateTransactionDto } from "@expense-tracker/shared";
import type { Transaction } from "@/entities/transaction";
import { authApi } from "@/entities/session";

export function createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
  return authApi.post<Transaction>("/transactions", { body: dto });
}
