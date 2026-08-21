import * as SecureStore from "expo-secure-store";

import { tokenStorage, tokenStorageKey } from "@/storage/tokenStorage";

const mockedSecureStore = jest.mocked(SecureStore);

describe("tokenStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets the access token", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue("fake-token");

    await expect(tokenStorage.get()).resolves.toBe("fake-token");
    expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith(tokenStorageKey);
  });

  it("sets the access token", async () => {
    mockedSecureStore.setItemAsync.mockResolvedValue();

    await tokenStorage.set("fake-token");

    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(tokenStorageKey, "fake-token");
  });

  it("removes the access token", async () => {
    mockedSecureStore.deleteItemAsync.mockResolvedValue();

    await tokenStorage.remove();

    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(tokenStorageKey);
  });
});
