"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { saveSession } from "@/entities/session";
import { ApiError } from "@/shared/api/client";
import { login } from "../api/login";

const loginSchema = z.object({
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function useLoginForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const { accessToken, user } = await login(values);
      saveSession({ accessToken, user });
      router.push("/");
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : "Не удалось войти. Попробуйте ещё раз.",
      );
    }
  });

  return { form, onSubmit, submitError };
}
