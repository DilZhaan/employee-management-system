import { parseAuthUserFromToken } from "@/utils/jwt";

describe("parseAuthUserFromToken", () => {
  it("parses valid backend claim shape", () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbXBsb3llZV9pZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiZW1wbG95ZWVAZXhhbXBsZS5jb20iLCJleHAiOjQxMDI0NDQ4MDAsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkVtcGxveWVlIn0.signature";

    expect(parseAuthUserFromToken(token)).toEqual({
      employeeId: "00000000-0000-0000-0000-000000000001",
      email: "employee@example.com",
      role: "Employee",
      expiresAt: 4102444800
    });
  });
});
