let accessToken: string | null = null;

export const sessionToken = {
  get(): string | null {
    return accessToken;
  },
  set(token: string | null): void {
    accessToken = token;
  }
};
