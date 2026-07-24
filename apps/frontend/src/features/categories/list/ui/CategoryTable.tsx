import type { Category } from "@/entities/category";
import { Skeleton } from "@/shared/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

type CategoryTableProps = {
  categories: Category[];
  isLoading: boolean;
  renderActions: (category: Category) => React.ReactNode;
};

export function CategoryTable({ categories, isLoading, renderActions }: CategoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">Категорий пока нет — добавьте первую.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Иконка</TableHead>
          <TableHead>Название</TableHead>
          <TableHead>Цвет</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>{category.icon}</TableCell>
            <TableCell>{category.name}</TableCell>
            <TableCell>
              <span
                className="inline-block size-4 rounded-full ring-1 ring-border align-middle"
                style={{ backgroundColor: category.color }}
              />
            </TableCell>
            <TableCell className="flex justify-end gap-2">{renderActions(category)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
