import { deriveTodayAttendanceSummary } from "@/features/attendance/utils/todayAttendance";
import type { AttendanceLog } from "@/types/attendance";

describe("deriveTodayAttendanceSummary", () => {
  it("returns not_checked_in when there are no records for today", () => {
    const summary = deriveTodayAttendanceSummary([]);

    expect(summary.state).toBe("not_checked_in");
    expect(summary.checkInTime).toBeNull();
    expect(summary.checkOutTime).toBeNull();
  });

  it("returns checked_in when latest record has no check-out time", () => {
    const record = createRecord({
      checkInTime: "2026-08-21T03:30:00Z",
      checkOutTime: null
    });

    const summary = deriveTodayAttendanceSummary([record]);

    expect(summary.state).toBe("checked_in");
    expect(summary.checkInTime).toBe("2026-08-21T03:30:00Z");
    expect(summary.checkOutTime).toBeNull();
  });

  it("returns completed when latest record has check-out time", () => {
    const record = createRecord({
      checkInTime: "2026-08-21T03:30:00Z",
      checkOutTime: "2026-08-21T11:45:00Z"
    });

    const summary = deriveTodayAttendanceSummary([record]);

    expect(summary.state).toBe("completed");
    expect(summary.checkInTime).toBe("2026-08-21T03:30:00Z");
    expect(summary.checkOutTime).toBe("2026-08-21T11:45:00Z");
  });
});

function createRecord(overrides: Partial<AttendanceLog>): AttendanceLog {
  return {
    id: "att-1",
    employeeId: "emp-1",
    employeeCode: "EMP001",
    employeeName: "Demo Employee",
    checkInTime: "2026-08-21T03:30:00Z",
    checkOutTime: null,
    workDate: "2026-08-21",
    status: "Present",
    deviceType: "Mobile",
    ...overrides
  };
}
