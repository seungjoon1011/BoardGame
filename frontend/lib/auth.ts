export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('accessToken');
}

export function getRefreshToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('refreshToken');
}

export function saveAuthTokens(tokens: AuthTokens) {
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
  window.dispatchEvent(new Event('auth:changed'));
}

export function clearAuthTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.dispatchEvent(new Event('auth:changed'));
}

export function isLoggedIn() {
  return Boolean(getAccessToken());
}
