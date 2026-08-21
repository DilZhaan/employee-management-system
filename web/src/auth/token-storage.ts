const ACCESS_TOKEN_KEY = "ems_access_token";

export const tokenStorage = {
  get(): string | null {
    return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },
  set(token: string): void {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  remove(): void {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};
