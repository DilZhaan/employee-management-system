import type { AttendanceLog, TodayAttendanceState } from "@/types/attendance";

export interface TodayAttendanceSummary {
  state: TodayAttendanceState;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  latestRecord: AttendanceLog | null;
}

export function deriveTodayAttendanceSummary(records: AttendanceLog[]): TodayAttendanceSummary {
  const latest = records.reduce<AttendanceLog | null>((current, item) => {
    if (!current) {
      return item;
    }

    return new Date(item.checkInTime).getTime() > new Date(current.checkInTime).getTime() ? item : current;
  }, null);

  if (!latest) {
    return {
      state: "not_checked_in",
      status: "Not checked in",
      checkInTime: null,
      checkOutTime: null,
      latestRecord: null
    };
  }

  if (latest.checkOutTime) {
    return {
      state: "completed",
      status: "Completed",
      checkInTime: latest.checkInTime,
      checkOutTime: latest.checkOutTime,
      latestRecord: latest
    };
  }

  return {
    state: "checked_in",
    status: "Checked in",
    checkInTime: latest.checkInTime,
    checkOutTime: null,
    latestRecord: latest
  };
}
