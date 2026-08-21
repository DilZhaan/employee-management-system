import { canAccessApprovalsRole } from "@/auth/authorization";

describe("authorization helpers", () => {
  it("allows Manager role to access approvals", () => {
    expect(canAccessApprovalsRole("Manager")).toBe(true);
  });

  it("allows Admin role to access approvals", () => {
    expect(canAccessApprovalsRole("Admin")).toBe(true);
  });

  it("blocks Employee role from approvals", () => {
    expect(canAccessApprovalsRole("Employee")).toBe(false);
  });
});
