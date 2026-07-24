"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { saveSession } from "@/entities/session";
import { ApiError } from "@/shared/api/client";
import { register as registerRequest } from "../api/register";

const registerSchema = z.object({
  name: z.string().min(1, "Введите имя"),
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  password: z.string().min(8, "Пароль должен содержать не менее 8 символов"),
  agreeToTerms: z.boolean().refine((value) => value === true, {
    message: "Необходимо согласиться с условиями",
  }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function useRegisterForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", agreeToTerms: false },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const { agreeToTerms: _agreeToTerms, ...dto } = values;
      const { accessToken, user } = await registerRequest(dto);
      saveSession({ accessToken, user });
      router.push("/transactions");
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : "Не удалось зарегистрироваться. Попробуйте ещё раз.",
      );
    }
  });

  return { form, onSubmit, submitError };
}
