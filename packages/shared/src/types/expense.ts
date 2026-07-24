export interface Expense {
  id: string;
  amount: number;
  currency: string;
  categoryId: string;
  date: string;
  comment?: string;
}
