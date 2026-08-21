import { loginSchema } from "@/features/auth/schemas/login.schema";

describe("loginSchema", () => {
  it("rejects invalid email values", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret"
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain("Enter a valid email address.");
    }
  });

  it("requires password", () => {
    const result = loginSchema.safeParse({
      email: "employee@example.com",
      password: ""
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain("Password is required.");
    }
  });
});
