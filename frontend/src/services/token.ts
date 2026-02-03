const ACCESS_TOKEN_KEY = "access_token";

export const tokenStore = {
  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clear() {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
