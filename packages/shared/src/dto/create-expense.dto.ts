export interface CreateExpenseDto {
  amount: number;
  currency: string;
  categoryId: string;
  date: string;
  comment?: string;
}
