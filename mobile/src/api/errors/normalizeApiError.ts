import { AxiosError, isAxiosError } from "axios";

import type { ProblemDetails } from "@/types/api";

export type ApiErrorKind =
  | "validation"
  | "unauthenticated"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "server"
  | "network"
  | "timeout"
  | "unknown";

export interface NormalizedApiError {
  kind: ApiErrorKind;
  status?: number;
  title: string;
  message: string;
  traceId?: string;
  errors?: Record<string, string[]>;
  original: unknown;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (!isAxiosError(error)) {
    return {
      kind: "unknown",
      title: "Unexpected error",
      message: "Something went wrong.",
      original: error
    };
  }

  if (error.code === AxiosError.ETIMEDOUT || error.code === "ECONNABORTED") {
    return {
      kind: "timeout",
      title: "Request timed out",
      message: "The server did not respond in time.",
      original: error
    };
  }

  if (!error.response) {
    return {
      kind: "network",
      title: "Unable to connect",
      message: "Check your connection and try again.",
      original: error
    };
  }

  const status = error.response.status;
  const problem = isProblemDetails(error.response.data) ? error.response.data : undefined;

  return {
    kind: getKind(status),
    status,
    title: problem?.title ?? getDefaultTitle(status),
    message: problem?.detail ?? getDefaultMessage(status),
    traceId: problem?.traceId,
    errors: problem?.errors,
    original: error
  };
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return typeof value === "object" && value !== null;
}

function getKind(status: number): ApiErrorKind {
  switch (status) {
    case 400:
      return "validation";
    case 401:
      return "unauthenticated";
    case 403:
      return "forbidden";
    case 404:
      return "not-found";
    case 409:
      return "conflict";
    case 500:
      return "server";
    default:
      return "unknown";
  }
}

function getDefaultTitle(status: number): string {
  switch (status) {
    case 400:
      return "Validation failed";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not found";
    case 409:
      return "Conflict";
    case 500:
      return "Server error";
    default:
      return "Request failed";
  }
}

function getDefaultMessage(status: number): string {
  return status >= 500 ? "The server could not complete the request." : "The request could not be completed.";
}
