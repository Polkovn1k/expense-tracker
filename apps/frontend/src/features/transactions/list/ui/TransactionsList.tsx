import type { Category } from "@/entities/category";
import type { Transaction } from "@/entities/transaction";
import { TransactionType } from "@/entities/transaction";
import { Button } from "@/shared/ui/button";
import { Pagination, PaginationContent, PaginationItem } from "@/shared/ui/pagination";
import { Skeleton } from "@/shared/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { timeZone: "UTC" });
}

function formatAmount(amount: number, type: Transaction["type"]) {
  const sign = type === TransactionType.INCOME ? "+" : "-";
  return `${sign}${amount.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;
}

type TransactionsListProps = {
  transactions: Transaction[];
  categoriesById: Record<string, Category>;
  isLoading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function TransactionsList({
  transactions,
  categoriesById,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
}: TransactionsListProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground">Транзакций пока нет.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Дата</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead className="text-right">Сумма</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const category = categoriesById[transaction.categoryId];
            return (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>
                  {category ? `${category.icon} ${category.name}` : "—"}
                </TableCell>
                <TableCell>{transaction.description || "—"}</TableCell>
                <TableCell
                  className={
                    transaction.type === TransactionType.INCOME
                      ? "text-right text-emerald-600 dark:text-emerald-400"
                      : "text-right text-destructive"
                  }
                >
                  {formatAmount(transaction.amount, transaction.type)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                Назад
              </Button>
            </PaginationItem>
            <PaginationItem>
              <span className="px-2 text-sm text-muted-foreground">
                Страница {page} из {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                Вперёд
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
