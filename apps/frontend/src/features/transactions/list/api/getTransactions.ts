import type { PaginatedResult, Transaction } from "@/entities/transaction";
import { authApi } from "@/entities/session";

const PAGE_SIZE = 10;

export function getTransactions(page: number): Promise<PaginatedResult<Transaction>> {
  return authApi.get<PaginatedResult<Transaction>>(
    `/transactions?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(PAGE_SIZE)}`,
  );
}
