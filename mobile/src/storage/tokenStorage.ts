import * as SecureStore from "expo-secure-store";

export const tokenStorageKey = "ems_access_token";

export const tokenStorage = {
  get(): Promise<string | null> {
    return SecureStore.getItemAsync(tokenStorageKey);
  },

  set(token: string): Promise<void> {
    return SecureStore.setItemAsync(tokenStorageKey, token);
  },

  remove(): Promise<void> {
    return SecureStore.deleteItemAsync(tokenStorageKey);
  }
};
