import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Expense Tracker",
  description: "Трекер расходов",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
