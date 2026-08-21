import { z } from "zod";
import { isBeforeToday } from "@/lib/date-rules";
import { LEAVE_TYPES } from "@/types/leave";

const dateOnly = (message: string) => z.string().min(1, message).regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.");

export const leaveRequestSchema = z
  .object({
    leaveType: z.enum(LEAVE_TYPES),
    startDate: dateOnly("Start date is required."),
    endDate: dateOnly("End date is required."),
    reason: z.string().trim().min(1, "Reason is required.").max(500, "Reason must be 500 characters or less.")
  })
  .refine((values) => !values.startDate || !values.endDate || values.startDate <= values.endDate, {
    message: "Start date cannot be after end date.",
    path: ["endDate"]
  })
  .refine((values) => !isBeforeToday(values.startDate), {
    message: "Start date cannot be in the past.",
    path: ["startDate"]
  })
  .refine((values) => !isBeforeToday(values.endDate), {
    message: "End date cannot be in the past.",
    path: ["endDate"]
  });

export type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;
