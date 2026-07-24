import { env } from "@/shared/config/env";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  body?: unknown;
  token?: string;
};

async function request<TResponse>(
  method: "GET" | "POST",
  path: string,
  { body, token }: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const message = (data as { message?: string | string[] } | null)?.message;
    throw new ApiError(
      Array.isArray(message) ? message.join(", ") : (message ?? "Не удалось выполнить запрос"),
      response.status,
    );
  }

  return data as TResponse;
}

export const apiClient = {
  get: <TResponse>(path: string, options?: RequestOptions) => request<TResponse>("GET", path, options),
  post: <TResponse>(path: string, options?: RequestOptions) => request<TResponse>("POST", path, options),
};
