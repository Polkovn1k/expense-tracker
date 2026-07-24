"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useLoginForm } from "../model/useLoginForm";

export function LoginForm() {
  const { form, onSubmit, submitError } = useLoginForm();
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Вход</CardTitle>
        <CardDescription>Войдите в свой аккаунт трекера расходов</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Вход..." : "Войти"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
