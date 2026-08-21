import { requestLeaveSchema } from "@/features/leave/schemas/requestLeave.schema";

describe("requestLeaveSchema", () => {
  it("requires mandatory fields", () => {
    const result = requestLeaveSchema.safeParse({
      leaveType: "Annual",
      startDate: "",
      endDate: "",
      reason: ""
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.startDate).toContain("Start date is required.");
      expect(result.error.flatten().fieldErrors.endDate).toContain("End date is required.");
      expect(result.error.flatten().fieldErrors.reason).toContain("Reason is required.");
    }
  });

  it("rejects past leave dates", () => {
    const result = requestLeaveSchema.safeParse({
      leaveType: "Annual",
      startDate: "2000-01-01",
      endDate: "2000-01-02",
      reason: "Family event"
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.startDate).toContain("Start date cannot be in the past.");
      expect(result.error.flatten().fieldErrors.endDate).toContain("End date cannot be in the past.");
    }
  });

  it("validates that start date cannot be after end date", () => {
    const result = requestLeaveSchema.safeParse({
      leaveType: "Annual",
      startDate: "2026-08-25",
      endDate: "2026-08-24",
      reason: "Family event"
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.endDate).toContain("Start date cannot be after end date.");
    }
  });
});
