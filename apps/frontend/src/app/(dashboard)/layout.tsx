"use client";

import type { ReactNode } from "react";
import { useRequireSession } from "@/entities/session";
import { Header } from "@/widgets/header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const session = useRequireSession();

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Header user={session.user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
