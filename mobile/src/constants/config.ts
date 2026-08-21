const apiBaseUrl = getRequiredPublicEnv("EXPO_PUBLIC_API_BASE_URL");

export const config = {
  apiBaseUrl,
  requestTimeoutMs: 15_000
} as const;

function getRequiredPublicEnv(key: "EXPO_PUBLIC_API_BASE_URL"): string {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`${key} is required. Create mobile/.env from mobile/.env.example and set the backend API URL.`);
  }

  try {
    new URL(value);
  } catch {
    throw new Error(`${key} must be a valid absolute URL.`);
  }

  return value.replace(/\/+$/, "");
}
