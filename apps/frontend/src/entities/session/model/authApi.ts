import { apiClient } from "@/shared/api/client";
import { getSession } from "./session";

type RequestOptions = { body?: unknown };

function withToken(options?: RequestOptions) {
  return { ...options, token: getSession()?.accessToken };
}

export const authApi = {
  get: <TResponse>(path: string, options?: RequestOptions) => apiClient.get<TResponse>(path, withToken(options)),
  post: <TResponse>(path: string, options?: RequestOptions) => apiClient.post<TResponse>(path, withToken(options)),
  patch: <TResponse>(path: string, options?: RequestOptions) => apiClient.patch<TResponse>(path, withToken(options)),
  delete: <TResponse>(path: string, options?: RequestOptions) =>
    apiClient.delete<TResponse>(path, withToken(options)),
};
