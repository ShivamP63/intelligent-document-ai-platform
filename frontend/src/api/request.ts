import { API_BASE_URL } from './client';

export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  const token = localStorage.getItem('docai_token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(API_BASE_URL + path, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message = typeof error?.detail === 'string'
      ? error.detail
      : `The request could not be completed (${response.status}).`;
    throw new ApiError(response.status, message);
  }
  return response.json() as Promise<T>;
}

export function errorMessage(error: unknown) {
  if (error instanceof TypeError) return 'Could not reach the service. Check your connection and try again.';
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
