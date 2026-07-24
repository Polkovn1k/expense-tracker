"use client";

import Link from "next/link";
import { Controller } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useRegisterForm } from "../model/useRegisterForm";

export function RegisterForm() {
  const { form, onSubmit, submitError } = useRegisterForm();
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>Создайте аккаунт для трекера расходов</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
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
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <Controller
                name="agreeToTerms"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="agreeToTerms"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    aria-invalid={!!errors.agreeToTerms}
                  />
                )}
              />
              <Label htmlFor="agreeToTerms" className="block font-normal leading-snug">
                Согласен с{" "}
                <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
                  пользовательским соглашением
                </Link>{" "}
                и{" "}
                <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
                  политикой обработки данных
                </Link>
              </Label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-destructive">{errors.agreeToTerms.message}</p>
            )}
          </div>
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Войти
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
