import Link from "next/link";
import { Button } from "@/shared/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Expense Tracker</h1>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/login">Войти</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/register">Регистрация</Link>
        </Button>
      </div>
    </main>
  );
}
