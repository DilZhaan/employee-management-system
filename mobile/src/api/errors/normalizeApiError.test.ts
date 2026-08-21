import { AxiosError } from "axios";

import { normalizeApiError } from "@/api/errors/normalizeApiError";

describe("normalizeApiError", () => {
  it("normalizes backend validation responses", () => {
    const error = new AxiosError("Bad request", undefined, undefined, undefined, {
      data: {
        title: "Validation failed",
        status: 400,
        traceId: "trace-1",
        errors: {
          Email: ["Email is required"]
        }
      },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {} as never
    });

    const normalized = normalizeApiError(error);

    expect(normalized.kind).toBe("validation");
    expect(normalized.status).toBe(400);
    expect(normalized.title).toBe("Validation failed");
    expect(normalized.traceId).toBe("trace-1");
    expect(normalized.errors?.Email).toEqual(["Email is required"]);
  });

  it("normalizes network failures separately", () => {
    const error = new AxiosError("Network Error");

    const normalized = normalizeApiError(error);

    expect(normalized.kind).toBe("network");
    expect(normalized.title).toBe("Unable to connect");
  });
});
