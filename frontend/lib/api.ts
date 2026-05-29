export const API_BASE_URL = '/api';

import { clearAuthTokens, getRefreshToken, saveAuthTokens } from '@/lib/auth';

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string | null;
  retryOnUnauthorized?: boolean;
};

export type UploadResponse = {
  folder: string;
  key: string;
  url: string;
  contentType: string;
  size: number;
};

export async function apiRequest<T>(
  path: string,
  {
    body,
    token,
    headers,
    retryOnUnauthorized = true,
    ...options
  }: ApiOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshedToken = await refreshAccessToken();

    if (refreshedToken) {
      return apiRequest<T>(path, {
        body,
        token: refreshedToken,
        headers,
        retryOnUnauthorized: false,
        ...options,
      });
    }
  }

  if (!response.ok) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : Array.isArray(data?.message)
          ? data.message.join(', ')
          : '요청을 처리하지 못했습니다.';
    throw new Error(message);
  }

  return data as T;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const data = await apiRequest<{
      access_token: string;
      refresh_token: string;
    }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      retryOnUnauthorized: false,
    });

    saveAuthTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    });

    return data.access_token;
  } catch {
    clearAuthTokens();
    return null;
  }
}

export async function uploadFile(
  path: string,
  file: File,
  token?: string | null,
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : Array.isArray(data?.message)
          ? data.message.join(', ')
          : '파일 업로드에 실패했습니다.';
    throw new Error(message);
  }

  return data as UploadResponse;
}
