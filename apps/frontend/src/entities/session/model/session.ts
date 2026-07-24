import type { AuthUser } from "@/entities/user";

const SESSION_KEY = "expense-tracker:session";

export type Session = {
  accessToken: string;
  user: AuthUser;
};

export function saveSession(session: Session): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}
