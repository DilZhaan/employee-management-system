import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export function getPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getOptionalBoolean(value: string | null): boolean | undefined {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

export function setParam(params: URLSearchParams, key: string, value: string | undefined) {
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
}

export function useListSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateSearchParams = useCallback((updates: Record<string, string | undefined>, resetPage = true) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      for (const [key, value] of Object.entries(updates)) {
        setParam(next, key, value);
      }
      if (resetPage) {
        next.set("page", "1");
      }
      return next;
    });
  }, [setSearchParams]);

  return { searchParams, updateSearchParams, setSearchParams };
}
