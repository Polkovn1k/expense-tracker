export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
  categoryId: string;
  userId: string;
  createdAt: string;
}
