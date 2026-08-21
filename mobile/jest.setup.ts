process.env.EXPO_PUBLIC_API_BASE_URL = "http://127.0.0.1:5186";

if (!globalThis.atob) {
  globalThis.atob = (value: string) => require("node:buffer").Buffer.from(value, "base64").toString("binary");
}

if (!globalThis.btoa) {
  globalThis.btoa = (value: string) => require("node:buffer").Buffer.from(value, "binary").toString("base64");
}

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };

  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children),
    SafeAreaView: ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children),
    SafeAreaInsetsContext: React.createContext(insets),
    SafeAreaFrameContext: React.createContext(frame),
    initialWindowMetrics: { insets, frame },
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame
  };
});
