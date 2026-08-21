import axios, { AxiosError } from "axios";
import type { ApiProblem } from "@/types/api";

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
  detail?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
  original: unknown;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (!axios.isAxiosError(error)) {
    return {
      kind: "unknown",
      title: "Unexpected error",
      detail: "Something went wrong while processing the request.",
      original: error
    };
  }

  if (error.code === AxiosError.ETIMEDOUT || error.code === "ECONNABORTED") {
    return {
      kind: "timeout",
      title: "Request timed out",
      detail: "The server did not respond in time.",
      original: error
    };
  }

  if (!error.response) {
    return {
      kind: "network",
      title: "Network error",
      detail: "The API could not be reached.",
      original: error
    };
  }

  const problem = isApiProblem(error.response.data) ? error.response.data : undefined;
  const status = error.response.status;

  return {
    kind: getKind(status),
    status,
    title: problem?.title ?? getDefaultTitle(status),
    detail: problem?.detail,
    traceId: problem?.traceId,
    errors: problem?.errors,
    original: error
  };
}

function isApiProblem(value: unknown): value is ApiProblem {
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
